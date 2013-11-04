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
/*jslint sub: true, debug: true */

/**
 * Export symbols. TODO(fabbott): Destroy this when we're consistently using Closure's exportSymbols directive instead.
 */
function exp() {
    var obj = arguments[0];

    for ( var i = 1; i < arguments.length; i++) {
        var name = arguments[i];
        i++;
        var val = arguments[i];
        obj[name] = val;
    }
}

/**
 * @namespace This, $A, is supposed to be our ONLY window-polluting top-level variable. Everything else in Aura is
 *            attached to it. Note that this almost empty object $A is replaced later, after $A.ns (created below) is
 *            populated with the types that can be used to populate the "real" $A. TODO(fabbott): Make that "only gobal
 *            name" goal become true; today it ain't.
 */
window['$A'] = {};

/**
 * @namespace The separate Aura "namespace" object contains Aura types, as opposed to instances and properties and such
 *            which might hang off $A. This allows some colliding or near-miss variable duplication (e.g. $A.util is an
 *            instance of $A.ns.Util), and collects our proper types into one place. The types themselves must be proper
 *            functional objects with prototypes, or Closure can't deal with obfuscating them (and particularly their
 *            exports) properly.
 */
$A.ns = {};
$A['ns'] = $A.ns; // TODO: use exportSymbols when available

var clientService;

// #include aura.util.Function
// #include aura.util.Util
// #include {"modes" : ["TESTING","AUTOTESTING", "TESTINGDEBUG", "AUTOTESTINGDEBUG", "DOC"], "path" : "aura.test.Test"}
// #include aura.system.DefDescriptor
// #include aura.util.Json
// #include aura.util.Transport
// #include aura.util.Style
// #include aura.util.Bitset
// #include aura.util.NumberFormat
// #include aura.context.AuraContext
// #include aura.value.BaseValue
// #include aura.value.AttributeValue
// #include aura.value.SimpleValue
// #include aura.value.MapValue
// #include aura.value.ArrayValue
// #include aura.value.PropertyReferenceValue
// #include aura.value.FunctionCallValue
// #include aura.value.ActionReferenceValue
// #include aura.value.PassthroughValue
// #include aura.model.ModelDef
// #include aura.component.ComponentDefRegistry
// #include aura.component.Component
// #include aura.component.InvalidComponent
// #include aura.renderer.RendererDef
// #include aura.provider.ProviderDef
// #include aura.helper.HelperDefRegistry
// #include aura.event.EventDefRegistry
// #include aura.event.EventDef
// #include aura.event.Event
// #include aura.helper.HelperDef
// #include aura.layouts.LayoutItemDef
// #include aura.layouts.LayoutDef
// #include aura.controller.ActionDef
// #include aura.controller.Action
// #include aura.attribute.AttributeDef
// #include aura.attribute.AttributeSet
// #include aura.attribute.AttributeDefSet
// #include aura.renderer.RendererDefRegistry
// #include aura.style.StyleDef
// #include aura.component.ComponentDef
// #include aura.controller.ControllerDef
// #include aura.controller.ControllerDefRegistry
// #include aura.controller.ActionDefRegistry
// #include aura.model.ModelDefRegistry
// #include aura.provider.ProviderDefRegistry
// #include aura.layouts.LayoutsDef
// #include aura.model.ValueDef
// #include aura.l10n.AuraLocalizationContext
// #include aura.AuraClientService
// #include aura.AuraComponentService
// #include aura.AuraSerializationService
// #include aura.AuraRenderingService
// #include aura.AuraExpressionService
// #include aura.AuraHistoryService
// #include aura.AuraEventService
// #include aura.AuraLayoutService
// #include aura.AuraLocalizationService
// #include {"excludeModes" : ["PRODUCTION"], "path" : "aura.AuraDevToolService"}
// #include aura.value.ValueFactory
// #include aura.value.ExpressionFunctions
// #include aura.model.Model
// #include aura.storage.AuraStorageService
// #include aura.storage.Storage
// #include aura.provider.GlobalValueProviders
// #include aura.provider.LabelQueue
// #include aura.provider.LabelValueProvider
// #include aura.provider.SimpleValueProvider

/**
 * @class The Aura framework. Default global instance name is $A.
 * @constructor
 */
