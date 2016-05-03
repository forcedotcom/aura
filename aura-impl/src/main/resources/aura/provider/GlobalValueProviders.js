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
 * @description Global Value Provider. Holds global values: $Label, $Browser, $Locale, etc
 *
 * The interface required of a global value provider is:
 * <ul>
 *   <li>merge: merge a set of values from the server (if values come from the server)
 *   <li>get: get a single value from the GVP
 *   <li>getStorableValues[optional] get a storable version of the GVP values
 *   <li>getValues: get a set of values that can be exposed.
 *   <li>set[optional]: set a value on the provider
 * </ul>
 *
 * @param {Object} gvp an optional serialized GVP to load.
 * @param {Function} initCallback an optional callback invoked after the GVP has finished its
 *  asynchronous initialization.
 * @constructor
 * @export
 */
function GlobalValueProviders (gvp, initCallback) {
    this.valueProviders = {
        "$Browser" : new Aura.Provider.ObjectValueProvider(gvp["$Browser"]),
        "$Label": new Aura.Provider.LabelValueProvider(gvp["$Label"]),
        "$Locale": new Aura.Provider.ObjectValueProvider(gvp["$Locale"]),
        "$Global": new Aura.Provider.ContextValueProvider(gvp["$Global"])
    };

    for(var type in gvp){
        if (["$Browser", "$Label", "$Locale", "$Global"].indexOf(type) >= 0) {
            continue;
        }

        $A.assert(this.valueProviders[type]==null,"$A.globalValueProviders.ctor(): '"+type+"' has already been registered.");
        // work around the obfuscation logic to allow external GVPs
        var valueProvider = gvp[type];
        valueProvider.getValues = valueProvider.getValues || valueProvider["getValues"];
        valueProvider.get       = valueProvider.get       || valueProvider["get"];
        valueProvider.merge     = valueProvider.merge     || valueProvider["merge"];
        this.valueProviders[type] = valueProvider;
    }

    var that = this;
    this.loadFromStorage(function() {
        that.load(gvp);
        if (initCallback) {
            initCallback(that);
        }
    });
}

/**
 * Persistent storage key for GVPs.
 */
GlobalValueProviders.prototype.STORAGE_KEY = "globalValueProviders";


/**
 * Key to use of the MutexLocker to guarantee atomic execution across tabs.
 */
GlobalValueProviders.prototype.MUTEX_KEY = "GlobalValueProviders";

/**
 * Function to release the mutex, set while the mutex is held.
 */
GlobalValueProviders.prototype.mutexUnlock = undefined;

/**
 * Merges new GVPs with existing and saves to storage
 *
 * @param {Object} gvps
 * @param {Boolean} doNotPersist
 * @protected
 */
GlobalValueProviders.prototype.merge = function(gvps, doNotPersist) {
    if (!gvps) {
        return;
    }
    var valueProvider, i, storage, type, newGvp, values;

    for ( i = 0; i < gvps.length; i++) {
        newGvp = gvps[i];
        type = newGvp["type"];
        if (!this.valueProviders[type]) {
            this.valueProviders[type] = new Aura.Provider.ObjectValueProvider();
        }
        valueProvider = this.valueProviders[type];
        if (valueProvider.merge) {
            // set values into its value provider
            valueProvider.merge(newGvp["values"]);
        }else{
            $A.util.apply(valueProvider,newGvp["values"],true);
        }
        $A.expressionService.updateGlobalReferences(type,newGvp["values"]);
    }
    if (doNotPersist) {
        return;
    }

    // persist our set of valueProviders in storage
    storage = this.getStorage();
    if (storage) {
        var toStore = [];
        for (type in this.valueProviders) {
            if (this.valueProviders.hasOwnProperty(type)) {
                valueProvider = this.valueProviders[type];
                values = valueProvider.getStorableValues ? valueProvider.getStorableValues() : (valueProvider.getValues ? valueProvider.getValues() : valueProvider);
                toStore.push({
                    "type" : type,
                    "values" : values
                });
            }
        }

        // for multi-tab support a single persistent store is shared so it's possible other tabs have updated
        // the persisted GVP value. therefore lock, load, merge, save, and unlock.

        var that = this;
        $A.util.Mutex.lock(that.MUTEX_KEY , function (unlock) {
            that.mutexUnlock = unlock;
            storage.get(that.STORAGE_KEY)
                .then(function(item) {
                    if (item && item.value) {
                        // NOTE: we merge into the value from storage to avoid modifying toStore, which may hold
                        // references to mutable objects from the live GVPs (due to getValues() etc above). this means
                        // the live GVPs don't see the additional values from storage.

                        try {
                            item = item.value;

                            var j;
                            var map = {};
                            for (j in item) {
                                map[item[j]["type"]] = item[j]["values"];
                            }


                            for (j in toStore) {
                                type = toStore[j]["type"];
                                if (!map[type]) {
                                    map[type] = {};
                                    item.push({"type":type, "values":map[type]});
                                }
                                $A.util.apply(map[type], toStore[j]["values"], true, true);
                            }

                            toStore = item;
                        } catch (err) {
                            $A.warning("GlobalValueProvider.merge(), merging from storage failed, overwriting, error:" + err);
                        }
                    }
                    return storage.put(that.STORAGE_KEY, toStore);
                })
                .then(
                    function() {
                        that.mutexUnlock();
                    },
                    function(err) {
                        $A.warning("GlobalValueProvider.merge(), failed to put, error:" + err);
                        that.mutexUnlock();
                    }
                );
        });
    }
};

