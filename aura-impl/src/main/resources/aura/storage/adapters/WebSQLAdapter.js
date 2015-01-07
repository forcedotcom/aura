/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint sub: true */
/**
 * @description The WebSQL adapter for storage service implementation
 * @constructor
 */
var WebSQLStorageAdapter = function WebSQLStorageAdapter(config) {
    this.size = 0;

    this.createSchemaInProgress = false;
    this.createSchemaSuccessCallbacks = [];
    this.createSchemaErrorCallbacks = [];

    var instanceName = "AIS:" + config["name"];
    this.db = openDatabase(instanceName, "1.0", instanceName + " database", 50 * 1024 * 1024);

    this.createSchema();
};

WebSQLStorageAdapter.NAME = "websql";

WebSQLStorageAdapter.prototype.getName = function() {
    return WebSQLStorageAdapter.NAME;
};

WebSQLStorageAdapter.prototype.getSize = function() {
    var that = this;
    return new Promise(function(success, error) {
        success(that.size);
    });
};

WebSQLStorageAdapter.prototype.getItem = function(key) {
    var that = this;
    var promise = new Promise(function(success, error) {
        that.db.readTransaction(
            function(tx) {
                tx.executeSql(
                    "SELECT value, created, expires FROM cache WHERE key = ?;",
                    [key],
                    function(tx, results) {
                        var rows = results.rows;

                        var item;
                        if (rows.length > 0) {
                            var row = rows.item(0);

                            item = {
                                "value": $A.util["json"].decode(row["value"]),
                                "created": row["created"],
                                "expires": row["expires"]
                            };
                        }

                        success(item);
                    },
                    function(transaction, errorMsg) { error(errorMsg); });
            },
            error
        );
    });

    return promise;
};

/**
 * Get all items from storage
 * @returns {Promise} Promise with array of all rows
 */
WebSQLStorageAdapter.prototype.getAll = function() {
    var that = this;
    var promise = new Promise(function(success, error) {
        that.db.readTransaction(
            function(tx) {
                tx.executeSql(
                    "SELECT key, value, created, expires FROM cache ORDER BY key ASC;",
                    [],
                    function(tx, results) {
                        var values = [];
                        var rows = results.rows;
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows.item(i);

                            values.push({
                                key: row["key"],
                                value: $A.util["json"].decode(row["value"]),
                                created: row["created"],
                                expires: row["expires"]
                            });
                        }

                        success(values);
                    },
                    function(transaction, errorMsg) { error(errorMsg); }
                );
            },
            error
        );
    });

    return promise;
};

WebSQLStorageAdapter.prototype.setItem = function(key, item) {
    var that = this;
    var promise = new Promise(function(success, error) {
        that.db.transaction(
            function(tx) {
                tx.executeSql(
                    "DELETE FROM cache WHERE key = ?;",
                    [key],
                    function() {
                        var value = $A.util["json"].encode(item["value"]);
                        tx.executeSql(
                            "INSERT INTO cache (key, value, created, expires, size) VALUES (?, ?, ?, ?, ?);",
                            [key, value, item["created"], item["expires"], value.length],
                            function() { that.updateSize(success); },
                            function(transaction, errorMsg) { error(errorMsg); });
                    },
                    function(transaction, errorMsg) { error(errorMsg); }
                );
            },
            error
        );
    });

    return promise;
};

WebSQLStorageAdapter.prototype.removeItem = function(key) {
    var that = this;
    var promise = new Promise(function(success, error) {
        that.db.transaction(
            function(tx) {
                tx.executeSql(
                    "DELETE FROM cache WHERE key = ?;",
                    [key],
                    function() { that.updateSize(success); },
                    function(transaction, errorMsg) { error(errorMsg); });
            },
            error
        );
    });
    return promise;
};

WebSQLStorageAdapter.prototype.clear = function() {
    var that = this;
    return new Promise(function(success, error) {
        that.createSchema(success, error);
    });
};

WebSQLStorageAdapter.prototype.getExpired = function() {
    var that = this;
    var promise = new Promise(function(success, error) {
        that.db.readTransaction(
            function(tx) {
                var now = new Date().getTime();
                tx.executeSql(
                    "SELECT key FROM cache WHERE expires < ?;",
                    [now],
                    function(tx, results) {
                        var rows = results.rows;

                        var expired = [];
                        for (var n = 0; n < rows.length; n++) {
                            var row = rows.item(n);
                            expired.push(row["key"]);
                        }

                        success(expired);
                    },
                    function(transaction, errorMsg) {
                        if (errorMsg.message.indexOf("no such table: cache") > -1) {
                            success([]);
                        } else {
                            error(errorMsg);
                        }
                    }
                );
            },
            error
        );
    });

    return promise;
};

// Internals


WebSQLStorageAdapter.prototype.updateSize = function(sizeUpdatedCallback) {
    // Prime the this.size pump with a SELECT SUM() query
    var that = this;
    this.db.transaction(
        function(tx) {
            tx.executeSql(
                "SELECT SUM(size) AS totalSize FROM cache;",
                [],
                function(tx, results) {
                    var rows = results.rows;
                    that.size = rows.item(0)["totalSize"];

                    if (sizeUpdatedCallback) {
                        sizeUpdatedCallback();
                    }
                    $A.storageService.fireModified();
                },
                function(tx, error) {
                    throw new Error("WebSQLStorageAdapter.updateSize() failed: " + error.message);
                }
            );
        }
    );
};

WebSQLStorageAdapter.prototype.createSchema = function(successCallback, errorCallback) {
    var that = this;

    // Schema creation is asynchronous and multiple calls to it can occur before the first call completes.
    // Use the success/failure of any active call to satisfy any other calls.
    if (successCallback) {
        that.createSchemaSuccessCallbacks.push(successCallback);
    }
    if (errorCallback) {
        that.createSchemaErrorCallbacks.push(errorCallback);
    }

    if (that.createSchemaInProgress) {
        return;
    } else {
        that.createSchemaInProgress = true;
    }

    function processSuccess() {
        that.updateSize(function() {
            var successCallbacks = that.createSchemaSuccessCallbacks;
            that.createSchemaSuccessCallbacks = [];
            that.createSchemaErrorCallbacks = [];
            $A.util.forEach(successCallbacks, function(callback) { callback(); });
            that.createSchemaInProgress = false;
        });
    }

    function processError(transaction, error) {
        var errorCallbacks = that.createSchemaErrorCallbacks;
        that.createSchemaSuccessCallbacks = [];
        that.createSchemaErrorCallbacks = [];
        $A.util.forEach(errorCallbacks, function(callback) { callback(error); });
        that.createSchemaInProgress = false;
    }

    function createCacheTable() {
        that.db.transaction(
            function (tx) {
                tx.executeSql(
                    "CREATE TABLE IF NOT EXISTS cache (key unique, value, created, expires, size);",
                    [],
                    processSuccess,
                    processError
                );
            }
        );
    }

    function deleteCacheTable(success) {
        that.db.transaction(
            function (tx) {
                tx.executeSql(
                    "DROP TABLE IF EXISTS cache;",
                    [],
                    success,
                    processError
                );
            }
        );
    }

    deleteCacheTable(createCacheTable);
};

// Only register this adapter if the WebSQL API is present
if (window.openDatabase) {
    $A.storageService.registerAdapter({
        "name": WebSQLStorageAdapter.NAME,
        "adapterClass": WebSQLStorageAdapter,
        "persistent": true
    });
}