$A.ns.Aura = function() {
    this.util = new $A.ns.Util();
    this["util"] = this.util;
    //#if {"modes" : ["TESTING","AUTOTESTING", "TESTINGDEBUG", "AUTOTESTINGDEBUG"]}
    this.test = new Test();
    this["test"] = this.test;
    //#end

    this.clientService = new AuraClientService();
    this.componentService = new AuraComponentService();
    this.serializationService = new AuraSerializationService();
    this.renderingService = new AuraRenderingService();
    this.expressionService = new AuraExpressionService();
    this.historyService = new AuraHistoryService();
    this.eventService = new AuraEventService();
    this.layoutService = new AuraLayoutService();
    this.localizationService = new AuraLocalizationService();
    this.storageService = new AuraStorageService();

    //#if {"excludeModes" : ["PRODUCTION"]}
    this.devToolService = new AuraDevToolService();
    //#end
    var aura = this;

    /** @field */
    this.services = {
        /**
         * Rendering Service
         *
         * @public
         * @type AuraRenderingService
         * @memberOf Aura.prototype
         */
        rendering : aura.renderingService,
        /**
         * Event Service
         *
         * @public
         * @type AuraEventService
         * @memberOf Aura.prototype
         */
        event : aura.eventService,
        /**
         * Component Service
         *
         * @public
         * @type AuraComponentService
         * @memberOf Aura.prototype
         */
        component : aura.componentService,
        /**
         * Client Service
         *
         * @public
         * @type AuraClientService
         * @memberOf Aura.prototype
         */
        client : aura.clientService,

        /**
         * History Service
         *
         * @public
         * @type AuraHistoryService
         * @memberOf Aura.prototype
         */
        history : aura.historyService,

        /**
         * Localization Service
         *
         * @public
         * @type AuraLocalizationService
         * @memberOf Aura.prototype
         */
        localization : aura.localizationService,

        /**
         * Storage Service
         *
         * @public
         * @type AuraStorageService
         * @memberOf Aura.prototype
         */
        storage : aura.storageService,

        /**
         * Alias of Component Service
         *
         * @public
         * @type AuraComponentService
         * @memberOf Aura.prototype
         * @see Aura#services.component
         */
        cmp : aura.componentService,
        /**
         * Alias of Event Service
         *
         * @public
         * @type AuraEventService
         * @memberOf Aura.prototype
         * @see Aura#services.event
         */
        e : aura.eventService,

        /**
         * Alias of Localization Service
         *
         * @public
         * @type AuraLocalizationService
         * @memberOf Aura.prototype
         * @see Aura#service.localization
         */
        l10n : aura.localizationService,

        getValue : function(key) {
            var ret = $A.services[key];
            if (!ret && key === "root") {
                return $A.getRoot();
            }
            return ret;
        }
    };

    /**
     * Equivalent to <code>$A.clientService.enqueueAction()</code>.
     * <p>See Also: <a href="#reference?topic=api:AuraClientService">AuraClientService</a></p>
     * @public
     * @function
     * @param {Action} action
     * @borrows AuraClientService.enqueueAction
     */
    this.enqueueAction = this.clientService.enqueueAction;

    /**
     * Equivalent to <code>$A.renderingService.render()</code>.
     * <p>See Also: <a href="#reference?topic=api:AuraRenderingService">AuraRenderingService</a></p>
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraRenderingService.render
     */
    this.render = this.renderingService.render;

    /**
     * Equivalent to <code>$A.renderingService.rerender()</code>.
     * <p>See Also: <a href="#reference?topic=api:AuraRenderingService">AuraRenderingService</a></p>
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraRenderingService.rerender
     */
    this.rerender = this.renderingService.rerender;

    /**
     * Equivalent to <code>$A.renderingService.unrender()</code>.
     * <p>See Also: <a href="#reference?topic=api:AuraRenderingService">AuraRenderingService</a></p>
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraRenderingService.unrender
     */
    this.unrender = this.renderingService.unrender;

    /**
     * Equivalent to <code>$A.renderingService.afterRender()</code>.
     * <p>See Also: <a href="#reference?topic=api:AuraRenderingService">AuraRenderingService</a>
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraRenderingService.afterRender
     */
    this.afterRender = this.renderingService.afterRender;

    /**
     * Equivalent to <code>$A.componentService.get()</code>.
     * <p>See Also: <a href="#reference?topic="AuraComponentService">AuraComponentService</a></p>
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraComponentService.get
     */
    this.getCmp = this.componentService.get;

    this.newCmp = this.componentService.newComponent;
    this.newCmpDeprecated = this.componentService.newComponentDeprecated;
    this.newCmpAsync = this.componentService.newComponentAsync;

    /**
     * Equivalent to <code>$A.eventService.newEvent()</code>.
     * <p>See Also: <a href="#reference?topic="AuraEventService">AuraEventService</a></p>
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraEventService.newEvent
     */
    this.getEvt = this.eventService.newEvent;

    // TODO: convert to //#exportSymbols when available
    exp(aura,
        "clientService", aura.clientService,
        "componentService", aura.componentService,
        "serializationService", aura.serializationService,
        "renderingService", aura.renderingService,
        "expressionService", aura.expressionService,
        "historyService", aura.historyService,
        "localizationService", aura.localizationService,
        "eventService", aura.eventService,
        "layoutService", aura.layoutService,
        "storageService", aura.storageService,
        "services", aura.services,
        "enqueueAction", aura.enqueueAction,
        "render", aura.render,
        "rerender", aura.rerender,
        "unrender", aura.unrender,
        "afterRender", aura.afterRender,
        "getCmp", aura.getCmp,
        //#if {"excludeModes" : ["PRODUCTION"]}
            "devToolService", aura.devToolService,
            "getQueryStatement", aura.devToolService.newStatement,
            "qhelp", function() { return aura.devToolService.help() },
        //#end
        "newCmp", aura.newCmp,
        "newCmpDeprecated", aura.newCmpDeprecated,
        "newCmpAsync", aura.newCmpAsync,
        "getEvt", aura.getEvt);
    var services = aura.services;

    // TODO: convert to //#exportSymbols when available
    exp(services,
        "rendering", services.rendering,
        "event", services.event,
        "component", services.component,
        "client", services.client,
        "history", services.history,
        "l10n", services.localization,
        "storage", services.storage,
        "cmp", services.cmp,
        "e", services.e,
        "getValue", services.getValue,
        "c", {
                getValue : function(name) {
                    return services.cmp.getControllerDef({descriptor : name});
                }
            }
    );

    this.eventService.addHandler({
        event : 'aura:systemError',
        "globalId" : "Aura",
        "handler" : function(evt) {
            aura.log(evt.getParam('message'), evt.getParam('error'));
        }
    });
};

