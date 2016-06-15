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
    this.debugLogging = config["debugLogging"];
    this.key = undefined;

    // we need a key before we can process get/set
    this.ready = undefined;
    this.pendingRequests = [];

    // utils to convert to/from ArrayBuffer and Object
    this.encoder = new window["TextEncoder"]();
    this.decoder = new window["TextDecoder"]();

    this.config = config;

    // default storage is indexeddb (alternative is memory adapter)
    // TODO - this indirection is used by auraStorageTest:cryptoFailedAdapter. this needs to be improved.
    var adapterClass = $A.storageService.getAdapterConfig(Aura.Storage.IndexedDBAdapter.NAME)["adapterClass"];
    this.adapter = new adapterClass(config);
    // this.adapter = new Aura.Storage.IndexedDBAdapter(config)

    this.mode = CryptoAdapter.NAME;

    // async initialize. if it completes successfully, process the queue;
    // otherwise reject the pending operations.
    var that = this;
    this.initialize()
        .then(
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

/** Log levels */
CryptoAdapter.LOG_LEVEL = {
    INFO:    { id: 0, fn: "log" },
    WARNING: { id: 1, fn: "warning" }
};

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
 * @param {ArrayBuffer} rawKey the raw bytes of the encryption key
 */
CryptoAdapter["setKey"] = function(rawKey) {
    // note: @export is configured only for prototypes so must use array syntax to avoid mangling
    // note: because this is not instance specific there's no config indicating verbosity, so
    //       always log with $A.log directly

    var resolve = CryptoAdapter._keyResolve;
    var reject = CryptoAdapter._keyReject;
    var log;

    // only allow one invocation and
    delete CryptoAdapter["setKey"];
    delete CryptoAdapter._keyResolve;
    delete CryptoAdapter._keyReject;

    if (!(rawKey instanceof ArrayBuffer)) {
        log = "CryptoAdapter cannot import key of wrong type (" + typeof rawKey + "), rejecting";
        $A.warning(log);
        reject(new Error(log));
        return;
    }

    CryptoAdapter.engine["importKey"](
        "raw",                  // format
        rawKey,                 // raw key as an ArrayBuffer
        CryptoAdapter.ALGO,     // algorithm of key
        false,                  // don't allow key export
        ["encrypt", "decrypt"]  // allowed operations
    )
        .then(
            function(key) {
                // it's possible for key import to fail, which we treat as a fatal
                // error. all pending and future operations will fail.
                if (!key) {
                    log = "CryptoAdapter crypto.importKey() returned no key, rejecting";
                    $A.warning(log);
                    reject(new Error(log));
                    return;
                }
                $A.log("CryptoAdapter crypto.importKey() successfully imported key");
                resolve(key);
            },
            function(e) {
                log = "CryptoAdapter crypto.importKey() failed, rejecting: " + e;
                $A.warning(log);
                reject(new Error(log));
            }
        );
};


/**
 * Registers crypto adapter.
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
 * Returns the name of the adapter.
 * @returns {String} name of adapter
 */
CryptoAdapter.prototype.getName = function() {
    return CryptoAdapter.NAME;
};


CryptoAdapter.prototype.fallbackToMemoryAdapter = function(e) {
    this.log(CryptoAdapter.LOG_LEVEL.WARNING, "initialize(): falling back to memory storage", e);
    $A.metricsService.transaction("aura", "memoryCryptoStorage");
    this.mode = Aura.Storage.MemoryAdapter.NAME; // "memory";
    this.adapter = new Aura.Storage.MemoryAdapter(this.config);
};


/**
 * Initializes the adapter by waiting for the app-wide crypto key to be set,
 * then validates the key works for items already in persistent storage. If a
 * valid key is not provided the adapter moves to fallback mode, storing items
 * in memory.
 * @private
 */
CryptoAdapter.prototype.initialize = function() {
    var that = this;

    if (!$A.util.isLocalStorageEnabled()) {
        this.fallbackToMemoryAdapter("DisabledLocalStorage");
        // do not throw an error so the promise moves to resolve state
        return Promise["resolve"]();
    }

    return CryptoAdapter.key
        .then(
            function(key) {
                // it's possible for key generation to fail, which we treat as a fatal
                // error. all pending and future operations will fail.
                if (!key) {
                    throw new Error("CryptoAdapter.key resolved with no key."); // move to reject state
                }
                that.key = key;
            },
            function(e) {
                throw new Error("CryptoAdapter.key rejected: " + e); // maintain reject state
            }
        ).then(
            function() {
                // check if existing data can be decrypted
                return new Promise(function(resolve, reject) {
                    that.log(CryptoAdapter.LOG_LEVEL.INFO, "initialize(): checking encryption key status");
                    that.getItemsInternal([CryptoAdapter.SENTINEL], resolve, reject);
                }).then(
                    undefined,
                    function() {
                        // decryption failed so flush the store. do not re-throw since we've recovered
                        that.log(CryptoAdapter.LOG_LEVEL.INFO, "initialize(): encryption key is different so clearing storage");
                        $A.metricsService.transaction("aura", "initializeCryptoStorage");
                        return that.adapter.clear();
                    }
                );
            },
            function(e) {
                that.fallbackToMemoryAdapter(e);
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


/**
 * Runs the stored queue of requests.
 * @param {Boolean} readyState true if the adapter is ready; false if the adapter is in permanent error state
 * @private
 */
CryptoAdapter.prototype.executeQueue = function(readyState) {
    if (this.ready === undefined) {
        this.ready = readyState;

        if (!this.ready) {
            this.log(CryptoAdapter.LOG_LEVEL.WARNING, "executeQueue(): entered permanent error state. All future operations will fail. Failing " + this.pendingRequests.length + " enqueued operations.");
        } else {
            this.log(CryptoAdapter.LOG_LEVEL.INFO, "executeQueue(): entered ready state. Processing " + this.pendingRequests.length + " operations.");
        }
    }

    var queue = this.pendingRequests;
    this.pendingRequests = [];
    for (var i = 0; i < queue.length; i++) {
        if (!this.ready) {
            // adapter is in permanent error state, reject all queued promises
            queue[i]["reject"](new Error(this.getInitializationError()));
        } else {
            try {
                // run the queued logic, which will resolve the promises
                queue[i]["execute"](queue[i]["resolve"], queue[i]["reject"]);
            } catch (e) {
                var message = "executeQueue(): error processing queue: "+e;
                this.log(CryptoAdapter.LOG_LEVEL.WARNING, message);
                queue[i]["reject"](new Error("CryptoAdapter."+message));

            }
        }
    }
};


/**
 * Gets the error message when adapter fails to initialize.
 * @private
 */
CryptoAdapter.prototype.getInitializationError = function() {
    // should use same format as log()
    return "CryptoAdapter '" + this.instanceName + "' adapter failed to initialize";
};


/**
 * Enqueues a function to execute.
 * @param {function} execute the function to execute
 * @returns {Promise} a promise that resolves when the function is executed
 * @private
 */
CryptoAdapter.prototype.enqueue = function(execute) {
    var that = this;

    // adapter is ready so execute immediately
    if (this.ready === true) {
        return new Promise(function(resolve, reject) { execute(resolve, reject); });
    }
    // adapter is in permanent error state
    else if (this.ready === false) {
        return Promise["reject"](new Error(this.getInitializationError()));
    }

    // adapter not yet initialized
    return new Promise(function(resolve, reject) {
        that.pendingRequests.push({ "execute":execute, "resolve":resolve, "reject":reject});
        if (that.ready !== undefined) {
            // rare race condition. intentionally do not pass a new ready state.
            that.executeQueue();
        }
    });
};


/**
 * Returns adapter size.
 * @returns {Promise} a promise that resolves with the size in bytes
 */
CryptoAdapter.prototype.getSize = function() {
    return this.adapter.getSize();
};


/**
 * Retrieves items from storage.
 * @param {String[]} [keys] The set of keys to retrieve. Undefined to retrieve all items.
 * @param {Boolean} [includeExpired] True to return expired items, false to not return expired items.
 * @returns {Promise} A promise that resolves with an array of the items.
 */
CryptoAdapter.prototype.getItems = function(keys /*, includeExpired*/) {
    // TODO - optimize by respecting includeExpired
    var that = this;
    var execute = function getIems(resolve, reject) {
        that.getItemsInternal(keys, resolve, reject);
    };
    return this.enqueue(execute);
};


/**
 * Retrieves items from storage.
 * @param {String[]} keys The keys of the items to retrieve.
 * @param {Function} resolve Promise resolve function.
 * @param {Function} reject Promise resolve function.
 * @private
 */
CryptoAdapter.prototype.getItemsInternal = function(keys, resolve, reject) {
    var that = this;
    this.adapter.getItems(keys)
        .then(
            function(values) {
                if (!that.isCrypto()) {
                    return values;
                }

                var decrypted = {};
                function collector(k, decryptedValue) {
                    // do not return the sentinel. note that we did verify it decrypts correctly.
                    if (k !== CryptoAdapter.SENTINEL) {
                        decrypted[k] = decryptedValue;
                    }
                }

                var promises = [];
                var promise, value;
                for (var key in values) {
                    value = values[key];
                    if ($A.util.isUndefinedOrNull(value)) {
                        decrypted[key] = undefined;
                    } else {
                        promise = that.decrypt(value).then(collector.bind(undefined, key));
                        promises.push(promise);
                    }
                }

                return Promise["all"](promises)
                    .then(function() {
                        return decrypted;
                    });
            }
        )
        .then(
            function(decrypted) {
                resolve(decrypted);
            },
            function(e) {
                reject(e);
            }
        );
};


/**
 * Decrypts a stored cached entry.
 * @param {Object} value The cache entry to decrypt.
 * @returns {Promise} Promise that resolves with the decrypted item.
 * The object consists of {value: *, isExpired: Boolean}.
 * @private
 */
CryptoAdapter.prototype.decrypt = function(value) {
    var that = this;

    return CryptoAdapter.engine["decrypt"](
            {
                "name": CryptoAdapter.ALGO,
                "iv": value["value"]["iv"]
            },
            that.key,
            value["value"]["cipher"]
        )
        .then(
            function(decrypted) {
                var obj = that.arrayBufferToObject(new Uint8Array(decrypted));
                return {"expires": value["expires"], "value": obj};
            },
            function(err) {
                that.log(CryptoAdapter.LOG_LEVEL.WARNING, "decrypt(): decryption failed", err);
                throw new Error(err);
            }
        );
};


/**
 * Converts an object to an ArrayBuffer.
 * @param {Object} o The object to convert.
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
 * @param {ArrayBuffer} ab The ArrayBuffer to convert.
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
 * Stores entry used to determine whether encryption key provided can decrypt the store.
 * @returns {Promise} Promise that resolves when the item is stored.
 */
CryptoAdapter.prototype.setSentinalItem = function() {
    return new Promise(function(resolve, reject) {
        var tuple = [
            CryptoAdapter.SENTINEL,
            {
                "value": CryptoAdapter.SENTINEL,
                "expires": new Date().getTime() + 15768000000 // 1/2 year
            },
            0
        ];
        this.setItemsInternal([tuple], resolve, reject);
    }.bind(this));
};


/**
 * Stores items in storage.
 * @param {Array} tuples An array of key-value-size pairs. Eg <code>[ [key1, value1, size1], [key2, value2, size2] ]</code>.
 * @returns {Promise} A promise that resolves when the items are stored.
 */
CryptoAdapter.prototype.setItems = function(tuples) {
    var that = this;
    return this.enqueue(function(resolve, reject) {
        that.setItemsInternal(tuples, resolve, reject);
    });
};


/**
 * Encrypts a tuple.
 * @param {Array} tuple An array of key-value-size.
 * @return {Promise} Promise that resolves to a tuple of key-encrypted value-size.
 */
CryptoAdapter.prototype.encryptToTuple = function(tuple) {
    var that = this;
    return new Promise(function(resolve, reject) {
        var itemArrayBuffer;
        try {
            // if json serialization errors then reject
            itemArrayBuffer = that.objectToArrayBuffer(tuple[1]["value"]);
        } catch (e) {
            that.log(CryptoAdapter.LOG_LEVEL.WARNING, "encryptToTuple(): serialization failed for key " + tuple[0], e);
            reject(e);
            return;
        }

        // generate a new initialization vector for every item
        var iv = window["crypto"]["getRandomValues"](new Uint8Array(CryptoAdapter.IV_LENGTH));
        CryptoAdapter.engine["encrypt"](
                {
                    "name": CryptoAdapter.ALGO,
                    "iv": iv
                },
                that.key,
                itemArrayBuffer
            )
            .then(
                function (encrypted) {
                    var storable = {
                        "expires": tuple[1]["expires"],
                        "value": {"iv": iv, "cipher": encrypted}
                    };
                    resolve([tuple[0], storable, tuple[2]]);
                },
                function (err) {
                    that.log(CryptoAdapter.LOG_LEVEL.WARNING, "encryptToTuple(): encryption failed for key " + tuple[0], err);
                    reject(err);
                }
            );
    });
};


/**
 * Stores items in storage.
 * @param {Array} tuples An array of key-value-size pairs.
 * @param {Function} resolve Promise resolve function.
 * @param {Function} reject Promise resolve function.
 * @private
 */
CryptoAdapter.prototype.setItemsInternal = function(tuples, resolve, reject) {
    var that = this;
    if (!this.isCrypto()) {
        resolve(this.adapter.setItems(tuples));
        return;
    }

    // encrypt into tuples
    var promises = [];
    var tuple;
    for (var i = 0; i < tuples.length; i++) {
        tuple = tuples[i];
        promises.push(this.encryptToTuple(tuple));
    }

    Promise["all"](promises).then(
        function(encryptedTuples) {
            resolve(that.adapter.setItems(encryptedTuples));
        },
        function (err) {
            var keys = tuples.map(function(t) { return t[0]; });
            that.log(CryptoAdapter.LOG_LEVEL.WARNING, "setItemsInternal(): transaction error for keys "+keys.toString(), err);
            reject(err);
        }
    );
};


/**
 * Removes items from storage.
 * @param {String[]} keys The keys of the items to remove.
 * @returns {Promise} A promise that resolves when all items are removed.
 */
CryptoAdapter.prototype.removeItems = function(keys) {
    var that = this;
    return this.enqueue(function(resolve, reject) {
        that.removeItemsInternal(keys, resolve, reject);
    });
};


/**
 * Removes items from storage.
 * @param {String[]} keys The kets of the items to remove.
 * @param {Function} resolve Promise resolve function.
 * @param {Function} reject Promise resolve function.
 */
CryptoAdapter.prototype.removeItemsInternal = function(keys, resolve, reject) {
    this.adapter.removeItems(keys).then(resolve, reject);
};


/**
 * Clears storage.
 * @returns {Promise} a promise that resolves when the store is cleared
 */
CryptoAdapter.prototype.clear = function() {
    // TODO - should re-set sentinel key after a clear
    return this.adapter.clear();
};


/**
 * Sweeps over the store to evict expired items.
 * @returns {Promise} a promise that resolves when the sweep is complete.
 */
CryptoAdapter.prototype.sweep = function() {
    return this.adapter.sweep();
};


/**
 * Deletes this storage.
 * @returns {Promise} a promise that resolves when storage is deleted
 */
CryptoAdapter.prototype.deleteStorage = function() {
    return this.adapter.deleteStorage();
};


/**
 * Suspends eviction.
 */
CryptoAdapter.prototype.suspendSweeping = function() {
    if (this.adapter.suspendSweeping) {
        this.adapter.suspendSweeping();
    }
};


/**
 * Resumes eviction.
 */
CryptoAdapter.prototype.resumeSweeping = function() {
    if (this.adapter.resumeSweeping) {
        this.adapter.resumeSweeping();
    }
};


/**
 * @returns {Boolean} whether the adapter is secure.
 */
CryptoAdapter.prototype.isSecure = function() {
    return true;
};


/**
 * @returns {Boolean} whether the adapter is persistent.
 */
CryptoAdapter.prototype.isPersistent = function() {
    return this.mode === CryptoAdapter.NAME;
};


/**
 * Logs a message.
 * @param {CryptoAdapter.LOG_LEVEL} level log line level
 * @param {String} msg the log message
 * @param {Object} [obj] optional log payload
 * @private
 */
CryptoAdapter.prototype.log = function (level, msg, obj) {
    if (this.debugLogging || level.id >= CryptoAdapter.LOG_LEVEL.WARNING.id) {
        $A[level.fn]("CryptoAdapter '"+this.instanceName+"' "+msg, obj);
    }
};


Aura.Storage.CryptoAdapter = CryptoAdapter;

// export crypto adapter as $A.storageService.CryptoAdapter exposing effectively
// only the non-mangled functions. not using @export because it exports the
// constructor function which is not desired.
AuraStorageService.prototype["CryptoAdapter"] = CryptoAdapter;
