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
    this.lastmod = config["lastmod"];
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
 * The HTTP request format is http://<your server>/namespace/component?aura.mode=PROD. <br/>
 * For a full list of modes, see <a href="http://jenkins.auraframework.org/view/All/job/aura_doc/javadoc/aura/system/AuraContext.Mode.html" target="_blank">AuraContext</a>.
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

    return aura.util.json.encode({"mode" : this.mode, "preloads" : preloads, "app" : this.app, "cmp" : this.cmp,"lastmod" : this.lastmod});
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
    this.joinGlobalValueProviders(otherContext["globalValueProviders"]);
    this.joinComponentConfigs(otherContext["components"]);
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
AuraContext.prototype.joinGlobalValueProviders = function(gvps) {
    if (gvps) {
        for (var i = 0; i < gvps.length; i++) {
            var newGvp = gvps[i];
            var t = newGvp["type"];
            var gvp = this.globalValueProviders[t];
            if (!gvp) {
                this.globalValueProviders[t] = new MapValue(newGvp["values"]);
            } else {
                var mergeMap = new MapValue(newGvp["values"]);
                gvp.merge(mergeMap, false);
            }
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

//#include aura.context.AuraContext_export
