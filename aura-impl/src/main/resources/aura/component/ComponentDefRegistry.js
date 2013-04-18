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
 * @param {Object} config Passes in a config, a ComponentDef, or the name of a ComponentDef.
 * @param {Object} noInit If set to false, try loading from cache first before
 * trying to write through of local storage cacheable componentDefs.
 * @returns a ComponentDef instance from registry, or config after adding to registry.
 */
ComponentDefRegistry.prototype.getDef = function(config, noInit) {
    aura.assert(config, "ComponentDef Config required for registration");

    // We don't re-register (or modify in any way) once we've registered
    var descriptor = config["descriptor"] || config;
    if ($A.util.isString(descriptor) && (descriptor.indexOf("://") < 0)) {
        descriptor = "markup://" + descriptor; // support shorthand
    }
    var ret = this.componentDefs[descriptor];
    if ((!noInit) && !ret) {
        var useLocalStorage = this.useLocalCache(descriptor);
        var mark;
        if (useLocalStorage) {
            mark = "ComponentDefRegistry.localStorageCache";
            $A.mark(mark);

            // Try to load from cache
            var cachedConfig = this.getConfigFromLocalCache(descriptor);
            if (cachedConfig) {
                config = cachedConfig;
                useLocalStorage = false;
            }

            $A.measure("Cache " + (cachedConfig ? "hit" : "miss") + " " + descriptor, mark);
        }

        ret = new ComponentDef(config);
        this.componentDefs[ret.getDescriptor().toString()] = ret;

        if (useLocalStorage) {
            // Write through of local storage cacheable componentDefs
            try {
                this.writeToCache(descriptor, config, mark);
            } catch (e) {
                // Clear localStorage and try one more time to write through
                localStorage.clear();
                $A.measure("Cleared localStorage (out of space) ", mark);

                try {
                	this.writeToCache(descriptor, config, mark);
                } catch(e2) {
                	// Nothing we can do at this point - give up.
                }
            }
        }
    }

    return ret;
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
 * @param {Object} mark
 */
ComponentDefRegistry.prototype.writeToCache = function(descriptor, config, mark) {
	if (this.isLocalStorageAvailable) {
	    // Update the catalog
	    var catalog = this.getLocalCacheCatalog();
	
	    catalog[descriptor] = true;
	    localStorage.setItem(this.cacheName, aura.util.json.encode(catalog));
	
	    // Write out the componentDef
	    localStorage.setItem(this.cacheName + "." + descriptor, aura.util.json.encode(config));
	
	    $A.measure("Wrote " + descriptor, mark);
	}
};