/**
 * Initializes Aura with context info about the app that should be loaded.
 * @param {Object} config
 *
 * {
 *      <code>config.descriptor</code> : The descriptor of the application or component that should be loaded as the root. For example, <code>"markup://foo:bar"</code><br />
 *      <code>config.attributes</code> : The attributes that should be passed into the root component when it is constructed. For example, <code>{at1 : 1, at2 : "asdf"}</code><br />
 *      <code>config.defType</code> : The defType of the descriptor.  For example, <code>"DEFINITION"</code> or <code>"APPLICATION"</code><br />
 *      <code>config.lastmod</code> : The timestamp, in millis of the latest changes to the preloaded metadata associated with this application.
 * }
 * @public
 */
$A.ns.Aura.prototype.initAsync = function(config) {
    $A.mark("Component Load Complete");
    $A.mark("Component Load Initiated");
    $A.context = new AuraContext(config["context"]);
    clientService.initHost(config["host"]);
    clientService.loadComponent(config["descriptor"], config["attributes"], function(resp) {
        $A.initPriv(resp);
        $A.endMark("Component Load Complete");
    }, config["deftype"]);

    $A.endMark("Component Load Initiated");
};

/**
 * Initializes Aura with context info but without retrieving component from server. Used for synchronous initialization.
 *
 * @param {Object} config The configuration attributes
 * @param {Boolean} useExisting
 * @param {Boolean} doNotInitializeServices Set to true if Layout and History services should not be initialized, or false if
 * 	 they should. Defaults to true for Aura Integration Service.
 * @param {Boolean} doNotCallJiffyOnLoad True if Jiffy.onLoad() should not be called after initialization. In case of
 *       IntegrationService when aura components are embedded on the page, onLoad is called by the parent container.
 */
$A.ns.Aura.prototype.initConfig = function(config, useExisting, doNotInitializeServices, doNotCallJiffyOnLoad) {
    config = $A.util.json.resolveRefs(config);

    if (!useExisting || $A.util.isUndefined($A.getContext())) {
        clientService.initHost(config["host"]);

        $A.context = new AuraContext(config["context"]);
        this.init(config["instance"], config["token"], config["context"], null, doNotInitializeServices, doNotCallJiffyOnLoad);
    } else {
        // Use the existing context and just join the new context into it
        $A.getContext().join(config["context"]);
    }
};

