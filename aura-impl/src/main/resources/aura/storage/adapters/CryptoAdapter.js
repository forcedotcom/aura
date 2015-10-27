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
 * (https://dvcs.w3.org/hg/webcrypto-api/raw-file/tip/spec/Overview.html#dfn-GlobalCrypto)
 * with a server-provided key, persisting into the IndexedDB adapter.
 *
 * Unlike other storage adapters this adapter does not automatically register itself. Use
 * &lt;auraStorage:crypto/&gt; in the &lt;auraPreInitBlock/&gt; section of the app's template
 * to register this adapter. Doing so guarantees that CryptoAdapter.setKey() will be invoked
 * with a server-provided cryptographic key.
 *
 * Please note:
 * 1. If the runtime environment doesn't support the Web Cryptography API the adapter is not
 *    registered.
 * 2. After registration and before a cryptographic key is provided, all crypto adapters
 *    enter an initialization stage. Get, put, and remove operations are queued until
 *    the key is set. If a key is never provided then the operations appear paused. It's
 *    thus paramount to always provide a key. &lt;auraStorage:crypto/&gt; ensures this
 *    happens.
 * 3. If an invalid cryptographic key is provided, the adapter automatically falls
 *    back to the memory adapter to provide secure but non-persistent storage.
 *
 * @constructor
 */
function CryptoAdapter(config) {
    this.instanceName = config["name"];
    this.debugLoggingEnabled = config["debugLoggingEnabled"];
    this.key = undefined;

    // we need a key before we can process get/set
    this.ready = undefined;
    this.pendingRequests = [];

    // utils to convert to/from ArrayBuffer and Object
    this.encoder = new window["TextEncoder"]();
    this.decoder = new window["TextDecoder"]();

    this.config = config;

    // default storage is indexeddb (alternative is memory adapter)
    this.adapter = new Aura.Storage.IndexedDBAdapter(config);
    this.mode = CryptoAdapter.NAME;

    // async initialize. if it completes successfully, process the queue;
    // otherwise reject the pending operations.
    var that = this;
    this.initialize().then(
        function() {
            that.executeQueue(true);
        },
        function() {
            // Reject on initialize should be rare because we use memory storage as alternate
            that.executeQueue(false);
        }
    );
}

/** Name of adapter. */
CryptoAdapter.NAME = "crypto";

/** Encryption algorithm. */
CryptoAdapter.ALGO = "AES-CBC";

/** Initialization vector length (bytes). */
CryptoAdapter.IV_LENGTH = 16;

/** A sentinel value to verify the key against pre-existing data. */
CryptoAdapter.SENTINEL = "cryptoadapter";

/** The Web Cryptography API */
CryptoAdapter.engine = window["crypto"] && (window["crypto"]["subtle"] || window["crypto"]["webkitSubtle"]);


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
 * @param {ArrayBuffer} rawKey - the raw bytes of the encryption key.
 */
CryptoAdapter["setKey"] = function(rawKey) {
    // note: @export is configured only for prototypes so must use array syntax to avoid mangling
    // note: because this is not instance specific there's no config indicating verbosity, so
    //       always log with $A.log directly

    var resolve = CryptoAdapter._keyResolve;
    var reject = CryptoAdapter._keyReject;

    // only allow one invocation and
    delete CryptoAdapter["setKey"];
    delete CryptoAdapter._keyResolve;
    delete CryptoAdapter._keyReject;

    CryptoAdapter.engine["importKey"](
        "raw",                  // format
        rawKey,                 // raw key as an ArrayBuffer
        CryptoAdapter.ALGO,     // algorithm of key
        false,                  // don't allow key export
        ["encrypt", "decrypt"]  // allowed operations
    ).then(
        function(key) {
            // it's possible for key import to fail, which we treat as a fatal
            // error. all pending and future operations will fail.
            if (!key) {
                var log = "CryptoAdapter crypto.importKey() returned no key, rejecting";
                $A.log(log);
                reject(new Error(log));
            }
            $A.log("CryptoAdapter crypto.importKey() successfully imported key");
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
 * Register crypto adapter
 */
CryptoAdapter["register"] = function() {
    // if a browser supports crypto it'll expose window.crypto. unfortunately the crypto operations will
    // fail unless they're run on a "secure origins" (like HTTPS and localhost). see http://sfdc.co/bO9Hok.
    // unfortunately adapter registration must be synchronous otherwise the adapter is not available in
    // time for aura's boot cycle and thus the "actions" store. so manually check https (production) and
    // localhost (dev).
    //
    // moreover, indexeddb needs to be useable (browser implemented properly) in order to use crypto so we
    // first check for indexeddb. when both are unavailable or unusable, memory storage will become the default.
    if ($A.storageService.isRegisteredAdapter(CryptoAdapter.NAME)) {
        $A.warning("CryptoAdapter already registered");
        return;
    }

    if (!$A.storageService.isRegisteredAdapter(Aura.Storage.IndexedDBAdapter.NAME)) {
        $A.warning("CryptoAdapter cannot register because it requires IndexedDB");
        return;
    }

    var secure = window.location.href.indexOf('https') === 0 || window.location.hostname === "localhost";
    if (!secure) {
        $A.warning("CryptoAdapter cannot register because it requires a secure origin");
        return;
    }

    if (!CryptoAdapter.engine) {
        $A.warning("CryptoAdapter cannot register because it requires Web Cryptography API");
        return;
    }

    $A.storageService.registerAdapter({
        "name": CryptoAdapter.NAME,
        "adapterClass": CryptoAdapter,
        "secure": true,
        "persistent": true
    });
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
                var log = "CryptoAdapter.key resolved with no key.";
                that.log(log);
                throw new Error(log); // move to reject state
            }
            that.key = key;
        },
        function(err) {
            var log = "CryptoAdapter.key rejected: " + err;
            that.log(log);
            throw new Error(log); // maintain reject state
        }
    ).then(
        function() {
            // check if existing data can be decrypted
            return new Promise(function(resolve, reject) {
                that.log("Checking encryption key status");
                that.getItemInternal(CryptoAdapter.SENTINEL, resolve, reject);
            }).then(
                null,
                function() {
                    // decryption failed so flush the store. do not re-throw since we've recovered
                    that.log("Encryption key is different so clearing storage");
                    return that.adapter.clear();
                }
            );
        },
        function() {
            that.log("Falling back to memory storage.");
            that.mode = Aura.Storage.MemoryAdapter.NAME; // "memory";
            that.adapter = new Aura.Storage.MemoryAdapter(that.config);
            // do not throw an error so the promise moves to resolve state
        }
    ).then(
        function() {
            return that.setSentinalItem();
        }
    );
};

/**
 * Gets whether the crypto adapter is running in standard mode (secure and persistent) or fallback
 * mode (secure and not persistent).
 *
 * @returns {Boolean} True if the adapter is secure and persistent; false if the adapter is secure
 * and not persistent.
 */
CryptoAdapter.prototype.isCrypto = function() {
    return this.mode === CryptoAdapter.NAME;
};

//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
//export isCrypto for tests
CryptoAdapter.prototype["isCrypto"] = CryptoAdapter.prototype.isCrypto;
//#end

/**
 * Runs the stored queue of requests.
 * @param {Boolean} readyState true if the adapter is ready; false if the adapter is in permanent error state.
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
 * @returns {Promise} a promise.
 * @private
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
    return new Promise(function(resolve, reject) { execute(resolve, reject); });
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
 * @returns {Promise} a promise that resolves with the item or null if not found.
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
 * @returns {Promise} a promise that resolves with the item or null if not found.
 * @private
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

        if (that.isCrypto()) {
            that.decrypt(value).then(
                function (decrypted) {
                    resolve(decrypted);
                },
                function (err) {
                    reject(err);
                }
            );
        } else {
            resolve(value);
        }
    });
};

/**
 * Decrypts a stored cached entry.
 * @param {CryptoAdapter.Entry} value the cache entry to decrypt
 * @returns {Promise} a promise that resolves with the decrypted item.
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

            if (that.isCrypto()) {
                var results = [];
                var promises = [];

                var captureResults = function (key, decrypted) {
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
                    function () {
                        success(results);
                    },
                    function (err) {
                        error(new Error("getAll(): decryption failed: " + err));
                    }
                );
            } else {
                success(items);
            }

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
 * Stores entry used to determine whether encryption key provided can decrypt the entry.
 * @returns {Promise} Promise
 */
CryptoAdapter.prototype.setSentinalItem = function() {
    return new Promise(function(resolve, reject) {
        this.setItemInternal(CryptoAdapter.SENTINEL, {
            "value": CryptoAdapter.SENTINEL,
            "expires": new Date().getTime() + 3000000
        }, 0, resolve, reject);
    }.bind(this));
};

/**
 * Stores an item in storage.
 * @param {String} key key for item
 * @param {Object} item item to store
 * @param {Number} size of item
 * @returns {Promise} Promise
 */
CryptoAdapter.prototype.setItem = function(key, item, size) {
    var that = this;
    return this.enqueue(function(resolve, reject) {
        that.setItemInternal(key, item, size, resolve, reject);
    });
};

/**
 * Stores an item in storage.
 * @param {String} key key for item
 * @param {Object} item item to store
 * @param {Number} size of item
 * @param {Function} resolve function
 * @param {Function} reject function
 * @private
 */
CryptoAdapter.prototype.setItemInternal = function(key, item, size, resolve, reject) {
    var that = this;
    if (this.isCrypto()) {

        var itemArrayBuffer;
        try {
            // in case json serialize produces error, we still reject
            itemArrayBuffer = this.objectToArrayBuffer(item["value"]);
        } catch (e) {
            this.log("setItem(): encryption failed", e);
            reject(e);
            return;
        }

        // generate a new initialization vector for every item
        var iv = window["crypto"]["getRandomValues"](new Uint8Array(CryptoAdapter.IV_LENGTH));
        CryptoAdapter.engine["encrypt"]({
                "name": CryptoAdapter.ALGO,
                "iv": iv
            },
            this.key,
            itemArrayBuffer
        ).then(
            function (encrypted) {
                var storable = {
                    "expires": item["expires"],
                    "value": new CryptoAdapter.Entry(iv, encrypted)
                };
                resolve(that.adapter.setItem(key, storable, size));
            },
            function (err) {
                that.log("setItem(): encryption failed", err);
                reject(err);
            }
        );
    } else {
        resolve(this.adapter.setItem(key, item, size));
    }
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
 * @returns {Promise} a promise that will resolve when the operation finishes.
 */
CryptoAdapter.prototype.sweep = function() {
    return this.adapter.sweep();
};


/**
 * Deletes this store.
 * @returns {Promise} promise that deletes this store.
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
        $A.log("CryptoAdapter" +
                (this.mode === CryptoAdapter.NAME ? "" : " (fallback mode)") +
                " '" + this.instanceName + "' " + msg, obj);
    }
};

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


Aura.Storage.CryptoAdapter = CryptoAdapter;

// export crypto adapter as $A.storageService.CryptoAdapter exposing effectively
// only the non-mangled functions. not using @export because it exports the
// constructor function which is not desired.
AuraStorageService.prototype["CryptoAdapter"] = CryptoAdapter;
