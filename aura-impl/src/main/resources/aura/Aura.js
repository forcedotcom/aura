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
/*jslint sub: true, debug: true */

/**
 * Export symbols.  TODO(fabbott): Destroy this when we're consistently using
 * Closure's exportSymbols directive instead.
 */
function exp() {
    var obj = arguments[0];

    for(var i=1;i<arguments.length;i++) {
        var name = arguments[i];
        i++;
        var val = arguments[i];
        obj[name] = val;
    }
}

/**
 * @namespace This, $A, is supposed to be our ONLY window-polluting top-level
 * variable.  Everything else is attached to it.  Note that this more-or-less
 * empty-object $A is replaced later, after $A.ns (created below) is populated
 * with the types that can be used to populate the "real" $A.
 *
 * TODO(fabbott): Make that "only gobal name" goal become true; today it ain't.
 */
window['$A'] = {};

/**
 * @namespace The separate Aura "namespace" object contains Aura types, as
 * opposed to instances and properties and such which might hang off $A.
 *
 * This allows some colliding or near-miss variable duplication (e.g. $A.util
 * is an instance of $A.ns.Util), and collects our proper types into one place.
 * The types themselves must be proper functional objects with prototypes, or
 * Closure can't deal with obfuscating them (and particularly their exports)
 * properly.
 */
$A.ns = {};
$A['ns'] = $A.ns;   // TODO: use exportSymbols when available

var clientService;

//#include aura.util.Function
//#include aura.util.Util
//#include {"modes" : ["TESTING","AUTOTESTING", "TESTINGDEBUG", "AUTOTESTINGDEBUG", "DOC"], "path" : "aura.test.Test"}
//#include aura.system.DefDescriptor
//#include aura.util.Json
//#include aura.util.Transport
//#include aura.util.Style
//#include aura.util.Bitset
//#include aura.context.AuraContext
//#include aura.value.BaseValue
//#include aura.value.MapValue
//#include aura.value.ArrayValue
//#include aura.value.SimpleValue
//#include aura.value.PropertyReferenceValue
//#include aura.value.FunctionCallValue
//#include aura.value.ActionReferenceValue
//#include aura.value.PassthroughValue
//#include aura.model.ModelDef
//#include aura.component.ComponentDefRegistry
//#include aura.component.Component
//#include aura.renderer.RendererDef
//#include aura.provider.ProviderDef
//#include aura.helper.HelperDefRegistry
//#include aura.event.EventDefRegistry
//#include aura.event.EventDef
//#include aura.event.Event
//#include aura.helper.HelperDef
//#include aura.layouts.LayoutItemDef
//#include aura.layouts.LayoutDef
//#include aura.controller.ActionDef
//#include aura.controller.Action
//#include aura.attribute.AttributeDef
//#include aura.attribute.AttributeSet
//#include aura.attribute.AttributeDefSet
//#include aura.renderer.RendererDefRegistry
//#include aura.theme.ThemeDef
//#include aura.component.ComponentDef
//#include aura.controller.ControllerDef
//#include aura.controller.ControllerDefRegistry
//#include aura.controller.ActionDefRegistry
//#include aura.model.ModelDefRegistry
//#include aura.provider.ProviderDefRegistry
//#include aura.layouts.LayoutsDef
//#include aura.model.ValueDef
//#include aura.l10n.AuraLocalizationContext
//#include aura.AuraClientService
//#include aura.AuraComponentService
//#include aura.AuraSerializationService
//#include aura.AuraRenderingService
//#include aura.AuraExpressionService
//#include aura.AuraHistoryService
//#include aura.AuraEventService
//#include aura.AuraLayoutService
//#include aura.AuraLocalizationService
//#include {"excludeModes" : ["PRODUCTION"], "path" : "aura.AuraDevToolService"}
//#include aura.value.ValueFactory
//#include aura.value.ExpressionFunctions
//#include aura.model.Model
//#include aura.storage.AuraStorageService
//#include aura.storage.Storage

