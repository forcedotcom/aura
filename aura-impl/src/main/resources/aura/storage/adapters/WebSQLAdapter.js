/*
 * Copyright (C) 2012 salesforce.com, inc.
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
 * @namespace The WebSQL adapter for storage service implementation
 * @constructor
 */
var WebSQLStorageAdapter = function WebSQLStorageAdapter() {
    this.size = 0;
	
	this.db = openDatabase("webSQLStorageAdapter", "1.0",
			"WebSQLStorageAdapter database", 50 * 1024 * 1024);

	this.createSchema(false);
};

WebSQLStorageAdapter.NAME = "websql";

WebSQLStorageAdapter.prototype.getName = function() {
	return WebSQLStorageAdapter.NAME;
};

WebSQLStorageAdapter.prototype.getSize = function() {
	return this.size;
};

WebSQLStorageAdapter.prototype.getItem = function(key, resultCallback) {
	this.db.readTransaction(function(tx) {
		tx.executeSql("SELECT value, created, expires FROM cache WHERE key = ?;", [key],
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
				
				resultCallback(item);
			}
		);
	});
};

WebSQLStorageAdapter.prototype.setItem = function(key, item) {
	var that = this;
	this.db.transaction(function(tx) {
		tx.executeSql("DELETE FROM cache WHERE key = ?;", [key]);
		
		var value = $A.util["json"].encode(item["value"]);
		tx.executeSql("INSERT INTO cache (key, value, created, expires, size) VALUES (?, ?, ?, ?, ?);", 
				[key, value, item["created"], item["expires"], value.length], function() {
			that.updateSize();
		}, function(tx, error) {
			throw new Error("WebSQLStorageAdapter.setItem() failed: " + error.message);
		});
	});
};

WebSQLStorageAdapter.prototype.removeItem = function(key) {
	var that = this;
	this.db.transaction(function(tx) {
		tx.executeSql("DELETE FROM cache WHERE key = ?;", [key], function() {
			that.updateSize();
		});
	});
};

WebSQLStorageAdapter.prototype.clear = function() {
	this.createSchema(true);
};

WebSQLStorageAdapter.prototype.getExpired = function(resultCallback) {
	this.db.readTransaction(function(tx) {
		var now = new Date().getTime();
		tx.executeSql("SELECT key FROM cache WHERE expires < ?;", [now],
			function(tx, results) {
				var rows = results.rows;

				var expired = [];
				for (var n = 0; n < rows.length; n++) {
					var row = rows.item(n);
					expired.push(row["key"]);
				}
				
				resultCallback(expired);
			}
		);
	});
};

// Internals


WebSQLStorageAdapter.prototype.updateSize = function() {
	// Prime the this.size pump with a SELECT SUM() query
	var that = this;
	this.db.transaction(function(tx) {
		tx.executeSql("SELECT SUM(size) AS totalSize FROM cache;", [],
			function(tx, results) {
				var rows = results.rows;
				that.size = rows.item(0)["totalSize"];
				
				$A.storageService.getStorage().fireModified();
			},
			function(tx, error) {
				throw new Error("WebSQLStorageAdapter.updateSize() failed: " + error.message);
			}
		);
	});
};

WebSQLStorageAdapter.prototype.createSchema = function(dropFirst) {
	if (dropFirst) {
		this.db.transaction(function(tx) {
			tx.executeSql("DROP TABLE cache;");
		});
	}
	
	// Create the schema if it does not already exist
	this.db.transaction(function(tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS cache (key unique, value, created, expires, size);");
	});
	
	this.updateSize();
};

$A.storageService.registerAdapter(WebSQLStorageAdapter.NAME, WebSQLStorageAdapter);
