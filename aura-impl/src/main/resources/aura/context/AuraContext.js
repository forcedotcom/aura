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
/**
 * @description Represents a Aura client-side context, created during HTTP requests for component definitions. A context
 *            can include a mode, such as "DEV" for development mode or "PROD" for production mode.
 * @constructor
 * @protected
 * @class AuraContext
 * @param {Object} config the 'founding' config for the context from the server.
 * @param {Function} initCallback an optional callback invoked after the config has finished its asynchronous initialization.
 * @export
 */
Aura.Context.AuraContext = function AuraContext(config, initCallback) {
    this.mode = config["mode"];
    this.loaded = config["loaded"];
    if (this.loaded === undefined) {
        this.loaded = {};
    }

    // make a shallow-copy to use when the context is reset
    this.loadedOriginal = $A.util.apply({}, this.loaded);

    this.fwuid = config["fwuid"];
    this.pathPrefix = config["pathPrefix"];
    this.moduleServices = config["services"];
    this.num = 0;

    // To keep track of re-rendering service call
    this.renderNum = 0;
    this.transaction = 0;
    this.transactionName = "";
    this.lastGlobalId = 0;
    this.componentConfigs = {};
    this.app = config["app"];
    this.cmp = config["cmp"];
    this.test = config["test"];
    this.contextPath = config["contextPath"] || "";
    this.allowedGlobals = config["allowedGlobals"];
    this.globals = config["globals"];
    this.enableAccessChecks=true;
    this.isLockerServiceEnabled = this["isLockerServiceEnabled"] = false;

    // JBUCH: TOGGLE LOGGING OFF BY DEFAULT IN PROD MODE
    this.logAccessFailures= true
                            // #if {"modes" : ["PRODUCTION"]}
                            && false
                            // #end
                            ;
    this.accessStack=[];
    this.tokens={};
    this.isModulesEnabled = !!config["m"];
    this.moduleNamespaceAliases = config["mna"] || {};

    var that = this;

    this.initGlobalValueProviders(config["globalValueProviders"], function(gvps) {
            var i, defs;

            // Don't ask.... You just kinda have to love this....
            that.globalValueProviders = gvps;
            that.contextGlobals = that.globalValueProviders.getValueProvider("Global");
            // Careful now, the def is null, this fake action sets up our paths.
            that.currentAction = new Action(null, ""+that.num, null, null, false, null, false);

            if(config["libraryDefs"]) {
                defs = config["libraryDefs"];
                for (i = 0; i < defs.length; i++) {
                    $A.componentService.saveLibraryConfig(defs[i]);
                }
            }

            if (config["componentDefs"]) {
                defs = config["componentDefs"];
                for (i = 0; i < defs.length; i++) {
                    if (defs[i]["descriptor"]) {
                        $A.componentService.saveComponentConfig(defs[i]);
                    }
                }
            }
            if (config["eventDefs"]) {
                defs = config["eventDefs"];
                for (i = 0; i < defs.length; i++) {
                    $A.eventService.saveEventConfig(defs[i]);
                }
            }
            that.joinComponentConfigs(config["components"], that.currentAction.getId());

            if (initCallback) {
                initCallback(that);
            }
        });
};

/**
 * Unique id for the current instance of Aura. In a multi-tab scenario
 * each tab will have a unique id.
 */
Aura.Context.AuraContext.CLIENT_SESSION_ID = [
    window.pageStartTime, // first byte sent
    Math.round(Aura.time() * 1000000), // current time (microseconds)
    Math.random().toString(16).substr(2)
].join('').substring(0, 32);

/**
 * Temporary shim, until W-2812858 is addressed to serialize GVPs as a map and fix $A GVPs.
 * Convert config GVPs from array to map, and merge $A GVPs, and create the context GVPs.
 * @export
 */
