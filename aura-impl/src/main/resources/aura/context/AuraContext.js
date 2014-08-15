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
/*jslint sub: true*/
/**
 * @namespace Represents a Aura client-side context, created during HTTP requests for component definitions. A context
 *            can include a mode, such as "DEV" for development mode or "PROD" for production mode.
 * @constructor
 * @protected
 * @class AuraContext
 * @param {Object} config the 'founding' config for the context from the server.
 * @param {Function} initCallback an optional callback invoked after the config has finished its
 *  asynchronous initialization.
 */
function AuraContext(config, initCallback) {
    var i, defs, length;

    this.mode = config["mode"];
    this.loaded = config["loaded"];
    if (this.loaded === undefined) {
        this.loaded = {};
    }
    this.lastmod = config["lastmod"];
    this.fwuid = config["fwuid"];
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

    var that = this;
    this.globalValueProviders = new $A.ns.GlobalValueProviders(config["globalValueProviders"], function() {
        // Careful now, the def is null, this fake action sets up our paths.
        that.currentAction = new Action(null, ""+that.num, null, null, false, null, false);
        if (config["componentDefs"]) {
            defs = config["componentDefs"];
            length = defs.length;
            for (i = 0; i < length; i++) {
                $A.services.component.getDef(defs[i]);
            }
        }
        if (config["eventDefs"]) {
            defs = config["eventDefs"];
            length = defs.length;
            for (i = 0; i < length; i++) {
                $A.services.event.getEventDef(defs[i]);
            }
        }
        that.joinComponentConfigs(config["components"], that.currentAction.getId());

        if (initCallback) {
            initCallback();
        }
    });
}

/**
 * Returns the mode for the current request. Defaults to "PROD" for production mode and "DEV" for development mode.
 * The HTTP request format is <code>http://<your server>/namespace/component?aura.mode=PROD</code>.
 * 
 *
 * @return {string} the mode from the server.
 */
AuraContext.prototype.getMode = function() {
    return this.mode;
};

/**
 * Provides access to global value providers.
 * For example, <code>$A.get("$Label.Related_Lists.task_mode_today");</code> gets the label value.
 *
 * @private
 * @return {GlobalValueProviders}
 */
AuraContext.prototype.getGlobalValueProviders = function() {
    return this.globalValueProviders;
};

/**
 * JSON representation of context for server requests
 * @private
 * @return {String} json representation
 */
AuraContext.prototype.encodeForServer = function() {
    return aura.util.json.encode({
        "mode" : this.mode,
        "loaded" : this.loaded,
        "dn" : $A.services.component.getDynamicNamespaces(),
        "app" : this.app,
        "cmp" : this.cmp,
        "lastmod" : this.lastmod,
        "fwuid" : this.fwuid,
        "test" : this.test
    });
};

/**
 * @private
 * @param {Object}
 *      otherContext the context from the server to join in to this one.
 */
AuraContext.prototype.join = function(otherContext) {
    var i, defs, length;

    if (otherContext["mode"] !== this.getMode()) {
        throw new Error("Mode mismatch");
    }
    if ($A.util.isUndefinedOrNull(this.fwuid)) {
        this.fwuid = otherContext["fwuid"];
    }
    if (otherContext["fwuid"] !== this.fwuid) {
        throw new Error("framework mismatch");
    }
    this.globalValueProviders.join(otherContext["globalValueProviders"]);
    $A.localizationService.init();
    if (otherContext["componentDefs"]) {
        defs = otherContext["componentDefs"];
        length = defs.length;
        for (i = 0; i < length; i++) {
            $A.services.component.getDef(defs[i]);
        }
    }
    if (otherContext["eventDefs"]) {
        defs = otherContext["eventDefs"];
        length = defs.length;
        for (i = 0; i < length; i++) {
            $A.services.event.getEventDef(defs[i]);
        }
    }
    this.joinComponentConfigs(otherContext["components"], ""+this.getNum());
    this.joinLoaded(otherContext["loaded"]);
};

/**
 * FIXME: this should return a string, and it should probably not even be here.
 *
 * @private
 * @return {number} the 'num' for this context
 */
AuraContext.prototype.getNum = function() {
    return this.num;
};

