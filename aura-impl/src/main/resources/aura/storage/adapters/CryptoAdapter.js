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
 * @description The crypto adapter for Aura Storage Service.
 *
 * This adapter provides AES-CBC encryption, using the browser Web Cryptography API
 * (https://dvcs.w3.org/hg/webcrypto-api/raw-file/tip/spec/Overview.html#dfn-GlobalCrypto),
 * on top of the IndexedDB adapter.
 *
 * TODO - should fall back to secure non-persistent storage (memory) if initialization fails.
 * TODO - this adapter should work with any persistent adapter, not just IndexedDB.
 * @constructor
 */
var CryptoAdapter = function CryptoAdapter(config) {
    this.instanceName = config["name"];
    this.debugLoggingEnabled = config["debugLoggingEnabled"];
    this.key = undefined;

    // we need a key before we can process get/set
    this.ready = undefined;
    this.pendingRequests = [];

    // utils to convert to/from ArrayBuffer and Object
    this.encoder = new window["TextEncoder"]();
    this.decoder = new window["TextDecoder"]();

    // async initialize. if it completes successfully, process the queue
    // otherwise reject the pending operations.
    var that = this;
    this.initialize().then(
        function() {
            that.executeQueue(true);
        },
        function() {
            that.executeQueue(false);
        }
    );

    // create the underlying adapter responsible for actual storage
    this.adapter = new Aura.Storage.IndexedDBAdapter(config);
};


/** Name of adapter. */
CryptoAdapter.NAME = "crypto";

/** Encryption algorithm. */
CryptoAdapter.ALGO = "AES-CBC";

/** Initialization vector length (bytes). */
CryptoAdapter.IV_LENGTH = 16;

/** A sentinel value to verify the key against pre-existing data. */
CryptoAdapter.SENTINEL = "cryptoadapter";

/** The Web Cryptography API */
CryptoAdapter.engine = window["crypto"]["subtle"] || window["crypto"]["webkitSubtle"];


/** Promise that resolves with the per-application encryption key. */
CryptoAdapter.key = new Promise(function(resolve, reject) {
    // exposing this resolve/reject isn't pretty but there were issues
    // with a nested non-prototype function (ie placing CryptoAdapter.setKey
    // in this function). so instead we expose these and delete them after
    // setKey() is called.
    CryptoAdapter._keyResolve = resolve;
    CryptoAdapter._keyReject = reject;
});

/**
 * Sets the per-application encryption key.
 * @param {ArrayBuffer} raw - the raw bytes of the encryption key.
 */
CryptoAdapter["setKey"] = function(key) {
    // note: @export is configured only for prototypes so must use array syntax to avoid mangling

    var resolve = CryptoAdapter._keyResolve;
    var reject = CryptoAdapter._keyReject;

    // only allow one invocation and
    delete CryptoAdapter["setKey"];
    delete CryptoAdapter._keyResolve;
    delete CryptoAdapter._keyReject;

    CryptoAdapter.engine["importKey"](
        "raw",                  // format
        key,                    // raw key as an ArrayBuffer
        CryptoAdapter.ALGO,     // algorithm of key
        false,                  // don't allow key export
        ["encrypt", "decrypt"]  // allowed operations
    ).then(
        function(key) {
            // it's possible for key generation to fail, which we treat as a fatal
            // error. all pending and future operations will fail.
            if (!key) {
                var log = "CryptoAdapter crypto.importKey() returned no key, rejecting";
                $A.log(log);
                reject(new Error(log));
            }

            resolve(key);
        },
        function(err) {
            var log = "CryptoAdapter crypto.importKey() failed, rejecting: " + err;
            $A.log(log);
            reject(new Error(log));
        }
    );
};


/**
 * Returns name of the adapter.
 * @returns {String} name of adapter
 */
CryptoAdapter.prototype.getName = function() {
    return CryptoAdapter.NAME;
};

CryptoAdapter.prototype.initialize = function() {
    var that = this;
    return CryptoAdapter.key
    .then(
        function(key) {
            // it's possible for key generation to fail, which we treat as a fatal
            // error. all pending and future operations will fail.
            if (!key) {
                that.log("CryptoAdapter.key resolved with no key, adapter is entering permanent error state");
                throw new Error(that.getInitializationError());
            }

            that.key = key;
        },
        function(err) {
            that.log("CryptoAdapter.key rejected, adpater is entering permanent error state", err);
            throw new Error(that.getInitializationError());
        }
    ).then(function() {
        // check if existing data can be decrypted
        return new Promise(function(resolve, reject) {
            that.getItemInternal(CryptoAdapter.SENTINEL, resolve, reject);
        }).then(
            null,
            function(err) {
                // decryption failed so flush the store. do not re-throw since we've recovered
                return that.adapter.clear();
            }
        );
    });
};


/**
 * Runs the stored queue of requests.
 * @param {Boolean} readyState - true if the adapter is ready; false if the adapter is in permanent error state.
 * @private
 */
CryptoAdapter.prototype.executeQueue = function(readyState) {
    if (this.ready !== undefined) {
        this.log("executeQueue(): attempted to change ready state (old=" + this.ready + ", new=" + readyState + ")");
        return;
    }
    this.ready = readyState;
    this.log("executeQueue(): entered ready=" + this.ready + ", processing " + this.pendingRequests.length + " requests");

    var queue = this.pendingRequests;
    this.pendingRequests = [];
    for (var i = 0; i < queue.length; i++) {
        if (!this.ready) {
            // adapter is in permanent error state, reject all queued promises
            queue[i]["error"](new Error(this.getInitializationError()));
        } else {
            // run the queued logic, which will resolve the promises
            queue[i]["execute"](queue[i]["success"], queue[i]["error"]);
        }
    }
};


/**
 * Gets the error message when adapter fails to initialize.
 * @private
 */
CryptoAdapter.prototype.getInitializationError = function() {
    return "CryptoAdapter '" + this.instanceName + "' adapter failed to initialize";
};


/**
 * Enqueues a function to execute.
 * @param {function} execute the function to execute.
 * @return {Promise} a promise.
 */
CryptoAdapter.prototype.enqueue = function(execute) {
    var that = this;

    if (this.ready === false) {
        return Promise["reject"](new Error(this.getInitializationError()));
    } else if (this.ready === undefined) {
        return new Promise(function(success, error) {
            that.pendingRequests.push({ "execute":execute, "success":success, "error":error });
            if (that.ready !== undefined) {
                // rare race condition
                that.executeQueue();
            }
        });
    }

    // adapter is ready so execute immediately
    return new Promise(function(success, error) { execute(success, error); });
};


/**
 * Returns adapter size.
 * @returns {Promise} Promise with size used in adapter
 */
CryptoAdapter.prototype.getSize = function() {
    return this.adapter.getSize();
};


/**
 * Retrieves an item from storage
 * @param {String} key storage key for item to retrieve
 * @returns {Promise} Promise with item
 */
CryptoAdapter.prototype.getItem = function(key) {
    var that = this;
    return this.enqueue(function(resolve, reject) {
        that.getItemInternal(key, resolve, reject);
    });
};


/**
 * Retrieves an item from storage
 * @param {String} key storage key for item to retrieve
 * @returns {Promise} Promise with item
 */
CryptoAdapter.prototype.getItemInternal = function(key, resolve, reject) {
    var that = this;
    this.adapter.getItem(key)
    .then(function(value) {
        // key not found
        if ($A.util.isUndefinedOrNull(value)) {
            resolve();
            return;
        }

        that.decrypt(value).then(
            function(decrypted) {
                resolve(decrypted);
            },
            function(err) {
                reject(err);
            }
        );
    });
};

/**
 * Decrypts a stored cached entry.
 * @param {CryptoAdapter.Entry} value the cache entry to decrypt
 * @return {Promise} a promise that resolves with the decrypted item.
 * The object consists of {value: *, isExpired: Boolean}.
 * @private
 */
CryptoAdapter.prototype.decrypt = function(value) {
    var that = this;
    return CryptoAdapter.engine["decrypt"]({
            "name": CryptoAdapter.ALGO,
            "iv": value["value"].iv
        },
        that.key,
        value["value"].cipher
    ).then(
        function(decrypted) {
            var obj = that.arrayBufferToObject(new Uint8Array(decrypted));
            return {"expires": value["expires"], "value": obj};
        },
        function(err) {
            that.log("decrypt(): decryption failed", err);
            throw new Error(err);
        }
    );
};


/**
 * Gets all items in storage
 * @returns {Promise} Promise with array of all items
 */
CryptoAdapter.prototype.getAll = function() {
    var that = this;
    var execute = function(success, error) {
        that.adapter.getAll()
        .then(function(items) {
            var results = [];
            var promises = [];

            var captureResults = function(key, decrypted) {
                decrypted["key"] = key;
                results.push(decrypted);
            };

            // use bind() to curry a function specific to each item, capturing its key.
            // decrypt returns only the decrypted value, not the other properties.
            for (var i in items) {
                promises.push(
                        that.decrypt(items[i])
                        .then(captureResults.bind(undefined, items[i]["key"]))
                );
            }

            // when all items are decrypted we can return the full result set
            Promise["all"](promises).then(
                function() {
                    success(results);
                },
                function(err) {
                    error(new Error("getAll(): decryption failed: " + err));
                }
            );

        });

    };
    return this.enqueue(execute);
};


/**
 * Converts an object to an ArrayBuffer.
 * @param {Object} o the object to convert.
 * @private
 */
CryptoAdapter.prototype.objectToArrayBuffer = function(o) {
    // can't JSON serialize undefined so store a (unencrypted) empty buffer
    if (o === undefined) {
        return new ArrayBuffer(0);
    }

    // json encode to a string
    var str = $A.util.json.encode(o);
    // string to array buffer
    return this.encoder["encode"](str);
};


/**
 * Converts an ArrayBuffer to object.
 * @param {ArrayBuffer} ab the ArrayBuffer to convert.
 * @private
 */
CryptoAdapter.prototype.arrayBufferToObject = function(ab) {
    // array buffer to string
    var str = this.decoder["decode"](ab);
    //if empty buffer, we stored undefined
    if (str === "") {
        return undefined;
    }
    // string (of json) to object
    return JSON.parse(str);
};


/**
 * Stores an item in storage.
 * @param {String} key key for item
 * @param {Object} item item to store
 * @returns {Promise} Promise
 */
CryptoAdapter.prototype.setItem = function(key, item) {
    var that = this;
    return this.enqueue(function(resolve, reject) {
        // generate a new initialization vector for every item
        var iv = window["crypto"]["getRandomValues"](new Uint8Array(CryptoAdapter.IV_LENGTH));

        CryptoAdapter.engine["encrypt"]({
                "name": CryptoAdapter.ALGO,
                "iv": iv
            },
            that.key,
            that.objectToArrayBuffer(item["value"])
        ).then(
            function(encrypted) {
                var storable = {
                    "expires": item["expires"],
                    "value": new CryptoAdapter.Entry(iv, encrypted)
                };
                resolve(that.adapter.setItem(key, storable));
            },
            function(err) {
                that.log("setItem(): encryption failed", err);
                reject(err);
            }
        );
    });
};


/**
 * Removes an item from storage.
 * @param {String} key key referencing item to remove
 * @returns {Promise} Promise with removed item
 */
CryptoAdapter.prototype.removeItem = function(key) {
    return this.adapter.removeItem(key);
};


/**
 * Clears storage.
 * @returns {Promise} Promise for clear
 */
CryptoAdapter.prototype.clear = function() {
    return this.adapter.clear();
};


/**
 * Gets the set of expired items.
 *
 * @return {Promise} a promise that will resolve when the operation finishes.
 */
CryptoAdapter.prototype.sweep = function() {
    return this.adapter.sweep();
};


/**
 * Deletes this store.
 * @return {Promise} promise that deletes this store.
 */
CryptoAdapter.prototype.deleteStorage = function() {
    return this.adapter.deleteStorage();
};


/**
 * Log a message to Aura's logger ($A.log).
 * @private
 */
CryptoAdapter.prototype.log = function (msg, obj) {
    if (this.debugLoggingEnabled) {
        $A.log("CryptoAdapter '" + this.instanceName + "' " + msg + ":", obj);
    }
};


Aura.Storage.CryptoAdapter = CryptoAdapter;


/**
 * @description The value object used in the backing store of the CryptoAdapter.
 * @constructor
 */
CryptoAdapter.Entry = function Entry(iv, cipher) {
    this.iv = iv;
    this.cipher = cipher;
};

CryptoAdapter.Entry.prototype.toString = function() {
    return $A.util.json.encode(this);
};

// if a browser supports crypto it'll expose window.crypto. unfortunately the crypto operations will
// fail unless they're run on a "secure origins" (like HTTPS and localhost). see http://sfdc.co/bO9Hok.
// unfortunately adapter registration must be synchronous otherwise the adapter is not available in
// time for aura's boot cycle and thus the "actions" store. so manually check https (production) and
// localhost (dev).
var secure = window.location.href.indexOf('https') === 0 || window.location.hostname === "localhost";
if (secure && window["crypto"] && (window["crypto"]["subtle"] || window["crypto"]["webkitSubtle"])) {
    $A.storageService.registerAdapter({
        "name": CryptoAdapter.NAME,
        "adapterClass": CryptoAdapter,
        "secure": true,
        "persistent": true
    });
}