/**
 * Initializes Aura in a specified mode.
 * @param {Object} config The descriptor (<code>"markup://foo:bar"</code>), attributes, defType (<code>"APPLICATION"</code> or <code>"COMPONENT"</code>), and timestamp of last modified change
 * @param {String} token
 * @param {Object} context The mode of the application or component ("DEV", "PROD", "PTEST")
 * @param {Object} container Sets the container for the component.
 * @param {Boolean} doNotInitializeServices Set to true if Layout and History services should not be initialized, or false if
 * 	 they should. Defaults to true for Aura Integration Service.
 * @param {Boolean} doNotCallJiffyOnLoad True if Jiffy.onLoad() should not be called after initialization. In case of
 *       IntegrationService when aura components are embedded on the page, onLoad is called by the parent container.
 */
$A.ns.Aura.prototype.init = function(config, token, context, container, doNotInitializeServices, doNotCallJiffyOnLoad) {
    var component = $A.util.json.resolveRefs(config);
    $A.initPriv(component, token, container, doNotInitializeServices, doNotCallJiffyOnLoad);
};

/**
 * Initializes Aura in debug environment.
 *
 * @param {Object} config The descriptor ("markup://foo:bar"), attributes, defType ("APPLICATION" or "COMPONENT"), and
 *        timestamp of last modified change
 * @param {String} token
 * @param {Object} container Sets the container for the component.
 * @param {Boolean=} doNotInitializeServices True if Layout and History services should not be initialized, or false if
 *        they should. Defaults to true for Aura Integration Service.
 * @param {Boolean} doNotCallJiffyOnLoad True if Jiffy.onLoad() should not be called after initialization. In case of
 *       IntegrationService when aura components are embedded on the page, onLoad is called by the parent container.
 * @private
 */
$A.ns.Aura.prototype.initPriv = function(config, token, container, doNotInitializeServices, doNotCallJiffyOnLoad) {
    if (!$A["hasErrors"]) {
        $A.mark("ClientService.init");

        clientService.init(config, token, function(cmp) {
            $A.endMark("ClientService.init");
            $A.setRoot(cmp);

            if (!$A.initialized) {
                if (!doNotInitializeServices) {
                    $A.mark("LayoutService.init");
                    $A.layoutService.init(cmp);
                    $A.endMark("LayoutService.init");

                    $A.mark("HistoryService.init");
                    $A.historyService.init();
                    $A.endMark("HistoryService.init");
                }

                $A.initialized = true;
            }

            $A.finishInit(doNotCallJiffyOnLoad);
        }, container ? $A.util.getElement(container) : null);
    }
};

/**
 * Signals that initialization has completed.
 * @param {Boolean} doNotCallJiffyOnLoad True if Jiffy.onLoad() should not be called after initialization. In case of
 *       IntegrationService when aura components are embedded on the page, onLoad is called by the parent container.
 * @private
 */
$A.ns.Aura.prototype.finishInit = function(doNotCallJiffyOnLoad) {
    if (!this["finishedInit"]) {
        $A.mark("Aura.finishInit");
        $A.util.removeClass(document.body, "loading");

        $A.endMark("Aura.finishInit");
        if(window["Jiffy"]){
          //Do not call Jiffy.onLoad()
          if(doNotCallJiffyOnLoad){
              if(window["Jiffy"]["setTimer"]){
              window["Jiffy"]["setTimer"]("Aura Init");
              }
          }else{
            if (window["Jiffy"]["onLoad"]) {
                    window["Jiffy"]["onLoad"]();
                    if (window["Jiffy"]["ui"] && window["Jiffy"]["ui"]["onLoad"]) {
                        window["Jiffy"]["ui"]["onLoad"]();
                    }
            }
          }
        }
        this["finishedInit"] = true;
        $A.clientService.fireLoadEvent("e.aura:initialized");
    }
};

