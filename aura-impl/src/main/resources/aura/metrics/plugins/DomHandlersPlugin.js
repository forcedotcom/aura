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

DomHandlersPlugin.prototype.dispatchActionHook = function (action, event, cmp) {
    // We want to get the localId of the component with the handler 
    // and the component who owns the action (its lexical scope)
    var localCmpId = cmp.getLocalId(); 
    var dispatchCmpId = action.getComponent().getConcreteComponent().getLocalId();

    // Only if we have a uniquely identier send the interaction
    if (localCmpId && dispatchCmpId) { 
        var target = cmp["getElement"]();
        var meta = target && target.getAttribute('data-meta-state'); // optional metadata

        var context = {
            "locator" : {
                "cmpId"    : cmp.getGlobalId(),
                "root"     : localCmpId,
                "parent"   : dispatchCmpId,
                "selector" : target.nodeName + ' ' + target.className.trim()
            },
            "type" : event.type,
            "action" : action.getDef().getDescriptor().toString()
        };

        if (meta) {
            var state = {};
            state[meta] = target.getAttribute('data-' + meta);
            context["locator"]["context"] = state;
        }

        this.metricsService.transaction('aura', 'interaction', { "context": context });
    }
};

DomHandlersPlugin.prototype.dispatchVirtualActionHook = function (action, event, virtualCmp) {
    // For virtualActions we want to capture only clicks for now
    if (event.type === 'click') {
        this.dispatchActionHook(action, event, virtualCmp);
    }
};

DomHandlersPlugin.prototype.bind = function (metricsService) {
    var self = this;
    $A.clientService.runAfterInitDefs(function () {
        // Hooking html helper to intercept all interactions
        var defConfig  = $A.componentService.createDescriptorConfig('markup://aura:html');
        var def        = $A.componentService.getComponentDef(defConfig);
        var defHelper  = def && def.getHelper();

        if (defHelper) {
            metricsService.instrument(
                defHelper, 
                'dispatchAction', 
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
        defConfig  = $A.componentService.createDescriptorConfig('markup://ui:virtualList');
        def        = $A.componentService.getComponentDef(defConfig);
        defHelper  = def && def.getHelper();

        if (defHelper) {
            metricsService.instrument(
                defHelper, 
                '_dispatchAction', 
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
        var defConfig  = $A.componentService.createDescriptorConfig('markup://aura:html');
        var htmlDef    = $A.componentService.getComponentDef(defConfig);
        var htmlHelper = htmlDef.getHelper();
    metricsService["unInstrument"](htmlHelper, 'dispatchAction');
};

$A.metricsService.registerPlugin({
    "name"   : DomHandlersPlugin.NAME,
    "plugin" : DomHandlersPlugin
});
