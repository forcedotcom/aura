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
 * @namespace Global Value Provider. Holds global values: $Label, $Browser, $Locale
 * @constructor
 */
function GlobalValueProviders(gvp) {

    this.globalValueProviders = {};
    this.valueProviders = {
        "$Label": new LabelValueProvider(),
        "$Browser": new SimpleValueProvider(),
        "$Locale": new SimpleValueProvider()
    };

    this.loadFromStorage();
    this.load(gvp);

}

/**
 * Joins new GVPs with existing and saves to storage
 *
 * @param gvps
 * @param doNotPersist
 * @private
 */
GlobalValueProviders.prototype.join = function(gvps, doNotPersist) {
    if (gvps) {
        var storage;
        var storedGvps;
        if (!doNotPersist) {
            // If persistent storage is active then write through for disconnected support
            storage = this.getStorage();
            storedGvps = [];
        }

        for ( var i = 0; i < gvps.length; i++) {
            var newGvp = gvps[i];
            var t = newGvp["type"];
            var vp = this.getValueProvider(t);
            var gvp = vp.getValues();
            if (!gvp) {
                gvp = new MapValue(newGvp["values"]);
                this.globalValueProviders[t] = gvp;
            } else {
                var mergeMap = new MapValue(newGvp["values"]);
                gvp.merge(mergeMap, true);
            }

            // set values into its value provider
            vp.setValues(gvp);

            if (storage) {
                storedGvps.push({
                    "type" : t,
                    "values" : gvp.unwrap()
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
 * @return storage
 * @private
 */
GlobalValueProviders.prototype.getStorage = function () {

    //$A.getContext() isn't ready at this point.
    //return $A.getContext().getStorage();

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
GlobalValueProviders.prototype.loadFromStorage = function() {
    // If persistent storage is active then write through for disconnected support
    var storage = this.getStorage();
    var that = this;
    if (storage) {
        storage.get("globalValueProviders", function(item) {
            if (item) {
                that.join(item, true);
            }
        });
    }
};

/**
 * Loads GVP config when from context
 *
 * @param gvp Global Value Providers
 * @private
 */
GlobalValueProviders.prototype.load = function(gvp) {
    if (gvp) {
        var l = gvp.length;
        for ( var i = 0; i < l; i++) {
            var g = gvp[i],
                type = g["type"],
                values = new MapValue(g["values"]);
            this.getValueProvider(type).setValues(values);
        }
    }
};

/**
 * Returns value provider or empty SimpleValueProvider
 *
 * @param type
 * @return ValueProvider
 * @private
 */
GlobalValueProviders.prototype.getValueProvider = function(type) {
    if ( !this.valueProviders[type] ) {
        this.valueProviders[type] = new SimpleValueProvider();
    }
    return this.valueProviders[type];
};

/**
 * Creates property reference value from string expression
 *
 * @param expression
 * @return {PropertyReferenceValue}
 * @private
 */
GlobalValueProviders.prototype.createPropertyRef = function(expression) {
    if ($A.util.isString(expression)) {
        expression = valueFactory.parsePropertyReference(expression);
    }
    return expression;
};

/**
 * Checks whether expression is for global values
 *
 * @param expression
 * @return {Boolean}
 */
GlobalValueProviders.prototype.isGlobalValueExp = function(expression) {
    expression = this.createPropertyRef(expression);
    var firstChar = expression.getRoot().charAt(0);

    return firstChar === '$';
};

/**
 * Calls getValue for Value Object. Unwraps and calls callback if provided
 *
 * @param expression
 * @param [component]
 * @param [callback]
 * @return {String} value of expression
 */
GlobalValueProviders.prototype.get = function(expression, component, callback) {
    return $A.unwrap(this.getValue(expression, component, function(result) {
        if($A.util.isFunction(callback)) {
            callback.call(null, $A.unwrap(result));
        }
    } ));
};

/**
 * Delegates to value provider.
 *
 * @param expression
 * @param [component]
 * @param [callback]
 * @return {SimpleValue}
 */
GlobalValueProviders.prototype.getValue = function(expression, component, callback) {
    // in case anything other than gvps are requested
    if( !this.isGlobalValueExp(expression) ) {
        return undefined;
    }

    expression = this.createPropertyRef(expression);

    var type = expression.getRoot(),
        vp = this.getValueProvider(type);

    return vp.getValue(expression, component, callback);

};

//#include aura.provider.GlobalValueProviders_export