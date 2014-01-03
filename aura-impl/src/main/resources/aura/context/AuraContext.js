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
 * @param {Object}
 *      config the 'founding' config for the context from the server.
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

    this.joinComponentConfigs(config["components"], "");
    this.globalValueProviders = new $A.ns.GlobalValueProviders(config["globalValueProviders"]);
}

/**
 * Returns the mode for the current request. Defaults to "PROD" for production mode and "DEV" for development mode.
 * The HTTP request format is <code>http://<your server>/namespace/component?aura.mode=PROD</code>.
 * <p>See Also: <a href="#help?topic=modesReference">AuraContext</a></p>
 *
 * @return {string} the mode from the server.
 */
AuraContext.prototype.getMode = function() {
    return this.mode;
};

/**
 * Provides access to global value providers.
 * For example, <code>$A.getGlobalValueProviders().get("$Label.Related_Lists.task_mode_today");</code> gets the label value.
 * <p>See Also: <a href="#help?topic=dynamicLabel">Dynamically Constructing Labels</a></p>
 * @return {GlobalValueProviders}
 */
AuraContext.prototype.getGlobalValueProviders = function() {
    return this.globalValueProviders;
};

/**
 * @private
 */
AuraContext.prototype.encodeForServer = function() {
    var dn = this.getDynamicNamespaces();
    
    return aura.util.json.encode({
        "mode" : this.mode,
        "dn" : dn,
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
    for ( var n = 0; n < descriptors.length; n++) {
        var desc = descriptors[n];
        if (desc.indexOf("layout://") === 0) {
            dynamicNamespaces.push(new DefDescriptor(desc).getNamespace());
        }
    }

    return dynamicNamespaces;
};

/**
 * @private
 * @param {Object}
 *      otherContext the context from the server to join in to this one.
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
    this.globalValueProviders.join(otherContext["globalValueProviders"]);
    $A.localizationService.init();
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
 * @return transaction number
 */
AuraContext.prototype.incrementTransaction = function() {
    this.transaction = this.transaction + 1;
    return this.transaction;
};

/**
 * @private
 * @return gets the number of the current transaction
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
 * @return gets the name of the transaction
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
 */
AuraContext.prototype.getNextGlobalId = function() {
    this.lastGlobalId = this.lastGlobalId + 1;
    return this.lastGlobalId;
};

/**
 * @private
 */
AuraContext.prototype.getComponentConfig = function(globalId) {
    var componentConfigs = this.componentConfigs;
    var ret = componentConfigs[globalId];
    delete componentConfigs[globalId];
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
    if (otherComponentConfigs) {
        for ( var k in otherComponentConfigs) {
            if (otherComponentConfigs.hasOwnProperty(k)) {
                var config = otherComponentConfigs[k];
                var def = config["componentDef"];
                if (def) {
                    componentService.getDef(def);
                }
                this.componentConfigs[k] = config;
            }
        }
    }
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
 * @param {string}
 *      actionId the id of the action to strip out.
 */
AuraContext.prototype.finishComponentConfigs = function(actionId) {
    var count = 0;
    var ccs = this.componentConfigs;
    var suffix = ":"+actionId;
    var len = suffix.length;
    var error = "";

    for ( var k in ccs ) {
        if (ccs.hasOwnProperty(k) && k.substr(-len) === suffix) {
            $A.log("config not consumed: "+k, ccs[k]);
            delete ccs[k];
            if (error !== "") {
                error = error+",";
            }
            error = error + k;
        } else {
            count += 1;
        }
    }
    if (error !== "") {
        $A.error(error);
    }
    if (count === 0) {
        this.componentConfigs = {};
    } else {
        $A.log("leftover configs ", ccs);
        $A.error("leftover configs");
    }
};

/**
 * Clear out pending component configs.
 *
 * This routine can be used in error conditions (or in tests) to clear out
 * configs left over by an action. In this case, we remove them, and drop
 * them on the floor to be garbage collected.
 *
 * @public
 * @param {string}
 *      actionId the action id that we should clear.
 * @return {number} the count of component configs removed.
 */
AuraContext.prototype.clearComponentConfigs = function(actionId) {
    var removed = 0;
    var count = 0;
    var ccs = this.componentConfigs;
    var suffix = ":"+actionId;
    var len = suffix.length;
    var offset;

    for ( var k in ccs ) {
        //
        // Have a care with this. IE7 does not handle negative offsets
        // to substr, so this must actually calculate the offset rather
        // than using -len.
        //
        offset = k.length - len;
        if (ccs.hasOwnProperty(k) && k.substr(offset) === suffix) {
            removed += 1;
            delete ccs[k];
        } else {
            count += 1;
        }
    }
    if (count === 0) {
        this.componentConfigs = {};
    }
    return removed;
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
 * This should be private but is needed for testing and dev modes.
 *
 * ... should move to $A.test.
 */
AuraContext.prototype.getPreloadedNamespaces = function() {
    return this.preloads;
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
 * @private
 */
AuraContext.prototype.getCurrentAction = function(action) {
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