/**
 * @class The Aura framework.  Default global instance name is $A.
 * @constructor
 */
$A.ns.Aura = function() {
    this.util = new Util();
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
         * @public
         * @type AuraRenderingService
         * @memberOf Aura.prototype
         **/
        rendering : aura.renderingService,
        /**
         * Event Service
         * @public
         * @type AuraEventService
         * @memberOf Aura.prototype
         **/
        event : aura.eventService,
        /**
         * Component Service
         * @public
         * @type AuraComponentService
         * @memberOf Aura.prototype
         **/
        component : aura.componentService,
        /**
         * Client Service
         * @public
         * @type AuraClientService
         * @memberOf Aura.prototype
         **/
        client : aura.clientService,

        /**
         * History Service
         * @public
         * @type AuraHistoryService
         * @memberOf Aura.prototype
         */
        history : aura.historyService,

        /**
         * Localization Service
         * @public
         * @type AuraLocalizationService
         * @memberOf Aura.prototype
         */
        localization : aura.localizationService,

        /**
         * Storage Service
         * @public
         * @type AuraStorageService
         * @memberOf Aura.prototype
         */
        storage : aura.storageService,

        /**
         * Alias of Component Service
         * @public
         * @type AuraComponentService
         * @memberOf Aura.prototype
         * @see Aura#services.component
         **/
        cmp : aura.componentService,
        /**
         * Alias of Event Service
         * @public
         * @type AuraEventService
         * @memberOf Aura.prototype
         * @see Aura#services.event
         **/
        e : aura.eventService,

        /**
         * Alias of Localization Service
         * @public
         * @type AuraLocalizationService
         * @memberOf Aura.prototype
         * @see Aura#service.localization
         */
        l10n : aura.localizationService,

        getValue : function(key) {
            var ret = $A.services[key];
            if(!ret && key === "root") {
                return $A.getRoot();
            }
            return ret;
        }
    };

    /**
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraRenderingService.render
     */
    this.render = this.renderingService.render;

    /**
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraRenderingService.rerender
     */
    this.rerender = this.renderingService.rerender;

    /**
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraRenderingService.unrender
     */
    this.unrender = this.renderingService.unrender;

    /**
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraRenderingService.afterRender
     */
    this.afterRender = this.renderingService.afterRender;

    /**
     * @public
     * @function
     * @param {Component|Array} cmp
     * @borrows AuraComponentService.get
     */
    this.getCmp = this.componentService.get;

    this.newCmp = this.componentService.newComponent;

    /**
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
            "render", aura.render,
            "rerender", aura.rerender,
            "unrender", aura.unrender,
            "afterRender", aura.afterRender,
            "getCmp", aura.getCmp,
            //#if {"excludeModes" : ["PRODUCTION"]}
                "devToolService", aura.devToolService,
                "getQueryStatement", aura.devToolService.newStatement,
                "qhelp", function() {return aura.devToolService.help()},
            //#end
            "newCmp", aura.newCmp,
            "getEvt", aura.getEvt      );
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
            "c" , {
                getValue : function(name) {
                    return services.cmp.getControllerDef({descriptor : name});
                }
            }
        );

    this.eventService.addHandler({event : 'aura:systemError',
            "globalId" : "Aura",
            "handler" : function(evt) {
                aura.log(evt.getParam('message'), evt.getParam('error'));
        }});
};

/**
 * Initializes Aura with context info about the app that should be loaded.
 * @param {Object} config
 *
 * {
 *      config.descriptor : The descriptor of the application or component that should be loaded as the root. e.g : "markup://foo:bar"
 *      config.attributes : The attributes that should be passed into the root component when it is constructed. e.g. : {at1 : 1, at2 : "asdf"}
 *      config.defType : The defType of the descriptor.  eg : "DEFINITION" OR "APPLICATION"
 *      config.lastmod : The timestamp, in millis of the latest changes to the preloaded metadata associated with this application.
 * }
 * @public
 */
