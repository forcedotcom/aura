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
 * @param {Object} gvp an optional serialized GVP to load.
 * @param {Function} initCallback an optional callback invoked after the GVP has finished its
 *  asynchronous initialization.
 * @constructor
 */
$A.ns.GlobalValueProviders = function (gvp, initCallback) {
    this.valueProviders = {
        "$Label": new $A.ns.LabelValueProvider()
    };

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
    if (gvps) {
        var storage=null;
        var storedGvps =null;
        if (!doNotPersist) {
            // If persistent storage is active then write through for disconnected support
            storage = this.getStorage();
            storedGvps = [];
        }

        for ( var i = 0; i < gvps.length; i++) {
            var newGvp = gvps[i];
            var type = newGvp["type"];
            if (!this.valueProviders[type]) {
                this.valueProviders[type] = new $A.ns.ObjectValueProvider();
            }
            var valueProvider = this.valueProviders[type];
            // set values into its value provider
            valueProvider.merge(newGvp["values"]);

            if (storage) {
                storedGvps.push({
                    "type" : type,
                    "values" : valueProvider.getValues()
                });
            }
        }

        if (storage) {
            storage.put("globalValueProviders", storedGvps);
        }
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
                    that.merge(item.value, true);
                }
                callback(!!item);
            });
        });
    } else {
        // nothing loaded from persistent storage
        $A.run(function() {
            callback(false);
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
 * Returns value provider or empty ObjectValueProvider
 *
 * @param {String} type - key for value provider
 * @return {Object} ValueProvider
 * @private
 */
$A.ns.GlobalValueProviders.prototype.getValueProvider = function(type) {
    return this.valueProviders[type];
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
    return valueProvider.get(expression, callback);
};

//#include aura.provider.GlobalValueProviders_export