Aura.Context.AuraContext.prototype.initGlobalValueProviders = function(gvps, callback) {
    if ($A.util.isArray(gvps)) {
        var map = {};

        for (var i = 0; i < gvps.length; i++) {
            var gvp = gvps[i];
            var type = gvp["type"];
            var values = gvp["values"];
            map[type] = values;
        }

        gvps = map;
    }

    if(!gvps){
        gvps = {};
    }

    $A.util.apply(gvps,$A.globalValueProviders);

    this.globalValueProviders = new Aura.Provider.GlobalValueProviders(gvps, callback);
};


/**
 * Returns the mode for the current request. Defaults to "PROD" for production mode and "DEV" for development mode.
 * The HTTP request format is <code>http://<your server>/namespace/component?aura.mode=PROD</code>.
 *
 * @return {string} the mode from the server.
 * @export
 */
Aura.Context.AuraContext.prototype.getMode = function() {
    return this.mode;
};

Aura.Context.AuraContext.prototype.getCurrentAccess=function(){
    return this.accessStack[this.accessStack.length-1];
};

Aura.Context.AuraContext.prototype.getCurrentAccessCaller=function(){
    return this.accessStack[this.accessStack.length-2];
};

Aura.Context.AuraContext.prototype.getAccessStackHierarchy=function(){
    return this.accessStack ? this.accessStack.map(function(component) {
        return "[" + component.getType() + "]";
    }).join(" > ") : null;
};

Aura.Context.AuraContext.prototype.setCurrentAccess=function(component){
    if(!component){
        component=this.getCurrentAccess();
    }else{
        while(component instanceof PassthroughValue){
            component=component.getComponent();
        }
    }
    if(component){
        this.accessStack.push(component);
    }
};

Aura.Context.AuraContext.prototype.releaseCurrentAccess=function(){
    this.accessStack.pop();
};

Aura.Context.AuraContext.prototype.getAccessVersion = function(name) {
    var currentAccessCaller = this.getCurrentAccessCaller();
    var ret = null;
    if (currentAccessCaller) {
        var def = currentAccessCaller.getDef();
        if (def) {
            // return the version of currentAccessCaller if namespaces are the same
            if (def.getDescriptor().getNamespace() === name) {
                ret = currentAccessCaller.get("version");
            }
            else {
                ret = def.getRequiredVersionDefs().getDef(name);
                if (ret) {
                    ret = ret.getVersion();
                }
            }
        }
    }

    return ret;
};

/**
 * Gets the application configuration tokens allowed to be used in component markup.
 * @private
 */
Aura.Context.AuraContext.prototype.getTokens=function(){
    return this.tokens;
};

/**
 * Sets the application configuration tokens allowed to be used in component markup.
 * @param tokens The object map containing name value pairs of tokens.
 * @private
 */
Aura.Context.AuraContext.prototype.setTokens=function(tokens){
    this.tokens=tokens;
};

/**
 * Adds a new global value provider.
 * @param type The key to identify the valueProvider.
 * @param valueProvider The valueProvider to add.
 * @private
 */
Aura.Context.AuraContext.prototype.addGlobalValueProvider = function(type,valueProvider) {
    this.globalValueProviders.addValueProvider(type,valueProvider);
};

/**
 * Provides access to global value providers.
 * For example, <code>$A.get("$Label.Related_Lists.task_mode_today");</code> gets the label value.
 *
 * @return {GlobalValueProviders}
 * @private
 */
Aura.Context.AuraContext.prototype.getGlobalValueProvider = function(type) {
    return this.globalValueProviders.getValueProvider(type);
};

/**
 * JSON representation of context for server requests.
 *
 * This must remain in sync with AuraTestingUtil so that we can accurately test.
 *
 * @return {String} json representation
 * @private
 */