$A.ns.Aura.prototype.initAsync = function (config) {
    $A.mark("Aura.initAsync");
    $A.context = new AuraContext(config["context"]);
    clientService.initHost(config["host"]);
    clientService.loadComponent(config["descriptor"], config["attributes"], function(resp) {
        $A.initPriv(resp);
        $A.measure("Component Load Complete", "Aura.initAsync");
    }, config["deftype"]);

    $A.measure("Component Load Initiated", "Aura.initAsync");
};

/**
 * Initializes Aura with context info but without retrieving component from server.
 * Used for synchronous initialization.
 * @param {Object} config The configuration attributes
 * @param {Boolean} useExisting
 * @param {Boolean} doNotInitializeServices True if Layout and History services should not be initialized, or false if they should. Defaults to true for Aura Integration Service.
 */
$A.ns.Aura.prototype.initConfig = function (config, useExisting, doNotInitializeServices) {
    config = $A.util.json.resolveRefs(config);
    
    if (!useExisting || $A.util.isUndefined($A.getContext())) {
        clientService.initHost(config["host"]);

        $A.context = new AuraContext(config["context"]);
        this.init(config["instance"], config["token"], config["context"], null, doNotInitializeServices);
    } else {
        // Use the existing context and just join the new context into it
        $A.getContext().join(config["context"]);
    }
};

/**
 * Initializes Aura in a specified mode.
 * @param {Object} config The descriptor ("markup://foo:bar"), attributes, defType ("APPLICATION" or "COMPONENT"), and timestamp of last modified change
 * @param {String} token
 * @param {Object} context The mode of the application or component ("DEV", "PROD", "PTEST")
 * @param {Object} container Sets the container for the component.
 * @param {Boolean} doNotInitializeServices True if Layout and History services should not be initialized, or false if they should. Defaults to true for Aura Integration Service.
 */
$A.ns.Aura.prototype.init = function (config, token, context, container, doNotInitializeServices) {
    var component = $A.util.json.resolveRefs(config);
    $A.initPriv(component, token, container, doNotInitializeServices);
};

/**
 * Initializes Aura in debug environment.
 * @param {Object} config The descriptor ("markup://foo:bar"), attributes, defType ("APPLICATION" or "COMPONENT"), and timestamp of last modified change
 * @param {String} token
 * @param {Object} container Sets the container for the component.
 * @param {Boolean} doNotInitializeServices True if Layout and History services should not be initialized, or false if they should. Defaults to true for Aura Integration Service.
 * @private
 */
$A.ns.Aura.prototype.initPriv = function (config, token, container, doNotInitializeServices) {
    if (!$A["hasErrors"]) {
        $A.mark("Aura.initPriv");

        clientService.init(config, token, function(cmp) {
            $A.measure("ClientService.init","Aura.initPriv", $A.logLevel["DEBUG"]);
            $A.setRoot(cmp);

            if (!$A.initialized) {
                if (!doNotInitializeServices) {
                    $A.layoutService.init(cmp);
                    $A.measure("LayoutService.init","Aura.initPriv", $A.logLevel["DEBUG"]);

                    $A.historyService.init();
                    $A.measure("HistoryService.init","Aura.initPriv", $A.logLevel["DEBUG"]);
                }

                $A.initialized = true;
            }

            $A.finishInit();
        }, container ? $A.util.getElement(container) : null);
    }
};

/**
 * Signals that initialization has completed.
 */
$A.ns.Aura.prototype.finishInit = function() {
    if (!this["finishedInit"]) {
        $A.mark("Aura.finishInit");
        $A.util.removeClass(document.body, "loading");

        $A.measure("set body class","Aura.finishInit");
        if (window["Jiffy"] && window["Jiffy"]["onLoad"]) {
            window["Jiffy"]["onLoad"]();
            if (window["Jiffy"]["ui"] && window["Jiffy"]["ui"]["onLoad"]) {
                window["Jiffy"]["ui"]["onLoad"]();
            }
        }
        this["finishedInit"] = true;
        $A.clientService.fireLoadEvent("e.aura:initialized");
    }
};