/**
 * Use <code>$A.error()</code> in response to a serious error that has no recovery path.
 *
 * If this occurs during a test, the test will be stopped unless you add calls to '$A.test.expectAuraError' for
 * each error that occurs. <code>exceptionsAllowedDuringInit</code> allows server side errors to not stop the
 * test as well.
 *
 * @description <p>Example:</p>
 * <code>
 * testDuplicate : {<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;exceptionsAllowedDuringInit : ["Duplicate found!"],<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;attributes : {<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dupCmp : true<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;},<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;//more tests<br/>
 * }
 * </code>
 * @public
 * @param {String} msg The error message to be displayed to the user.
 * @param {Error} [e] The error object to be displayed to the user.
 */
$A.ns.Aura.prototype.error = function(msg, e){
    var logMsg = msg || "";
    var dispMsg;

    if (!$A.util.isString(msg)) {
        e = msg;
        logMsg = "";
        msg = "Unknown Error";
    }
    if (!e) {
        e = undefined;
    } else if (!$A.util.isObject(e) && !$A.util.isError(e)) {
        logMsg = "Internal Error: Unrecognized parameter to aura.error";
    }
    if (!logMsg.length) {
        logMsg = "Unknown Error";
    }
    dispMsg = logMsg;
    if (e && !$A.util.isUndefinedOrNull(e.message)) {
        dispMsg = dispMsg+" : "+e.message;
    }
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    var stack = this.getStackTrace(e);
    $A.logInternal("Error", logMsg, e, stack);
    //
    // Error obejcts in older versions of IE are represented as maps with multiple entries containing the error message
    // string. Checking that the object here is not an Error obeject prevents the error message from being displayed
    // multiple times.
    //
    if ($A.util.isObject(e) && !$A.util.isError(e)) {
        for(var k in e) {
            try {
                var val = e[k];

                if ($A.util.isString(val)) {
                    if (dispMsg === "Unknown Error") {
                        dispMsg = val;
                    } else {
                        dispMsg = dispMsg + '\n' + val;
                    }
                    msg = dispMsg;
                }
            } catch (e2) {
                // Ignore serialization errors
            }
        }
    }
    if (stack) {
        dispMsg = dispMsg+"\n"+stack.join("\n");
    }
    //#end
    $A.message(dispMsg);
    if ($A.test) {
        //
        // Note that this sends the only the error message string (no stack) through to the test
        //
        $A.test.auraError(msg);
    }
    if (!$A.initialized) {
        $A["hasErrors"] = true;
    }
};

/**
 * <code>$A.warning()</code> should be used in the case where poor programming practices have been used.
 *
 * These warnings will not, in general, be displayed to the user, but they will appear in the console (if
 * availiable), and in the aura debug window.
 *
 * @public
 * @param {String} w The message to display.
 * @param {Error} e an error, if any.
 */
$A.ns.Aura.prototype.warning = function(w, e) {
    if ($A.test && $A.test.auraWarning(w)) {
        return;
    }
    $A.logInternal("Warning",w, e, this.getStackTrace(e));
};

/**
 * Displays an error message to the user. Currently used for displaying errors that do not cause the application to
 * stop completely.
 *
 * @public
 * @param {String} msg The message to display.
 */
$A.ns.Aura.prototype.message = function(msg) {
    var message = $A.util.getElement("auraErrorMessage");
    message.innerHTML = "";
    message.appendChild(document.createTextNode(msg));

    $A.util.removeClass(document.body, "loading");
    $A.util.addClass(document.body, "auraError");
};

/**
 * Returns the raw value referenced using property syntax. Gets the raw value from within the Value object.
 * Shorthand for <code>getValue().unwrap()</code>.
 * @public
 * @function
 * @param {String} key The data key to look up on element, for example, <code>$A.get("root.v.mapAttring.key")</code>.
 */
$A.ns.Aura.prototype.get = function(key) {
    return this.expressionService.get($A.services, key);
};

/**
 * Gets the component that is passed to a controller method. For example, <code>$A.getRoot().get("v.attrName");</code> returns the attribute from the root component.
 * @public
 * @function
 */
$A.ns.Aura.prototype.getRoot = function() {
    return this.root;
};

/**
 * @private
 */
$A.ns.Aura.prototype.setRoot = function(root) {
    this.root = root;
};

/**
 * Gets the current <code>AuraContext</code>. The context consists of the mode, descriptor, and namespaces to be loaded.
 * <p>See Also: <a href="#help?topic=modesReference">Modes Reference</a></p>
 * @public
 * @function
 */
$A.ns.Aura.prototype.getContext = function() {
    return this.context;
};