Aura.Context.AuraContext.prototype.encodeForServer = function(includeDynamic) {
    var contextToSend = {
        "mode" : this.mode,
        "fwuid" : this.fwuid
    };
    if (this.app) {
        contextToSend["app"] = this.app;
    } else {
        contextToSend["cmp"] = this.cmp;
    }
    if (this.test) {
        contextToSend["test"] = this.test;
    }
    if (includeDynamic) {
        contextToSend["loaded"] = this.loaded;
        contextToSend["dn"] = $A.services.component.getDynamicNamespaces();
        contextToSend["globals"] = this.globalValueProviders.getValueProvider("$Global").serializeForServer();
    }
    if(this.isModulesEnabled) {
        contextToSend["m"] = 1;
    }
    return $A.util.json.encode(contextToSend);
};

/**
 * @param {Object} otherContext the context from the server to join in to this one.
 * @export
 */
Aura.Context.AuraContext.prototype.merge = function(otherContext) {
    var i, defs;

    if (otherContext["mode"] !== this.getMode()) {
        throw new $A.auraError("[Mode mismatch] Expected '" + this.getMode() + "' instead tried to merge mode '" + otherContext["mode"] + "'", null, $A.severity.QUIET);
    }

    if ($A.util.isUndefinedOrNull(this.fwuid)) {
        this.fwuid = otherContext["fwuid"];
    }
    if (otherContext["fwuid"] !== this.fwuid) {
        throw new $A.auraError("framework mismatch", null, $A.severity.QUIET);
    }

    this.enableAccessChecks=otherContext["enableAccessChecks"];
    this.isLockerServiceEnabled = this["isLockerServiceEnabled"] = $A.lockerService.containerSupportsRequiredFeatures() && otherContext["lockerEnabled"];
    this.isModulesEnabled = !!otherContext["m"];
    this.moduleServices = otherContext["services"];

    try {
        this.globalValueProviders.merge(otherContext["globalValueProviders"]);        
    } finally {
        if (otherContext["libraryDefs"]) {
            defs = otherContext["libraryDefs"];
            for (i = 0; i < defs.length; i++) {
                $A.componentService.saveLibraryConfig(defs[i]);
            }
        }
    
        if (otherContext["componentDefs"]) {
            defs = otherContext["componentDefs"];
            for (i = 0; i < defs.length; i++) {
                // there are occasions when defs are just references (descriptor name)
                if (defs[i]["descriptor"]) {
                    $A.componentService.saveComponentConfig(defs[i]);
                }
            }
        }
    
        if (otherContext["eventDefs"]) {
            defs = otherContext["eventDefs"];
            for (i = 0; i < defs.length; i++) {
                $A.eventService.saveEventConfig(defs[i]);
            }
        }

        if (otherContext["moduleDefs"]) {
            $A.componentService.initModuleDefs(otherContext["moduleDefs"]);
        }
    
        this.joinComponentConfigs(otherContext["components"], ""+this.getNum());
        this.joinLoaded(otherContext["loaded"]);
    }
};

/**
 * FIXME: this should return a string, and it should probably not even be here.
 *
 * @return {number} the 'num' for this context
 * @private
 * @export
 */
Aura.Context.AuraContext.prototype.getNum = function() {
    return this.num;
};

/**
 * @private
 */
Aura.Context.AuraContext.prototype.incrementNum = function() {
    this.num = this.num + 1;
    this.lastGlobalId = 0;
    return this.num;
};

/**
 * @private
 */
Aura.Context.AuraContext.prototype.incrementRender = function() {
    this.renderNum = this.renderNum + 1;
    return this.renderNum;
};

/**
 * @return {Number} incremented transaction number
 * @private
 * @export
 */
Aura.Context.AuraContext.prototype.incrementTransaction = function() {
    this.transaction = this.transaction + 1;
    return this.transaction;
};

/**
 * @return {Number} gets the number of the current transaction
 * @private
 */
Aura.Context.AuraContext.prototype.getTransaction = function() {
    return this.transaction;
};

/**
 * @private
 */
Aura.Context.AuraContext.prototype.updateTransactionName = function(_transactionName) {
    if (_transactionName) {
        this.transactionName =  (this.trasactionName !== "") ? (this.transactionName + "-" + _transactionName) : _transactionName;
    }
};

