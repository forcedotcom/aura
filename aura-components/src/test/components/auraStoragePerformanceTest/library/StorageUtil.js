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
function() {
    /** Constructor */
    function StorageUtil() {}


    /** Default number of entries used to populate storage. */
    StorageUtil.POPULATE_ENTRIES = 50;


    /**
     * Creates a storage with the specified characteristics.
     * @param {String} adapterName the name of the adapter to use.
     * @param {String} name the name of the storage.
     * @param {Number} maxSize the max size of the storage (bytes).
     * @param {Number} initialSize the initial size of the store (bytes).
     * @return {Promise} a promise that resolves with the created storage.
     */
    StorageUtil.prototype.createStorage = function(adapterName, name, maxSize, initialSize) {
        return new Promise(function(resolve, reject) {
            // delete any existing instance
            var storage = $A.storageService.getStorage(name);
            if (storage) {
                $A.storageService.deleteStorage(name);
            }

            // force specific adapter selection
            $A.installOverride("StorageService.selectAdapter", function(){ return adapterName; }, this);
            try {
                storage = $A.storageService.initStorage({
                    name: name,
                    maxSize: maxSize,
                    expiration: 10000,
                    debugLogging: true,
                    version: "1"
                });
            } catch (e) {
                throw new Error("Possible invalid adapter specified (" + adapterName + "). AuraStorageService.initStorage() threw: " + e);
            }

            if (storage.getName() !== adapterName) {
                reject(new Error("Aura Storage Service did not select desired adapter. Wanted " + adapterName + ", got " + storage.getName()));
                return;
            }

            if (initialSize) {
                this._populate(storage, initialSize)
                    .then(function() {
                        resolve(storage);
                    });
                return;
            }

            resolve(storage);
        }.bind(this));
    };


    /**
     * Populates a storage with data.
     * @param {AuraStorage} storage the storage to populate.
     * @param {Number} size the total size of the data to populate (bytes).
     * @param {Number=} entries the number of entries to populate. If unspecified defaults to StorageUtil.POPULATE_ENTRIES.
     * @return {Promise} promise that resolves when population is complete.
     */
    StorageUtil.prototype._populate = function(storage, size, entries) {
        entries = entries || StorageUtil.POPULATE_ENTRIES;

        var entrySize = Math.ceil(size / entries);
        var promises = [];
        var payload;
        for (var i = 0; i < entries; i++) {
            payload = this.generatePayload(entrySize);
            promises.push(storage.set("initial" + i, payload));
        }

        return Promise.all(promises);
    };


    /**
     * Generates a random string payload of the specified size.
     * @param {Number} size the size of the payload.
     */
    StorageUtil.prototype.generatePayload = function(size) {
        var result = "";
        var tmp;
        while (result.length < size) {
            tmp = Math.random().toString(36);
            result += tmp.slice(0, Math.min(tmp.length, (size - result.length)));
        }
        return result;
    };

    return new StorageUtil();
}
