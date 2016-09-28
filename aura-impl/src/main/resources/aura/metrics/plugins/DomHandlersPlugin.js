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
 * DomHandlersPlugin
 * =================
 * This plugin hooks into the definition of aura:html component.
 * In particular the following methods:
 * dispatchAction(): Tracks all interactions (click, mouseovers, any DOM handlers) 
 * handled by any active component
 *
 * @description DomHandlersPlugin
 * @constructor
 * @export
 */
var DomHandlersPlugin = function DomHandlersPlugin(config) {
    this.config = config;
    this["enabled"] = true;
};

DomHandlersPlugin.NAME = "domHandlers";
DomHandlersPlugin.DEFAULT_INTERACTION_TYPE = "user";
DomHandlersPlugin.WHITELISTEVENTS = { 
    "click" : true // only click for now
};

/** @export */
DomHandlersPlugin.prototype.initialize = function (metricsService) {
    this.metricsService = metricsService;

    if (this["enabled"]) {
        this.bind(metricsService);
    }
};

/** @export */
DomHandlersPlugin.prototype.enable = function () {
    if (!this["enabled"]) {
        this["enabled"] = true;
        this.bind(this.metricsService);
    }
};

/** @export */
DomHandlersPlugin.prototype.disable = function () {
    if (this["enabled"]) {
        this["enabled"] = false;
        this.unbind(this.metricsService);
    }
};

/*
// We might need this method somewhere in the future

DomHandlersPlugin.prototype.stringifyLocator = function (locator) {
    var ordered = { 
        target  : locator.target, 
        scope   : locator.scope, 
        context : locator.context && Object.keys(locator.context).sort().reduce(function (r, k) { r[k] = locator.context[k]; return r; }, {}) 
    };

    if (!locator.context) {
        delete locator.context;
    }
    
    return JSON.stringify(ordered);
};
*/

DomHandlersPlugin.prototype.dispatchActionHook = function (action, event, cmp) {
    if (!(event.type in DomHandlersPlugin.WHITELISTEVENTS)) {
        return;
    }
    
    var localCmpId = cmp.getLocalId();
    var ownerCmp = action.getComponent().getConcreteComponent();
    // TODO: remove includeMetadata param before 206 release freeze: W-3378426
    var locator = ownerCmp.getLocator(localCmpId, false /*includeMetadata*/);
    var ms = this.metricsService;

    // Only if we have a unique, identifier send the interaction
    if (locator) { 
        var target = cmp["getElement"]();
        var meta = target && target.getAttribute("data-refid"); // optional metadata

        var context = {
            "locator"     : locator,
            "eventType"   : DomHandlersPlugin.DEFAULT_INTERACTION_TYPE,
            "eventSource" : event.type, // type of event (click, hover, scroll)
            "attributes"  : {
                "auraAction"  : action.getDef().getDescriptor().toString()    
            }
        };
        
        if (meta) {
            locator["context"] = locator["context"] || {};
            if (!locator["context"][meta]) {
                locator["context"][meta] = target.getAttribute("data-" + meta);
            }
        }

        ms.transaction("aura", "interaction", { "context": context });
    } else {
        this.logUnInstrumentedClick(action, cmp);
    }
};

DomHandlersPlugin.prototype.dispatchVirtualActionHook = function (action, event, virtualCmp) {
    // For virtualActions we want to capture only clicks for now
    if (event.type === "click") {
        this.dispatchActionHook(action, event, virtualCmp);
    }
};

DomHandlersPlugin.prototype.logUnInstrumentedClick = function (action, cmp) {
    var parent = action.getComponent().getConcreteComponent();
    var grandparent = parent.getComponentValueProvider().getConcreteComponent();
    var grandparentContainer = grandparent.getComponentValueProvider().getConcreteComponent();
    // cmp will always be an aura:html component. It's the root of all our click handlers
    var hierarchy = {
            "rootHtmlTag": cmp.get("v.tag"),
            "rootId" : cmp.getLocalId(),
            "parent": parent.getDef().toString(),
            "parentId": parent.getLocalId(),
            "grandparent": grandparent.getDef().toString(),
            "grandparentId": grandparent.getLocalId(),
            "grandparentContainer": grandparentContainer.getDef().toString()
    };
    $A.metricsService.transaction("ltng", "performance:missingLocator", { "context": {
        "attributes": hierarchy
    }});
    $A.log("WARNING: **** Un-Instrumented click logged. Details: " + JSON.stringify(hierarchy));
};

DomHandlersPlugin.prototype.bind = function (metricsService) {
    var self = this;
    $A.clientService.runAfterInitDefs(function () {
        // Hooking html helper to intercept all interactions
        var defConfig  = $A.componentService.createDescriptorConfig("markup://aura:html");
        var def        = $A.componentService.getComponentDef(defConfig);
        var defHelper  = def && def.getHelper();

        if (defHelper) {
            metricsService.instrument(
                defHelper, 
                "dispatchAction", 
                DomHandlersPlugin.NAME,
                false/*async*/,
                null, 
                null,
                function (original) {
                    var xargs = Array.prototype.slice.call(arguments, 1);
                    self.dispatchActionHook.apply(self, xargs);
                    return original.apply(this, xargs);
                }
            );
        }

        // Hooking special handling for virtualList
        defConfig  = $A.componentService.createDescriptorConfig("markup://ui:virtualList");
        def        = $A.componentService.getComponentDef(defConfig);
        defHelper  = def && def.getHelper();

        if (defHelper) {
            metricsService.instrument(
                defHelper, 
                "_dispatchAction", 
                DomHandlersPlugin.NAME,
                false/*async*/,
                null, 
                null,
                function (original) {
                    var xargs = Array.prototype.slice.call(arguments, 1);
                    self.dispatchVirtualActionHook.apply(self, xargs);
                    return original.apply(this, xargs);
                }
            );
        }


        // Hooking special handling for virtualList
        defConfig  = $A.componentService.createDescriptorConfig("markup://ui:virtualDataGrid");
        def        = $A.componentService.getComponentDef(defConfig);
        defHelper  = def && def.getHelper();

        if (defHelper) {
            metricsService.instrument(
                defHelper, 
                "_dispatchAction",
                DomHandlersPlugin.NAME,
                false/*async*/,
                null, 
                null,
                function (original) {
                    var xargs = Array.prototype.slice.call(arguments, 1);
                    self.dispatchVirtualActionHook.apply(self, xargs);
                    return original.apply(this, xargs);
                }
            );
        }
    });
};

//#if {"excludeModes" : ["PRODUCTION"]}
/** @export */
DomHandlersPlugin.prototype.postProcess = function (transportMarks) {
    return transportMarks;
};
//#end

DomHandlersPlugin.prototype.unbind = function (metricsService) {
        var defConfig  = $A.componentService.createDescriptorConfig("markup://aura:html");
        var htmlDef    = $A.componentService.getComponentDef(defConfig);
        var htmlHelper = htmlDef.getHelper();
    metricsService["unInstrument"](htmlHelper, "dispatchAction");
};

$A.metricsService.registerPlugin({
    "name"   : DomHandlersPlugin.NAME,
    "plugin" : DomHandlersPlugin
});
