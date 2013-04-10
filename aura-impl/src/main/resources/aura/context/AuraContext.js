/*
 * Copyright (C) 2012 salesforce.com, inc.
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
/*jslint sub: true*/
/**
 * @namespace Represents a Aura client-side context, created during HTTP requests for component definitions.
 * A context can include a mode, such as "DEV" for development mode or "PROD" for production mode.
 * @constructor
 * @protected
 */
function AuraContext(config) {
    this.mode = config["mode"];
    this.preloads = config["preloads"];
    this.loaded = config["loaded"];
    if (this.loaded === undefined) {
        this.loaded = {};
    }
    this.lastmod = config["lastmod"];
    this.fwuid = config["fwuid"];
    this.preloadLookup = {};
    for(var j=0;j<this.preloads.length;j++){
        this.preloadLookup[this.preloads[j]] = true;
    }
    this.num = 0;
    this.lastGlobalId = 0;
    this.componentConfigs = {};
    var globalValueProviders = {};
    this.globalValueProviders = globalValueProviders;
    this.app = config["app"];
    this.cmp = config["cmp"];
    this.test = config["test"];
    
    // If persistent storage is active then write through for disconnected support
    var storage = this.getStorage();
    var that = this;
    if (storage) {
    	storage.get("globalValueProviders", function(item) {
    		if (item) {
    			that.joinGlobalValueProviders(item, true);
    		}
    	});    	
    }

    var gvp = config["globalValueProviders"];
    if (gvp) {
        var l = gvp.length;
        for (var i = 0; i < l; i++) {
            // TODO: need GlobalValueProvider js object, more than a mapvalue
            var g = gvp[i];
            globalValueProviders[g["type"]] = new MapValue(g["values"]);
        }
    }

    this.joinComponentConfigs(config["components"]);
}

/**
 * Returns the mode for the current request. Defaults to "PROD" for production mode and "DEV" for development mode.
 * The HTTP request format is <code>http://<your server>/namespace/component?aura.mode=PROD</code>.
 * <p>See Also: <a href="#help?topic=modesReference">AuraContext</a></p>
 */
AuraContext.prototype.getMode = function() {
    return this.mode;
};

/**
 * @private
 */
AuraContext.prototype.getGlobalValueProvider = function(key) {
    return this.globalValueProviders[key];
};

/**
 * @private
 */
AuraContext.prototype.isPreloaded = function(ns) {
    return this.preloadLookup[ns] === true;
};

/**
 *  @private
 */
AuraContext.prototype.getPreloads = function(){
	return this.preloadLookup;
};

/**
 * @private
 */
AuraContext.prototype.encodeForServer = function(includePreloads) {
    var preloads;
    if (aura.util.isUndefined(includePreloads) || includePreloads) {
        preloads = this.getDynamicNamespaces();
        if (this.preloads) {
            preloads = preloads.concat(this.preloads);
        }
    }

    return aura.util.json.encode({
		"mode" : this.mode,
		"preloads" : preloads,
		"loaded" : this.loaded,
		"app" : this.app,
		"cmp" : this.cmp,
		"lastmod" : this.lastmod,
		"fwuid" : this.fwuid,
		"test" : this.test
	});
};

/**
 * @private
 */
AuraContext.prototype.getDynamicNamespaces = function() {
    var dynamicNamespaces = [];

    var descriptors = $A.services.component.getRegisteredComponentDescriptors();
    for (var n = 0; n < descriptors.length; n++) {
        var desc = descriptors[n];
        if (desc.indexOf("layout://") === 0) {
            dynamicNamespaces.push(new DefDescriptor(desc).getNamespace());
        }
    }

    return dynamicNamespaces;
};

/**
 * @private
 */
AuraContext.prototype.join = function(otherContext) {
    if (otherContext["mode"] !== this.getMode()) {
        throw new Error("Mode mismatch");
    }
    if ($A.util.isUndefinedOrNull(this.fwuid)) {
        this.fwuid = otherContext["fwuid"];
    }
    if (otherContext["fwuid"] !== this.fwuid) {
        throw new Error("framework mismatch");
    }
    this.joinGlobalValueProviders(otherContext["globalValueProviders"]);
    this.joinComponentConfigs(otherContext["components"]);
    this.joinLoaded(otherContext["loaded"]);
};

/**
 * @private
 */
AuraContext.prototype.getNum = function(){
    return this.num;
};

/**
 * @private
 */
AuraContext.prototype.incrementNum = function(){
    this.num = this.num + 1;
    this.lastGlobalId = 0;
    return this.num;
};

/**
 * @private
 */
AuraContext.prototype.getNextGlobalId = function(){
    this.lastGlobalId = this.lastGlobalId + 1;
    return this.lastGlobalId;
};

/**
 * @private
 */
AuraContext.prototype.getComponentConfig = function(globalId){
    var componentConfigs = this.componentConfigs;
    var ret = componentConfigs[globalId];
    delete componentConfigs[globalId];
    return ret;
};

/**
 * Returns the app associated with the request.
 */
AuraContext.prototype.getApp = function(){
    return this.app;
};

/**
 * @private
 */
AuraContext.prototype.joinGlobalValueProviders = function(gvps, doNotPersist) {
    if (gvps) {
    	var storage;
    	var storedGvps;
        if (!doNotPersist) {
	        // If persistent storage is active then write through for disconnected support
	        storage = this.getStorage();
        	storedGvps = [];
        }
        
        for (var i = 0; i < gvps.length; i++) {
            var newGvp = gvps[i];
            var t = newGvp["type"];
            var gvp = this.globalValueProviders[t];
            if (!gvp) {
            	gvp = new MapValue(newGvp["values"]);
                this.globalValueProviders[t] = gvp;
            } else {
                var mergeMap = new MapValue(newGvp["values"]);
                gvp.merge(mergeMap, false);
            }
            
            if (storage) {
            	storedGvps.push({ 
            		"type": t, 
            		"values": gvp.unwrap() 
        		});
            }
        }
        
        if (storage) {
        	storage.put("globalValueProviders", storedGvps);
        }
    }
};

/**
 * @private
 */
AuraContext.prototype.joinComponentConfigs = function(otherComponentConfigs){
    if (otherComponentConfigs) {
        for (var k in otherComponentConfigs) {
            var config = otherComponentConfigs[k];
            var def = config["componentDef"];
            if (def) {
                componentService.getDef(def);
            }
            this.componentConfigs[k] = config;
        }
    }
};

/**
 * @private
 */
AuraContext.prototype.joinLoaded = function(loaded) {
    if (this.loaded === undefined) {
        this.loaded = {};
    }
    if (loaded) {
        for (var i in loaded) {
            var newL = loaded[i];
            if (newL === 'deleted') {
                delete this.loaded[i];
            } else {
                this.loaded[i] = newL;
            }
        }
    }
};


/**
 * This should be private but is needed for testing... ideas?
 */
AuraContext.prototype.getLoaded = function(){
    return this.loaded;
};

/**
 * DCHASMAN Will be private again soon as part of the second phase of W-1450251
 */
AuraContext.prototype.setCurrentAction = function(action){
    var previous = this.currentAction;
    this.currentAction = action;
    return previous;
};

/**
 * @private
 */
AuraContext.prototype.getCurrentAction = function(action){
    return this.currentAction;
};

/**
 * @private
 */
AuraContext.prototype.getStorage = function() {
	var storage = $A.storageService.getStorage("actions");
	if (!storage) {
		return undefined;
	}
	
	var config = $A.storageService.getAdapterConfig(storage.getName());
    return config["persistent"] ? storage : undefined;
};

//#include aura.context.AuraContext_export