/**
 * Returns the unwrapped value.
 *
 * @param {Object} val If the Aura type corresponds to "Value", returns the unwrapped value.
 */
$A.ns.Aura.prototype.unwrap = function(val) {
    if ($A.util.isValue(val)) {
        return val.unwrap();
    }
    return val;
};

/**
 * Runs a function within the standard Aura lifecycle.
 *
 * This insures that <code>enqueueAction</code> methods and rerendering are handled properly.
 *
 * from JavaScript outside of controllers, renderers, providers.
 * @param {Function} func The function to run.
 * @param {String} name an optional name for the stack.
 * @public
 */
$A.ns.Aura.prototype.run = function(func, name) {
    $A.assert(func && $A.util.isFunction(func), "The parameter 'func' for $A.run() must be a function!");
    if (name === undefined) {
        name = "$A.run()";
    }

    $A.services.client.pushStack(name);
    try {
    	//console.log("$A.run()", name);
    	
        return func();
    } catch (e) {
        $A.error("Error while running "+name, e);
    } finally {
        $A.services.client.popStack(name);
    }
    
    return undefined;
};

/**
 * Checks the condition and if the condition is false, displays an error message.
 *
 * Displays an error message if condition is false, runs <code>trace()</code> and stops JS execution. The
 * app will cease to function until reloaded if this is called, and errors are not caught.
 * <p>For example, <code>$A.assert(cmp.get("v.name") , "The name attribute is required.");</code> checks for the name attribute.
 *
 * @param {Boolean} condition True prevents the error message from being displayed, or false otherwise.
 * @param {String} assertMessage A message to be displayed when condition is false.
 * @protected Internal assertion, should never happen
 */
$A.ns.Aura.prototype.assert = function(condition, assertMessage) {
    //#if {"excludeModes" : ["PRODUCTION"]}
    if (!condition) {
        var message = "Assertion Failed!: " + assertMessage + " : " + condition;
        var error = new Error(message);
        $A.trace();
        //
        // Trying to fire an event here is a very dangerous thing to do, as
        // we have no idea of where we are, or what went wrong to cause a call
        // to assert(). In order to avoid problems, we do the most basic thing
        // to alert the user.
        //
        // var event = $A.get("e.aura:systemError");
        // if (event) {
        // event.setParams({message : message, error : error});
        // event.fire();
        // }
        var elt = $A.util.getElement("auraErrorMessage");
        if (elt) {
            elt.innerHTML = message;
            $A.util.removeClass(document.body, "loading");
            $A.util.addClass(document.body, "auraError");
        } else {
            alert(message);
        }
        throw error;
    }
    //#end
};

/**
 * Checks for a specified user condition, only to be used for fatal errors!. Displays an error message if condition is
 * false, and stops JS execution. The app will cease to function until reloaded if this is called.
 *
 * @param {Boolean} condition The conditional expression to be evaluated.
 * @param {String} msg The message to be displayed when the condition is false.
 * @public
 */
$A.ns.Aura.prototype.userAssert = function(condition, msg) {
    // For now use the same method
    $A.assert(condition, msg);
};

/**
 * Internal routine to stringify a log message.
 *
 * @private
 */
$A.ns.Aura.prototype.stringVersion = function(logMsg, error, trace) {
    var stringVersion = logMsg;
    if (!$A.util.isUndefinedOrNull(error) && !$A.util.isUndefinedOrNull(error.message)) {
        stringVersion += " : " + error.message;
        if ($A.util.isObject(error)) {
        }
    }
    if (!$A.util.isUndefinedOrNull(trace)) {
        stringVersion += "\nStack: " + trace.join("\n");
    }
    return stringVersion;
};

/**
 * Log something: for internal use only..
 *
 * This logs to both the console (if available), and to the aura debug component.
 *
 * @private
 * @param {String} type the type of message (error, warning, info).
 * @param {String} message the message to display.
 * @param {Error} an error (if truthy).
 * @param {Array} the stack trace as an array (if truthy).
 */