/**
 * @return {String} gets the name of the transaction
 * @private
 */
Aura.Context.AuraContext.prototype.getTransactionName = function() {
    return this.transactionName;
};

/**
 * @private
 */
Aura.Context.AuraContext.prototype.clearTransactionName = function() {
    this.transactionName = "";
};

/**
 * @return {Number} Next global ID
 * @private
 */
Aura.Context.AuraContext.prototype.getNextGlobalId = function() {
    this.lastGlobalId = this.lastGlobalId + 1;
    return this.lastGlobalId;
};

/**
 * Returns components configs object
 * @param {String} creationPath creation path to check
 * @return {Boolean} Whether creation path is in component configs
 * @private
 */
Aura.Context.AuraContext.prototype.containsComponentConfig = function(creationPath) {
    return this.componentConfigs.hasOwnProperty(creationPath);
};

/**
 * @param {string} creationPath the creation path to look up.
 * @private
 */
Aura.Context.AuraContext.prototype.getComponentConfig = function(creationPath) {
    var componentConfigs = this.componentConfigs;
    var ret = componentConfigs[creationPath];
    return ret;
};

/**
 * When we have consumed the component config from the context, its worth removing it to narrow down
 * the list of pending configs left to handle.
 * @param {String} creationPath is the components creationPath that we are operating on.
 * @private
 */
Aura.Context.AuraContext.prototype.removeComponentConfig = function(creationPath) {
    if(creationPath in this.componentConfigs) {
        delete this.componentConfigs[creationPath];
    }
};

/**
 * Returns the app associated with the request.
 * @export
 */
Aura.Context.AuraContext.prototype.getApp = function() {
    return this.app;
};

/**
 * @param {Object}
 *      otherComponentConfigs the component configs from the server to join in.
 * @param {string}
 *      actionId the id of the action that we are joining in (used to amend the creationPath).
 * @private
 */
Aura.Context.AuraContext.prototype.joinComponentConfigs = function(otherComponentConfigs, actionId) {
    var cP, idx, config, def;
    if (otherComponentConfigs) {
        for (idx = 0; idx < otherComponentConfigs.length; idx++) {
            config = otherComponentConfigs[idx];
            def = config["componentDef"];
            if (def && def["descriptor"]) {
                $A.componentService.saveComponentConfig(def);
            }
            cP = config["creationPath"];
            this.componentConfigs[actionId+cP] = config;
        }
    }
};

/**
 * Internal routine to clear out component configs to factor out common code.
 *
 * @param {string} actionId the action id that we should clear.
 * @param {boolean} logit should we log as we go? including errors.
 * @return {number} the count of component configs removed.
 * @private
 */
Aura.Context.AuraContext.prototype.internalClear = function(actionId, logit) {
    var count = 0;
    var removed = 0;
    var error = "";
    var prefix = actionId+"/";
    var len = prefix.length;
    var ccs = this.componentConfigs;

    for ( var k in ccs ) {
        if (ccs.hasOwnProperty(k) && (k === actionId || k.substr(0,len) === prefix)) {
            removed += 1;
            if (logit) {
                $A.log("config not consumed: "+k, ccs[k]);
                delete ccs[k];
                if (error !== "") {
                    error = error+", ";
                }
                error = error + k;
            }
        } else {
            count += 1;
        }
    }
    if (error !== "") {
        $A.warning("unused configs for "+actionId+": "+error);
    }
    if (count === 0) {
        this.componentConfigs = {};
    } else if (logit) {
        $A.log("leftover configs ", ccs);
        throw new $A.auraError("leftover configs", null, $A.severity.QUIET);
    }
    return removed;
};

/**
 * finish off the component configs for an action.
 *
 * This routine looks through all of the pending component configs, and
 * flags any that are un-consumed at the end of the action. This is a
 * relatively strict enforcement, but since we have all of the partial
 * configs to create the components, it is not clear why we would leave
 * them lying around.
 *
 * The Rule: You must consume component configs in the action callback.
 * you may _not_ delay creating components.
 *
 * @param {string} actionId the action id that we should clear.
 * @private
 */