/**
 * @private
 */
AuraContext.prototype.incrementNum = function() {
    this.num = this.num + 1;
    this.lastGlobalId = 0;
    return this.num;
};

/**
 * @private
 */
AuraContext.prototype.incrementRender = function() {
    this.renderNum = this.renderNum + 1;
    return this.renderNum;
};

/**
 * @private
 * @return {Number} incremented transaction number
 */
AuraContext.prototype.incrementTransaction = function() {
    this.transaction = this.transaction + 1;
    return this.transaction;
};

/**
 * @private
 * @return {Number} gets the number of the current transaction
 */
AuraContext.prototype.getTransaction = function() {
    return this.transaction;
};

/**
 * @private
 */
AuraContext.prototype.updateTransactionName = function(_transactionName) {
    if (_transactionName) {
        this.transactionName =  (this.trasactionName !== "") ? (this.transactionName + "-" + _transactionName) : _transactionName;
    }
};

/**
 * @private
 * @return {String} gets the name of the transaction
 */
AuraContext.prototype.getTransactionName = function() {
    return this.transactionName;
};

/**
 * @private
 */
AuraContext.prototype.clearTransactionName = function() {
    this.transactionName = "";
};

/**
 * @private
 * @return {Number} Next global ID
 */
AuraContext.prototype.getNextGlobalId = function() {
    this.lastGlobalId = this.lastGlobalId + 1;
    return this.lastGlobalId;
};

/**
 * Returns components configs object
 * @private
 * @param {String} creationPath creation path to check
 * @return {Boolean} Whether creation path is in component configs
 */
AuraContext.prototype.containsComponentConfig = function(creationPath) {
    return this.componentConfigs.hasOwnProperty(creationPath);
};

/**
 * @private
 *
 * @param {string} creationPath the creation path to look up.
 */
AuraContext.prototype.getComponentConfig = function(creationPath) {
    var componentConfigs = this.componentConfigs;
    var ret = componentConfigs[creationPath];
    delete componentConfigs[creationPath];
    return ret;
};

/**
 * Returns the app associated with the request.
 */
AuraContext.prototype.getApp = function() {
    return this.app;
};

/**
 * @private
 * @param {Object}
 *      otherComponentConfigs the component configs from the server to join in.
 * @param {string}
 *      actionId the id of the action that we are joining in (used to amend the creationPath).
 */
AuraContext.prototype.joinComponentConfigs = function(otherComponentConfigs, actionId) {
    var cP, idx, config, def;

    if (otherComponentConfigs) {
        for (idx = 0; idx < otherComponentConfigs.length; idx++) {
            config = otherComponentConfigs[idx];
            def = config["componentDef"];
            if (def) {
                componentService.getDef(def);
            }
            cP = config["creationPath"];
            this.componentConfigs[actionId+cP] = config;
        }
    }
};

/**
 * Internal routine to clear out component configs to factor out common code.
 *
 * @private
 * @param {string} actionId the action id that we should clear.
 * @param {boolean} logit should we log as we go? including errors.
 * @return {number} the count of component configs removed.
 */
AuraContext.prototype.internalClear = function(actionId, logit) {
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
        $A.error("leftover configs");
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
 * @private
 * @param {string} actionId the action id that we should clear.
 */
AuraContext.prototype.finishComponentConfigs = function(actionId) {
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
 */
AuraContext.prototype.clearComponentConfigs = function(actionId) {
    return this.internalClear(actionId, false);
};

/**
 * @private
 */
AuraContext.prototype.joinLoaded = function(loaded) {
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
 * This should be private but is needed for testing... ideas?
 *
 * ... should move to $A.test.
 */
AuraContext.prototype.getLoaded = function() {
    return this.loaded;
};

/**
 * DCHASMAN Will be private again soon as part of the second phase of W-1450251
 */
AuraContext.prototype.setCurrentAction = function(action) {
    var previous = this.currentAction;
    this.currentAction = action;
    return previous;
};

/**
 * EBA - temporarily made public for helpers to obtain action - return to private when current visibility is determined
 * @public
 * @return {Action} the current action.
 */
AuraContext.prototype.getCurrentAction = function() {
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