$A.ns.Aura.prototype.logInternal = function(type, message, error, trace) {
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    var logMsg = type + ": ";
    var stringVersion = null;

    if (!$A.util.isUndefinedOrNull(message)) {
        stringVersion += " : " + message;
    }
    if (!$A.util.isUndefinedOrNull(error) && !$A.util.isUndefinedOrNull(error.message)) {
        stringVersion += " : " + error.message;
    }
    if (window["console"]) {
        var console = window["console"];
        if (console["group"]) {
            console["group"](logMsg);
            if (!$A.util.isUndefinedOrNull(error)) {
                console["debug"](error);
            } else {
                console["debug"](message);
            }
            if (trace) {
                console["group"]("stack");
                for ( var i = 0; i < trace.length; i++) {
                    console["debug"](trace[i]);
                }
                console["groupEnd"]();
            }
            console["groupEnd"]();
        } else {
            stringVersion = this.stringVersion(logMsg, error, trace);
            if (console["debug"]) {
                console["debug"](stringVersion);
            } else if (console["log"]) {
                console["log"](stringVersion);
            }
        }
    }
    
    // sending logging info to debug tool if enabled
    if(!$A.util.isUndefinedOrNull($A.util.getDebugToolComponent())) {
        if ($A.util.isUndefinedOrNull(stringVersion)) {
            if ($A.util.isUndefinedOrNull(trace)) {
                trace = this.getStackTrace(error);
            }
            stringVersion = this.stringVersion(logMsg, error, trace);
        }
    	var debugLogEvent = $A.util.getDebugToolsAuraInstance().get("e.aura:debugLog");
		debugLogEvent.setParams({"type" : type, "message" : stringVersion});
    	debugLogEvent.fire();
    }
    //#end
};

/**
 *  Log something.  Currently, this logs to the JavaScript console if it is available, and does not throw errors otherwise.
 *  If both value and error are passed in, value shows up in the console as a group with value logged within the group.
 *  If only value is passed in, value is logged without grouping.
 *  <p>For example, <code>$A.log(action.getError());</code> logs the error from an action.</p>
 * @public
 * @param {Object} value The first object to log.
 * @param {Object} error The error messages to be logged in the stack trace.
 */
$A.ns.Aura.prototype.log = function(value, error) {
    var trace;
    if (this.util.isError(value)) {
        error = value;
        value = error.message;
    }
    if (this.util.isError(error)) {
        trace = this.getStackTrace(error);
    } else if (error && error.stack) {
        trace = error.stack;
    }
    this.logInternal("Info", value, error, trace);
};

/**
 * Logs using <code>console.log()</code> if defined on the console implementation.
 */
$A.ns.Aura.prototype.logf = function() {
    if (window["console"]) {
        window["console"]["log"].apply(window["console"], arguments);
    }
};

/**
 * Converts the value to a String. If value length is greater than the given size, return a String up to the size.
 * Otherwise, return a String containing the value with trailing whitespaces to fill up the size.
 *
 * @param {Object} value The object to be resolved.
 * @param {Number} size The length of the output string.
 */
$A.ns.Aura.prototype.fitTo = function(value, size) {
    if (typeof (value) != "string") {
        if ($A.util.isUndefinedOrNull(value)) {
            return null;
        }
        value = value.toString();
    }
    if (value.length > size) {
        return value.slice(0, size);
    }
    return this.rpad(value, " ", size);
};

/**
 * Pads the string to its right and returns the new string.
 *
 * @param {String} str The string to be resolved.
 * @param {String} padString The padding to be inserted.
 * @param {Number} length The length of the padding.
 */
$A.ns.Aura.prototype.rpad = function(str, padString, length) {
    while (str.length < length) {
        str = str + padString;
    }
    return str;
};

/**
 * Returns the stack trace, including the functions on the stack if available (Error object varies across browsers).
 * Values are not logged.
 *
 * @private
 */
$A.ns.Aura.prototype.getStackTrace = function(e, remove) {
    var stack = undefined;

    if (!remove) {
        remove = 0;
    }
    if (!e || !e.stack) {
        try {
            throw new Error("foo");
        } catch (f) {
            e = f;
            remove += 2;
        }
    }
    if (e && e.stack) {
        stack = e.stack;
    }
    if (stack) {
        var ret = stack.replace(/(?:\n@:0)?\s+$/m, '');
        ret = ret.replace(new RegExp('^\\(', 'gm'), '{anonymous}(');
        ret = ret.split("\n");
        if (remove !== 0) {
            ret.splice(0,remove);
        }
        return ret;
    }
    return null;
};

/**
 * Logs a stack trace. Trace calls using <code>console.trace()</code> if defined on the console implementation.
 * @public
 */