/**
 * This should be called in response to an error that prevents Aura from starting an application successfully.
 * @public
 * @param {Error} e
 */
$A.ns.Aura.prototype.error = function(e) {
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    $A.log(e.stack || e);
    //#end
    var str = "";
    if ($A.util.isString(e)) {
        str = e;
    // we treat error objects differently from object object, isObject means is it a map
    } else if ($A.util.isObject(e) || $A.util.isError(e)) {
        for(var k in e) {
            try {
                var val = e[k];

                if ($A.util.isString(val)) {
                    str = str + '\n' + val;
                }
            }catch(e2) {
                //Ignore serialization errors
            }
        }
        if(!str) {
            str = e.message + e.stack;
        }
    } else {
        $A.log("Unrecognized parameter to aura.error", e);
        return;
    }

    var message = $A.util.getElement("auraErrorMessage");
    message.innerHTML = "";
    message.appendChild(document.createTextNode(str));
    
    $A.util.removeClass(document.body, "loading");
    $A.util.addClass(document.body, "auraError");
   
    if ($A.test) {
        $A.test.fail(str);
    }
    if (!$A.initialized) {
        $A["hasErrors"] = true;
    }
};

/**
 * Displays a message to the user.  Currently used for displaying errors that do not cause the application to stop completely.
 * @public
 * @param {String} msg The alert message to display.
 */
$A.ns.Aura.prototype.message = function(msg) {
    alert(msg);
};

/**
 * Returns the raw value referenced using property syntax. Gets the raw value from within the Value object.
 * Shorthand for getValue().unwrap().
 * @public
 * @function
 * @param {String} key The data key to look up on element. E.g. $A.get("root.v.mapAttring.key")
 */
$A.ns.Aura.prototype.get = function(key) {
    return this.expressionService.get($A.services, key);
};

/**
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
 * Gets the current AuraContext. The context consists of the mode, descriptor, and namespaces to be loaded.
 * @public
 * @function
 */
$A.ns.Aura.prototype.getContext = function() {
    return this.context;
};

/**
 * Returns the unwrapped value.
 * @param {Object} val If the Aura type corresponds to "Value", returns the unwrapped value.
 */
$A.ns.Aura.prototype.unwrap = function(val) {
    if(val && val.auraType) {
        if(val.auraType === "Value") {
            return val.unwrap();
        }
    }
    return val;
};


/**
 * Checks the condition and if the condition is false, displays an error message.
 *
 * Displays an error message if condition is false, runs 'trace()' and stops JS execution. The
 * app will cease to function until reloaded if this is called, and errors are not caught.
 *
 * @param {Boolean} condition True prevents the error message from being displayed, or false otherwise.
 * @param {String} assertMessage A message to be displayed when condition is false.
 * @protected
 * Internal assertion, should never happen
 */
