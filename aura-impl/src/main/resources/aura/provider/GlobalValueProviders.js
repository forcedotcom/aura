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
 */
$A.ns.GlobalValueProviders = function (gvp, initCallback) {
    this.valueProviders = {
        "$Browser" : new $A.ns.ObjectValueProvider(),
        "$Label": new $A.ns.LabelValueProvider(),
        "$Locale": new $A.ns.ObjectValueProvider(),
        "$Global": new $A.ns.ContextValueProvider()
    };
    for(var type in gvp){
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
            initCallback();
        }
    });

};

/**
 * Merges new GVPs with existing and saves to storage
 *
 * @param {Object} gvps
 * @param {Boolean} doNotPersist
 * @protected
 */
$A.ns.GlobalValueProviders.prototype.merge = function(gvps, doNotPersist) {
    if (!gvps) {
        return;
    }
    var valueProvider, i, storage, type, newGvp, values;
    var storedGvps = [];

    for ( i = 0; i < gvps.length; i++) {
        newGvp = gvps[i];
        type = newGvp["type"];
        if (!this.valueProviders[type]) {
            this.valueProviders[type] = new $A.ns.ObjectValueProvider();
        }
        valueProvider = this.valueProviders[type];
        if (valueProvider.merge) {
            // set values into its value provider
            valueProvider.merge(newGvp["values"]);
        }else{
            $A.util.apply(valueProvider,newGvp["values"],true);
        }
    }
    if (doNotPersist) {
        return;
    }
    // Persist our set of valueProviders in storage.
    storage = this.getStorage();
    if (storage) {
        for (type in this.valueProviders) {
            if (this.valueProviders.hasOwnProperty(type)) {
                valueProvider = this.valueProviders[type];
                values = valueProvider.getStorableValues ? valueProvider.getStorableValues() : (valueProvider.getValues ? valueProvider.getValues() : valueProvider);
                storedGvps.push({
                    "type" : type,
                    "values" : values
                });
            }
        }
        storage.put("globalValueProviders", storedGvps).then(function() {}, function(err) {
            $A.warning("GlobalValueProvider.merge(), failed to put, error:" + err);
          });
    }
};

/**
 * Wrapper to get storage.
 *
 * @return {Object} storage - undefined if no storage exists
 * @private
 */
$A.ns.GlobalValueProviders.prototype.getStorage = function () {
    var storage = $A.storageService.getStorage("actions");
    if (!storage) {
        return undefined;
    }

    var config = $A.storageService.getAdapterConfig(storage.getName());
    return config["persistent"] ? storage : undefined;
};

/**
 * load GVPs from storage if available
 * @private
 */
$A.ns.GlobalValueProviders.prototype.loadFromStorage = function(callback) {
	// If persistent storage is active then write through for disconnected support
    var storage = this.getStorage();
    var that = this;
    if (storage) {
        storage.get("globalValueProviders").then(function (item) {
            $A.run(function() {
                if (item) {
                    // TODO W-2512654: storage.get() returns expired items, need to check value['isExpired']
                    that.merge(item.value, true);
                }
                if(callback) { callback(!!item); }
            });
        }, function() {
            // error retrieving from storage
            $A.run(function() {
                callback(false);
            });
        });
    } else {
        // nothing loaded from persistent storage
        $A.run(function() {
            if(callback) { callback(false); }
        });
    }
};

/**
 * Loads GVP config when from context
 *
 * @param {Object} gvp Global Value Providers
 * @private
 */
$A.ns.GlobalValueProviders.prototype.load = function(gvp) {
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
$A.ns.GlobalValueProviders.prototype.addValueProvider = function(type, valueProvider) {
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
$A.ns.GlobalValueProviders.prototype.getValueProvider = function(type) {
    return this.valueProviders[type];
};

/**
 * This function is for test only. Call this to simulate offline situation:
 * when we start the app offline, the server is not avalable, 
 * all we have is whatever we get from persist storage.
 */
$A.ns.GlobalValueProviders.prototype.clearValueProvider = function(loadFromStorage) {
	this.valueProviders = {
	        "$Browser" : new $A.ns.ObjectValueProvider(),
	        "$Label": new $A.ns.LabelValueProvider(),
	        "$Locale": new $A.ns.ObjectValueProvider(),
	        "$Global": new $A.ns.ContextValueProvider()
	};
	if(loadFromStorage) {
		this.loadFromStorage();
	}
};

/**
 * Calls getValue for Value Object. Unwraps and calls callback if provided.
 *
 * @param {String} expression
 * @param {Component} component
 * @return {String} The value of expression
 */
$A.ns.GlobalValueProviders.prototype.get = function(expression, callback) {
    expression=$A.expressionService.normalize(expression).split('.');
    var type=expression.shift();
    var valueProvider=this.valueProviders[type];
    $A.assert(valueProvider,"Unknown value provider: '"+type+"'.");
    return (valueProvider.get ? valueProvider.get(expression, callback) : $A.expressionService.resolve(expression, valueProvider));
};

//#include aura.provider.GlobalValueProviders_export