Aura.Context.AuraContext.prototype.finishComponentConfigs = function(actionId) {
    this.internalClear(actionId, true);
};

/**
 * Clear out pending component configs.
 *
 * This routine can be used in error conditions (or in tests) to clear out
 * configs left over by an action. In this case, we remove them, and drop
 * them on the floor to be garbage collected.
 *
 * @public
 * @param {string} actionId the action id that we should clear.
 * @return {number} the count of component configs removed.
 * @export
 */
Aura.Context.AuraContext.prototype.clearComponentConfigs = function(actionId) {
    return this.internalClear(actionId, false);
};

/**
 * @private
 */
Aura.Context.AuraContext.prototype.joinLoaded = function(loaded) {
    if (this.loaded === undefined) {
        this.loaded = {};
    }
    if (loaded) {
        for ( var i in loaded) {
            if (loaded.hasOwnProperty(i) && !($A.util.isFunction(i))) {
                var newL = loaded[i];
                if (newL === 'deleted') {
                    delete this.loaded[i];
                } else {
                    this.loaded[i] = newL;
                }
            }
        }
    }
};

/**
 * Add back a loaded pair that was extracted using 'findLoaded'.
 *
 * @param {Object} pair the object returned by findLoaded.
 * @private
 */
Aura.Context.AuraContext.prototype.addLoaded = function(pair) {
    // Be safe. But should we go and scream if we get a mismatch?
    if (pair && !this.loaded[pair["key"]]) {
        this.loaded[pair["key"]] = pair["value"];
    }
};

/**
 * Find a 'loaded' pair for a descriptor.
 *
 * @param {String} descriptor the descriptor string.
 * @param {Object=} [loaded] Object to search
 * @returns {Object} an object that can be passed to addloaded.
 * @private
 */
Aura.Context.AuraContext.prototype.findLoaded = function(descriptor, loaded) {
    var cmpDescriptor = "COMPONENT@" + descriptor;
    var appDescriptor = "APPLICATION@" + descriptor;
    loaded = loaded || this.loaded;
    if (loaded[cmpDescriptor]) {
        return { "key": cmpDescriptor, "value": loaded[cmpDescriptor] };
    } else if (loaded[appDescriptor]) {
        return { "key": appDescriptor, "value": loaded[appDescriptor] };
    }
    return null;
};

/**
 * This should be private but is needed for testing... ideas?
 *
 * ... should move to $A.test.
 * @export
 */
Aura.Context.AuraContext.prototype.getLoaded = function() {
    return this.loaded;
};

/**
 * Reset the loaded set to its original value at launch.
 */
Aura.Context.AuraContext.prototype.resetLoaded = function() {
    this.loaded = $A.util.apply({}, this.loadedOriginal);
};

/**
 * DCHASMAN Will be private again soon as part of the second phase of W-1450251
 * @export
 */
Aura.Context.AuraContext.prototype.setCurrentAction = function(action) {
    var previous = this.currentAction;
    this.currentAction = action;
    return previous;
};

/**
 * EBA - temporarily made public for helpers to obtain action - return to private when current visibility is determined
 * @public
 * @return {Action} the current action.
 * @export
 */
Aura.Context.AuraContext.prototype.getCurrentAction = function() {
    return this.currentAction;
};

/**
 * Temporarily made public for Communities - return to private when prefixes are not needed
 * @public
 * @return {String} path prefix.
 * @export
 */
Aura.Context.AuraContext.prototype.getPathPrefix = function () {
    return this.pathPrefix;
};

/**
 * Servlet container context path
 * @return {String} Servlet container context path
 * @private
 * @export
 */
Aura.Context.AuraContext.prototype.getContextPath = function() {
    return this.contextPath;
};

/** @export */
Aura.Context.AuraContext.prototype.setContextPath = function(path) {
    this.contextPath = path;
};