$A.ns.Aura.prototype.assert = function(condition, assertMessage) {
    //#if {"excludeModes" : ["PRODUCTION"]}
    if (!condition) {
        var message = "Assertion Failed!: "+assertMessage+" : "+condition;
        var error = new Error(message);
        $A.trace();
        //
        // Trying to fire an event here is a very dangerous thing to do, as
        // we have no idea of where we are, or what went wrong to cause a call
        // to assert(). In order to avoid problems, we do the most basic thing
        // to alert the user.
        //
        //var event = $A.get("e.aura:systemError");
        //if (event) {
        //    event.setParams({message : message, error : error});
        //    event.fire();
        //}
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
 * Checks for a specified user condition, only to be used for fatal errors!.
 *
 * Displays an error message if condition is false, and stops JS execution. The
 * app will cease to function until reloaded if this is called.
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
 *  Log something.  Currently, this logs to the JavaScript console if it is available, and does not throw errors otherwise.
 *  If both are passed in, value shows up in the console as a group with value logged within the group.
 *  If only value is passed in, value is logged without grouping.
 * @public
 * @param {Object} value The first object to log.
 * @param {Object} error The error messages to be logged in the stack trace.
 */
$A.ns.Aura.prototype.log = function(value, error) {
    if (window["console"]) {
        if(this.util.isError(value) && value.stack) {
            value = value.stack;
        }
        var console = window["console"];
        if (error !== undefined && console["group"]) {
            console["group"](value);
            console["debug"](error);
            var trace = this.getStackTrace(error);
            if(trace) {
                console["group"]("stack");
                for(var i=0;i<trace.length;i++) {
                    console["debug"](trace[i]);
                }
                console["groupEnd"]();
            }
            console["groupEnd"]();
        }
        else if(console && console["debug"]) {
            console["debug"](value);
        }else if(console && console["log"]) {
            console["log"](value);
        }
    }
};

/**
 * Logs using console.log() if defined on the console implementation.
 */
$A.ns.Aura.prototype.logf = function() {
    if (window["console"]) {
        window["console"]["log"].apply(window["console"], arguments);
    }
};

/**
 * Converts the value to a String. If value length is greater than the given size, return a String up to the size.
 * Otherwise, return a String containing the value with trailing whitespaces to fill up the size.
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
 * Returns the stack trace, including the functions on the stack.
 * Values are not logged.
 * @private
 */
$A.ns.Aura.prototype.getStackTrace = function(e) {
    if (e.stack) {
        var ret = e.stack.replace(/(?:\n@:0)?\s+$/m, '');
        ret = ret.replace(new RegExp('^\\(','gm'), '{anonymous}(');
        ret = ret.split("\n");

        return ret;
    }
    return null;
};

/**
 * Logs a stack trace. Trace calls using console.trace() if defined on the console implementation.
 * @public
 */
$A.ns.Aura.prototype.trace = function() {
    if(window["console"] && window["console"]["trace"]) {
        window["console"]["trace"]();
    }
};

/**
 * Map through to Jiffy.mark if Jiffy is loaded, otherwise a no-op.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.mark = (function() {
    if (window["Jiffy"]) {
        return window["Jiffy"]["mark"];
    } else {
        return function() {};
    }
})();

/**
 * Map through to Jiffy.measure if Jiffy is loaded, otherwise a no-op.
 * This will be the same no-op as $A.ns.Aura.prototype.mark, since both
 * are no-ops when Jiffy is missing; we only need one noop object.
 *
 * @public
 * @function
 */
$A.ns.Aura.prototype.measure = (function() {
    if (window["Jiffy"]) {
        return window["Jiffy"]["measure"];
    } else {
        return $A.ns.Aura.prototype.mark;
    }
})();

$A.ns.Aura.prototype.logLevel = (window["PerfLogLevel"] || {});

/**
 * Sets mode to production (default), development, or testing.
 * @private
 * @param {String} mode Possible values are production "PROD", development "DEV", or testing "PTEST".
 */
$A.ns.Aura.prototype.setMode = function(mode) {
    this.mode = mode;
    this.enableAssertions = (mode != 'PROD' && mode != 'PTEST');
};

//#include aura.Aura_export

// At this point, $A.ns has been defined with all our types on it, but $A itself
// is just a placeholder.  Use this function to preserve $A.ns while populating
// $A, without making a new top-level name:
(function bootstrap() {
    var ns = $A.ns;
    window['$A'] = new ns.Aura();
    window['$A']['ns'] = ns;
})();

//shortcuts for using throughout the framework code.
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

//#include aura.storage.adapters.MemoryAdapter
//#include aura.storage.adapters.IndexedDBAdapter
//#include aura.storage.adapters.SmartStoreAdapter
//#include aura.storage.adapters.WebSQLAdapter

