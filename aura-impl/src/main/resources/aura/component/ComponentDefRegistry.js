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
 * @namespace A registry for ComponentDefs.
 * @constructor
 * @protected
 */
function ComponentDefRegistry(){
    this.componentDefs = {};
    this.pendingComponentDefs = {};
}

ComponentDefRegistry.prototype.auraType = "ComponentDefRegistry";

ComponentDefRegistry.prototype.cacheName = "componetDefRegistry.catalog";

ComponentDefRegistry.prototype.isLocalStorageAvailable= (function() {
    if (window.localStorage) {
        // Now actually try a test write because private browsing and use of local when not authorized by the user will only fail on writes
        try {
            window.localStorage.setItem("test", "test");
            window.localStorage.removeItem("test");
            return true;
        } catch(e) {
        }
    }

    return false;
})();

/**
 * Returns a ComponentDef instance from registry, or config after adding to the registry.
 * Throws an error if config is not provided.
 * @param {Object} name the name or DefDescriptor of a ComponentDef.
 * @param {Object} noInit If set to false, try loading from cache first before
 * trying to write through of local storage cacheable componentDefs.
 * @returns a ComponentDef instance from registry, or config after adding to registry.
 */
ComponentDefRegistry.prototype.getDef = function(name, allowUnknownComponentDef) {
    aura.assert(name, "ComponentDefRegistry.getDef() name is required");
    
    if (name instanceof DefDescriptor) {
    	name = name.getQualifiedName();
    }
    
    aura.assert($A.util.isString(name), "ComponentDefRegistry.getDef() name must be a string " + aura.util.json.encode(name));
    
    if (name.indexOf("://") < 0) {
        name = "markup://" + name; // support shorthand
    }
    
    var ret = this.componentDefs[name];
    if (!ret) {
    	// See if we have this in pending adds
    	config = this.pendingComponentDefs[name];
    	
    	var useLocalCache = this.useLocalCache(name);
    	if (!config) {
    		if (useLocalCache) {
	            // Try to load from local storage cache
	            var cachedConfig = this.getConfigFromLocalCache(name);
	            if (cachedConfig) {
	                this.addDef(cachedConfig);
	            	config = cachedConfig;
	            }
    		}
    	} else {
    		delete this.pendingComponentDefs[name];
    		
    		if (useLocalCache) {
    			// Write through of local storage cacheable componentDefs
                try {
                    this.writeToCache(name, config);
                } catch (e) {
                    // Clear localStorage and try one more time to write through
                    localStorage.clear();

                    try {
                    	this.writeToCache(name, config);
                    } catch(e2) {
                    	// Nothing we can do at this point - give up.
                    }
                }    			
    		}
    	}
    
    	if (config) {
            ret = new ComponentDef(config);
            this.componentDefs[name] = ret;
        }
    }

    aura.assert(allowUnknownComponentDef || ret, "Unknown component " + name);

    return ret;
};

/**
 * Registers a ComponentDef instance with the registry.
 * Throws an error if config is not provided.
 * @param {Object} config a ComponentDef config.
 * @private
 */
ComponentDefRegistry.prototype.addDef = function(config) {
    aura.assert(config, "ComponentDef Config required for registration");

    var name = config["descriptor"];
    aura.assert(name, "ComponentDef descriptor required for registration: " + config);
    
    // Make sure that the config meets at least the basic requirements of a component config
    var isComponentConfig = config["attributeDefs"];
    if (isComponentConfig && !this.componentDefs[name] && !this.pendingComponentDefs[name]) {
        var descriptor = new DefDescriptor(name);
    	this.pendingComponentDefs[descriptor.toString()] = config;
    }
};

/**
 * Use the local cache for the page session persistently when layouts are used.
 */
ComponentDefRegistry.prototype.useLocalCache = function(descriptor) {
    return this.isLocalStorageAvailable && descriptor.indexOf("layout://") === 0;
};

/**
 * Returns the JSON decoded localStorage values based on the cache name,
 * or returns null.
 */
ComponentDefRegistry.prototype.getLocalCacheCatalog = function() {
    if (!this.isLocalStorageAvailable) {
        return null;
    }

    var catalog = localStorage.getItem(this.cacheName);
    return catalog ? aura.util.json.decode(catalog) : {};
};

/**
 * Returns the JSON decoded localStorage value.
 * @param {Object} descriptor The key to look up on the localStorage.
 */
ComponentDefRegistry.prototype.getConfigFromLocalCache = function(descriptor) {
    if (!this.isLocalStorageAvailable) {
        return null;
    }

    var item = localStorage.getItem(this.cacheName + "." + descriptor);
    return item ? aura.util.json.decode(item) : null;
};

/**
 * Updates the local cache catalog and writes out the componentDef.
 * @param {Object} descriptor
 * @param {Object} config
 */
ComponentDefRegistry.prototype.writeToCache = function(descriptor, config) {
	if (this.isLocalStorageAvailable) {
	    // Update the catalog
	    var catalog = this.getLocalCacheCatalog();
	
	    catalog[descriptor] = true;
	    localStorage.setItem(this.cacheName, aura.util.json.encode(catalog));
	
	    // Write out the componentDef
	    localStorage.setItem(this.cacheName + "." + descriptor, aura.util.json.encode(config));
	}
};

/**
 * Registers all pending component defs
 * @protected
 */
ComponentDefRegistry.prototype.registerPending = function() {
	var pending = [];
    for (var name in this.pendingComponentDefs) {
    	pending.push(name);
    }	
	
    for (var n = 0; n < pending.length; n++) {
        this.getDef(pending[n]);
    }
};
