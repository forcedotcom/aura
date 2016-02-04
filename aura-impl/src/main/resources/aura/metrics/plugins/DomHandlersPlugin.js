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
    this["enabled"] = true; // Do not enable it automatically
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

DomHandlersPlugin.prototype.dispatchActionHook = function (original, action, event, cmp) {
    var localCmpId = cmp.getLocalId();
    var dispatchCmpId = action.getComponent().getLocalId();

    if (localCmpId && dispatchCmpId) {
        var contextId = localCmpId + ':' + dispatchCmpId;

        $A.log({
            "id": contextId,
            "eventType": event.type,
            "action" : action.getDef().getDescriptor().toString()
        });    
    }

    var ret = original.apply(this, Array.prototype.slice.call(arguments, 1));
    return ret;
};

DomHandlersPlugin.prototype.bind = function (metricsService) {
    $A.clientService.runAfterInitDefs(function () {
        var defConfig  = $A.componentService.createDescriptorConfig('markup://aura:html');
        var htmlDef    = $A.componentService.getComponentDef(defConfig);
        var htmlHelper = htmlDef.getHelper();

        metricsService.instrument(
            htmlHelper, 
            'dispatchAction', 
            DomHandlersPlugin.NAME,
            false/*async*/,
            null, 
            null,
            this.dispatchActionHook
        );

    }.bind(this));
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