$A.ns.Aura.prototype.trace = function() {
    if (window["console"] && window["console"]["trace"]) {
        window["console"]["trace"]();
    }
};

/**
 * Map through to Jiffy.mark if Jiffy is loaded, otherwise a no-op.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.mark = window["Perf"] ? window["Perf"]["mark"] : function(){ return this; };

/**
 * Map through to Jiffy.measure if Jiffy is loaded, otherwise a no-op.
 * This will be the same no-op as <code>$A.ns.Aura.prototype.mark</code>, since both
 * are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 * @deprecated Use endMark instead
 */
$A.ns.Aura.prototype.measure = (function() {
    if (window["Perf"]) {
        return window["Perf"]["measure"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to Perf.endMark if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.endMark = (function() {
    if (window["Perf"]) {
        return window["Perf"]["endMark"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * If Perf is loaded the page-ready and transaction timers will be started, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.startTransaction = (function(name) {
    if (window["Perf"]) {
        return function(name) {
            window["Perf"]["startTransaction"](name);
        	return window["Perf"]["mark"]("page-ready");
        };
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to Perf.endTransaction if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.endTransaction = (function() {
    if (window["Perf"]) {
        return window["Perf"]["endTransaction"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to Perf.endMark with an id of 'page-ready' if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.pageReady = (function() {
    if (window["Perf"]) {
        return function() {
        	return window["Perf"]["endMark"]("page-ready");
        };
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to Perf.updateTransaction if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.updateTransaction = (function() {
    if (window["Perf"]) {
        return window["Perf"]["updateTransaction"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to Perf.updateMarkName if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.updateMarkName = (function() {
    if (window["Perf"]) {
        return window["Perf"]["updateMarkName"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to toJson if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.toJson = (function() {
    if (window["Perf"]) {
        return window["Perf"]["toJson"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to Perf.setBeaconData if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.setBeaconData = (function() {
    if (window["Perf"]) {
        return window["Perf"]["setBeaconData"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to Perf.setBeaconData if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.getBeaconData = (function() {
    if (window["Perf"]) {
        return window["Perf"]["getBeaconData"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to Perf.clearBeaconData if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.clearBeaconData = (function() {
    if (window["Perf"]) {
        return window["Perf"]["clearBeaconData"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to Perf.removeStats if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.removeStats = (function() {
    if (window["Perf"]) {
        return window["Perf"]["removeStats"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

/**
 * Map through to Perf.onLoadFired if Perf is loaded, otherwise a no-op. This will be the same no-op as
 * $A.ns.Aura.prototype.mark, since both are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.onLoadFired = (function() {
    if (window["Perf"]) {
        return window["Perf"]["onLoadFired"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

$A.ns.Aura.prototype.logLevel = (window["PerfLogLevel"] || {});

/**
 * Sets mode to production (default), development, or testing.
 *
 * @private
 * @param {String} mode Possible values are production "PROD", development "DEV", or testing "PTEST".
 */
$A.ns.Aura.prototype.setMode = function(mode) {
    this.mode = mode;
    this.enableAssertions = (mode != 'PROD' && mode != 'PTEST');
};

/**
 * Get GVP directly
 * @return {GlobalValueProviders}
 */
$A.ns.Aura.prototype.getGlobalValueProviders = function() {
    return this.getContext().getGlobalValueProviders();
};

// #include aura.Aura_export

// At this point, $A.ns has been defined with all our types on it, but $A itself
// is just a placeholder. Use this function to preserve $A.ns while populating
// $A, without making a new top-level name:
(function bootstrap() {
    var ns = $A.ns;
    window['$A'] = new ns.Aura();
    window['$A']['ns'] = ns;
    window['$A'].ns = ns;
})();

// shortcuts for using throughout the framework code.
// TODO(fabbott): All of these need to move into $A only.
clientService = $A.clientService;
var componentService = $A.componentService;
var serializationService = $A.serializationService;
var renderingService = $A.renderingService;
var expressionService = $A.expressionService;
var historyService = $A.historyService;
var eventService = $A.eventService;
var layoutService = $A.layoutService;

var services = $A.services;

// TODO(fabbott): Remove the legacy 'aura' top-level name.
window['aura'] = window['$A'];

// #include aura.storage.adapters.MemoryAdapter
// #include aura.storage.adapters.IndexedDBAdapter
// #include aura.storage.adapters.SmartStoreAdapter
// #include aura.storage.adapters.WebSQLAdapter