/**
 * Wrapper to get storage.
 *
 * @return {Object} storage - undefined if no storage exists
 * @private
 */
GlobalValueProviders.prototype.getStorage = function () {
    var storage = Action.getStorage();
    if (!storage) {
        return undefined;
    }

    return storage.isPersistent() ? storage : undefined;
};

/**
 * load GVPs from storage if available
 * @private
 */
GlobalValueProviders.prototype.loadFromStorage = function(callback) {
	// If persistent storage is active then write through for disconnected support
    var storage = this.getStorage();
    var that = this;
    if (storage) {
        storage.get(this.STORAGE_KEY).then(
            function (item) {
                $A.run(function() {
                    if (item) {
                        // TODO W-2512654: storage.get() returns expired items, need to check value['isExpired']
                        that.merge(item.value, true);
                    }
                    callback(!!item);
                });
            },
            function() {
                $A.run(function() {
                    // error retrieving from storage
                    callback(false);
                });
            }
        );
    } else {
        // nothing loaded from persistent storage
        callback(false);
    }
};

/**
 * Loads GVP config when from context
 *
 * @param {Object} gvp Global Value Providers
 * @private
 */
GlobalValueProviders.prototype.load = function(gvp) {
    if (gvp) {
        for ( var i = 0; i < gvp.length; i++) {
            this.merge(gvp[i]);
        }
    }
};


/**
 * Adds a new global value provider.
 * @param type The key to identify the valueProvider.
 * @param valueProvider The valueProvider to add.
 * @private
 */
GlobalValueProviders.prototype.addValueProvider = function(type, valueProvider) {
    if(!this.valueProviders.hasOwnProperty(type)) {
        // work around the obfuscation logic to allow external GVPs
        valueProvider.getValues = valueProvider.getValues || valueProvider["getValues"];
        valueProvider.get       = valueProvider.get       || valueProvider["get"];
        valueProvider.merge     = valueProvider.merge     || valueProvider["merge"];
        this.valueProviders[type] = valueProvider;
    }
};

/**
 * Returns value provider or empty ObjectValueProvider
 *
 * @param {String} type the key to identify the valueProvider
 * @return {Object} ValueProvider
 * @private
 */
GlobalValueProviders.prototype.getValueProvider = function(type) {
    return this.valueProviders[type];
};

/**
 * Calls getValue for Value Object. Unwraps and calls callback if provided.
 *
 * @param {String} expression
 * @param {Component} component
 * @return {String} The value of expression
 * @export
 */
GlobalValueProviders.prototype.get = function(expression, callback) {
    expression=$A.expressionService.normalize(expression).split('.');
    var type=expression.shift();
    var valueProvider=this.valueProviders[type];
    $A.assert(valueProvider,"Unknown value provider: '"+type+"'.");
    return (valueProvider.get ? valueProvider.get(expression, callback) : $A.expressionService.resolve(expression, valueProvider));
};

Aura.Provider.GlobalValueProviders = GlobalValueProviders;
