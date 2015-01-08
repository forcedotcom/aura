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
 * @description This, $A, is supposed to be our ONLY window-polluting top-level variable. Everything else in Aura is
 *            attached to it. Note that this almost empty object $A is replaced later, after $A.ns (created below) is
 *            populated with the types that can be used to populate the "real" $A. TODO(fabbott): Make that "only gobal
 *            name" goal become true; today it ain't.
 */
window['$A'] = {};

/**
 * @description The separate Aura "namespace" object contains Aura types, as opposed to instances and properties and such
 *            which might hang off $A. This allows some colliding or near-miss variable duplication (e.g. $A.util is an
 *            instance of $A.ns.Util), and collects our proper types into one place. The types themselves must be proper
 *            functional objects with prototypes, or Closure can't deal with obfuscating them (and particularly their
 *            exports) properly.
 */
$A.ns = {};
$A['ns'] = $A.ns; // TODO: use exportSymbols when available

var clientService;

// #include aura.polyfill.Promise
// #include aura.polyfill.Function
// #include aura.util.Util
// #include aura.Logger
// #include {"modes" : ["TESTING","AUTOTESTING", "TESTINGDEBUG", "AUTOTESTINGDEBUG", "DOC"], "path" : "aura.test.Test"}
// #include aura.system.DefDescriptor
// #include aura.polyfill.Json
// #include aura.util.Transport
// #include aura.util.Style
// #include aura.util.Bitset
// #include aura.util.NumberFormat
// #include aura.context.AuraContext
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
// #include aura.library.LibraryDefRegistry
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
// #include aura.AuraComponentContext
// #include aura.AuraComponentService
// #include aura.AuraSerializationService
// #include aura.AuraRenderingService
// #include aura.AuraExpressionService
// #include aura.AuraHistoryService
// #include aura.AuraEventService
// #include aura.AuraLayoutService
// #include aura.AuraLocalizationService
// #include {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"], "path" : "aura.AuraDevToolService"}
// #include aura.value.ValueFactory
// #include aura.value.ExpressionFunctions
// #include aura.model.Model
// #include aura.storage.AuraStorageService
// #include aura.storage.Storage
// #include aura.provider.GlobalValueProviders
// #include aura.provider.LabelQueue
// #include aura.provider.LabelValueProvider
// #include aura.provider.ObjectValueProvider

/**
 * @class Aura
 * @classdesc The Aura framework. Default global instance name is $A.
 * @constructor
 */
$A.ns.Aura = function() {
    this.util = new $A.ns.Util();
    this["util"] = this.util;
    //#if {"modes" : ["TESTING","AUTOTESTING", "TESTINGDEBUG", "AUTOTESTINGDEBUG"]}
    this.test = new $A.ns.Test();
    this["test"] = this.test;
    //#end

    this.clientService = new AuraClientService();
    this.componentService = new $A.ns.AuraComponentService();
    this.serializationService = new AuraSerializationService();
    this.renderingService = new AuraRenderingService();
    this.expressionService = new AuraExpressionService();
    this.historyService = new $A.ns.AuraHistoryService();
    this.eventService = new AuraEventService();
    this.layoutService = new AuraLayoutService();
    this.localizationService = new AuraLocalizationService();
    this.storageService = new AuraStorageService();
    this.logger = new $A.ns.Logger();

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
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
         * @memberOf Aura
         */
        rendering : aura.renderingService,
        /**
         * Event Service
         *
         * @public
         * @type AuraEventService
         * @memberOf Aura
         */
        event : aura.eventService,
        /**
         * Component Service
         *
         * @public
         * @type AuraComponentService
         * @memberOf Aura
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

        get : function(key) {
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
     * Equivalent to <code>$A.clientService.deferAction()</code>.
     * <p>See Also: <a href="#reference?topic=api:AuraClientService">AuraClientService</a></p>
     * @public
     * @function
     * @param {Action} action
     * @borrows AuraClientService.deferAction
     */
    this.deferAction = this.clientService.deferAction;

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
    this.getCmp = function(globalId) {
        return this.componentService.get(globalId);
    };

    /**
     * Client-side component creation. This method is replaced by newCmpAsync().
     * @param {Object} config
     * @param {Object} attributeValueProvider
     * @param {Boolean} localCreation
     */
    this.newCmp = function(config, attributeValueProvider, localCreation, doForce) {
        return this.componentService.newComponentDeprecated(config, attributeValueProvider, localCreation, doForce);
    };
    /**
     * Previously known as newComponent(). This method is replaced by newCmpAsync().
     * @param {Object} config
     * @param {Object} attributeValueProvider
     * @param {Boolean} localCreation
     * @param {Boolean} doForce
     */
    this.newCmpDeprecated = function(config, attributeValueProvider, localCreation, doForce) {
        return this.componentService.newComponentDeprecated(config, attributeValueProvider, localCreation, doForce);
    };

    /**
     * Creates components from a client-side controller or helper. Equivalent to <code>$A.newCmpAsync()</code>.
     * If no server-side dependencies are found, this method runs synchronously.
     * @param {Object} callbackScope The callback scope
     * @param {Function} callback The callback function, required for returning the newly created component
     * @param {Object} config Provides the component descriptor and attributes. Example:
     * <p><code>"componentDef": "markup://ui:button", "attributes": { "values": {label: "Submit"}}</code></p>
     * @param {Object} attributeValueProvider The value provider for the attribute.
     * @param {Boolean} localCreation For internal use only. localCreation determines if the global id is used and defaults to false.
     * @param {Boolean} doForce For internal use only. doForce enforces client-side creation and defaults to false.
     * @param {Boolean} forceServer For internal use only. forceServer enforces server-side creation and defaults to false.
     */

    this.newCmpAsync = function(callbackScope, callback, config, attributeValueProvider, localCreation, doForce, forceServer){
        return this.componentService.newComponentAsync(callbackScope, callback, config, attributeValueProvider, localCreation, doForce, forceServer);
    };



    /**
     * Pushes current portion of attribute's creationPath onto stack
     * @param {String} creationPath
     *
     * @public
     */
    this.pushCreationPath = function(creationPath) {
    	var ctx = this.getContext();
    	if (!ctx) {
            return;
    	}
    	var act = ctx.getCurrentAction();
    	if (!act) {
            return;
    	}
    	act.pushCreationPath(creationPath);
    };

    /**
     * pops current portion of attribute's creationPath from stack
     * @param {String} creationPath
     *
     * @public
     */
    this.popCreationPath = function(creationPath) {
    	var ctx = this.getContext();
    	if (!ctx) {
            return;
    	}
    	var act = ctx.getCurrentAction();
    	if (!act) {
            return;
    	}
    	act.popCreationPath(creationPath);
    };

    /**
     * sets pathIndex for the current attribute on creationPath's stack
     * @param {String} creationPath
     *
     * @public
     */
    this.setCreationPathIndex = function(idx) {
    	var ctx = this.getContext();
    	if (!ctx) {
            return;
    	}
    	var act = ctx.getCurrentAction();
    	if (!act) {
            return;
    	}
    	act.setCreationPathIndex(idx);
    };


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
        "deferAction", aura.deferAction,
        "render", aura.render,
        "rerender", aura.rerender,
        "unrender", aura.unrender,
        "afterRender", aura.afterRender,
        "logger", aura.logger,
        "getCmp", aura.getCmp,
        "pushCreationPath", aura.pushCreationPath,
        "popCreationPath", aura.popCreationPath,
        "setCreationPathIndex", aura.setCreationPathIndex,
        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
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
        "c", {
                get: function(name) {
                    var path = (name||'').split('.');
                    return services.cmp.getControllerDef({descriptor : path.shift()}).get(path.shift());
                }
            }
    );


    this.eventService.addHandler({
        event : 'aura:clientRedirect',
        "globalId" : "Aura",
        "handler" : function(evt) {
        	var url = evt.getParam('url');
        	if (url != null) {
        		window.location = url;
        	}
        }
    });

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
    $A.Perf.mark("Component Load Complete");
    $A.Perf.mark("Component Load Initiated");
    //
    // we don't handle components that come back here. This is used in the case where there
    // are none.
    //
    $A.context = new AuraContext(config["context"], function() {
        clientService.initHost(config["host"]);
        clientService.loadComponent(config["descriptor"], config["attributes"], function(resp) {
            $A.initPriv(resp);
            $A.Perf.endMark("Component Load Complete");
        }, config["deftype"]);

        $A.Perf.endMark("Component Load Initiated");
    });
};

/**
 * Initializes Aura with context info but without retrieving component from server. Used for synchronous initialization.
 *
 * @param {Object} config The configuration attributes
 * @param {Boolean} useExisting
 * @param {Boolean} doNotInitializeServices Set to true if Layout and History services should not be initialized, or false if
 * 	 they should. Defaults to true for Aura Integration Service.
 * @param {Boolean} doNotCallUIPerfOnLoad True if UIPerf.onLoad() should not be called after initialization. In case of
 *       IntegrationService when aura components are embedded on the page, onLoad is called by the parent container.
 */
$A.ns.Aura.prototype.initConfig = function(config, useExisting, doNotInitializeServices, doNotCallUIPerfOnLoad) {
    config = $A.util.json.resolveRefs(config);

    if (!useExisting || $A.util.isUndefined($A.getContext())) {
        clientService.initHost(config["host"]);
        // creating context.
        $A.context = new AuraContext(config["context"]);
        this.initPriv($A.util.json.resolveRefs(config["instance"]), config["token"], null, doNotInitializeServices, doNotCallUIPerfOnLoad);
        $A.context.finishComponentConfigs($A.context.getCurrentAction().getId());
        $A.context.setCurrentAction(null);
    } else {
        // Use the existing context and just join the new context into it
        // FIXME: is this used? it won't do the right thing if there are components.
        $A.getContext().merge(config["context"]);
    }
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
 * @param {Boolean} doNotCallUIPerfOnLoad True if UIPerf.onLoad() should not be called after initialization. In case of
 *       IntegrationService when aura components are embedded on the page, onLoad is called by the parent container.
 * @private
 */
$A.ns.Aura.prototype.initPriv = function(config, token, container, doNotInitializeServices, doNotCallUIPerfOnLoad) {
    if (!$A["hasErrors"]) {
        $A.Perf.mark("ClientService.init");

        clientService.init(config, token, function(cmp) {
            $A.Perf.endMark("ClientService.init");
            $A.setRoot(cmp);

            if (!$A.initialized) {
                if (!doNotInitializeServices) {
                    $A.Perf.mark("LayoutService.init");
                    $A.layoutService.init(cmp);
                    $A.Perf.endMark("LayoutService.init");

                    $A.Perf.mark("HistoryService.init");
                    $A.historyService.init();
                    $A.Perf.endMark("HistoryService.init");
                }

                $A.initialized = true;
            }

            $A.finishInit(doNotCallUIPerfOnLoad);
        }, container ? $A.util.getElement(container) : null);
    }
};

/**
 * Signals that initialization has completed.
 * @param {Boolean} doNotCallUIPerfOnLoad True if UIPerf.onLoad() should not be called after initialization. In case of
 *       IntegrationService when aura components are embedded on the page, onLoad is called by the parent container.
 * @private
 */
$A.ns.Aura.prototype.finishInit = function(doNotCallUIPerfOnLoad) {
    if (!this["finishedInit"]) {
        $A.Perf.mark("Aura.finishInit");
        $A.util.removeClass(document.body, "loading");

        $A.Perf.endMark("Aura.finishInit");
        if (doNotCallUIPerfOnLoad) {
            $A.Perf.setTimer("Aura Init");
        } else {
            $A.Perf.onLoad();
            if (window["Perf"] && window["Perf"]["ui"] && window["Perf"]["ui"]["onLoad"]) {
                window["Perf"]["ui"]["onLoad"]();
            }
        }

        this["finishedInit"] = true;
        $A.clientService.fireLoadEvent("e.aura:initialized");
    }
};

/**
 * @description Use <code>$A.error()</code> in response to a serious error that has no recovery path.
 *
 * If this occurs during a test, the test will be stopped unless you add calls to '$A.test.expectAuraError' for
 * each error that occurs. <code>auraErrorsExpectedDuringInit</code> allows server side errors to not stop the
 * test as well.
 *
 *@example
 * <pre>
 * testDuplicate : {
   auraErrorsExpectedDuringInit : ["Duplicate found!"],
     attributes : {
 *     dupCmp : true
 *   },
 *    //more tests
 * }
 * </pre>
 *
 * <p>This code tries to separate a "display message" (with limited information for users in production
 * modes) from a "log message" (always complete).</p>
 *
 * @public
 * @param {String} msg The error message to be displayed to the user.
 * @param {Error} [e] The error object to be displayed to the user.
 */
$A.ns.Aura.prototype.error = function(msg, e){
    this.logger.error(msg, e);
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
    this.logger.warning(w, e);
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
 * Returns the value referenced using property syntax. Gets the value from the specified global value provider.
 * @public
 * @function
 * @param {String} key The data key to look up on element, for example, <code>$A.get("$Label.section.key")</code>.
 * @param {Function} callback The method to call with the result if a server trip is expected.
 */
$A.ns.Aura.prototype.get = function(key, callback) {
    if($A.util.isString(key)) {
        key = $A.expressionService.normalize(key);
        var path = key.split('.');
        var root = path.shift();
        var valueProvider = $A.services[root];
        if (!valueProvider) {
            valueProvider = $A.getGlobalValueProvider(root);
        }
        if (valueProvider) {
            if (path.length) {
                return valueProvider.get(path.join('.'), callback);
            }
            return valueProvider.getValues?valueProvider.getValues():valueProvider;
        }
    }
    return undefined;
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
 *
 * @public
 * @function
 * @return {AuraContext} current context
 */
$A.ns.Aura.prototype.getContext = function() {
    return this.context;
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

/**@description
 * Checks the condition and if the condition is false, displays an error message.
 *
 * Displays an error message if condition is false, runs <code>trace()</code> and stops JS execution. The
 * app will cease to function until reloaded if this is called, and errors are not caught.
 * Internal assertion, should never happen
 * <p>For example, <code>$A.assert(cmp.get("v.name") , "The name attribute is required.");</code> checks for the name attribute.
 *
 * This is protected as it is an internal assertion, should never happen.
 *
 * @param {Boolean} condition True prevents the error message from being displayed, or false otherwise.
 * @param {String} assertMessage A message to be displayed when condition is false
 */
$A.ns.Aura.prototype.assert = function(condition, assertMessage) {
    this.logger.assert(condition, assertMessage);
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
 *  Logs to the browser's JavaScript console if it is available.
 *  This method doesn't log in PROD or PRODDEBUG modes.
 *  If both value and error are passed in, value shows up in the console as a group with value logged within the group.
 *  If only value is passed in, value is logged without grouping.
 *  <p>For example, <code>$A.log(action.getError());</code> logs the error from an action.</p>
 * @public
 * @param {Object} value The first object to log.
 * @param {Object} error The error messages to be logged in the stack trace.
 */
$A.ns.Aura.prototype.log = function(value, error) {
    this.logger.info(value, error);
};

/**
 *  Logs to the browser's JavaScript console if it is available.
 *  This method doesn't log in PROD or PRODDEBUG modes.
 */
$A.ns.Aura.prototype.logf = function() {
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    if (window["console"]) {
        window["console"]["log"].apply(window["console"], arguments);
    }
    //#end
};

/**
 * Converts the value to a String. If value length is greater than the given size, return a String up to the size.
 * Otherwise, return a String containing the value with trailing whitespaces to fill up the size.
 *
 * @param {Object} value The object to be resolved.
 * @param {Number} size The length of the output string.
 */
$A.ns.Aura.prototype.fitTo = function(value, size) {
    if (typeof value != "string") {
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
 * Logs a stack trace. Trace calls using <code>console.trace()</code> if defined on the console implementation.
 * @public
 */
$A.ns.Aura.prototype.trace = function() {
    if (window["console"] && window["console"]["trace"]) {
        window["console"]["trace"]();
    }
};

/**
 * Sets mode to production (default), development, or testing.
 *
 * @param {String} mode Possible values are production "PROD", development "DEV", or testing "PTEST".
 * @private
 */
$A.ns.Aura.prototype.setMode = function(mode) {
    this.mode = mode;
    this.enableAssertions = (mode != 'PROD' && mode != 'PTEST');
};

/**
 * Get GVP directly.
 * @param {String} type The type of global value provider to retrieve.
 * @return {GlobalValueProvider} The global value provider, such as $Label, $Browser, $Locale, etc.
 *
 * @private
 */
$A.ns.Aura.prototype.getGlobalValueProvider = function(type) {
    return this.getContext().getGlobalValueProvider(type);
};


/**
 * The levels for logging performance m
 *
 * @enum {{name: !string, value: !number}}
 * @expose
 */
var PerfLogLevel = {
    /** @expose */
    DEBUG : {
        name : "DEBUG",
        value : 1
    },
    /** @expose */
    INTERNAL : {
        name : "INTERNAL",
        value : 2
    },
    /** @expose */
    PRODUCTION : {
        name : "PRODUCTION",
        value : 3
    },
    /** @expose */
    DISABLED : {
        name : "DISABLED",
        value : 4
    }
};

/**
 * Various Perf constants.
 *
 * @enum {!string}
 * @expose
 */
var PerfConstants = {
    /** @expose */
    PAGE_START_MARK : "PageStart",
    /** @expose */
    PERF_PAYLOAD_PARAM : "bulkPerf",
    /** @expose */
    MARK_NAME : "mark",
    /** @expose */
    MEASURE_NAME : "measure",
    /** @expose */
    MARK_START_TIME : "st",
    /** @expose */
    MARK_LAST_TIME : "lt",
    /** @expose */
    PAGE_NAME : "pn",
    /** @expose */
    ELAPSED_TIME : "et",
    /** @expose */
    REFERENCE_TIME : "rt",
    /** @expose */
    Perf_LOAD_DONE : "loadDone"
};

/**
 * @enum {!string}
 * @expose
 */
PerfConstants.STATS = {
    /** @expose */
    NAME : "stat",
    /** @expose */
    SERVER_ELAPSED : "internal_serverelapsed",
    /** @expose */
    DB_TOTAL_TIME : "internal_serverdbtotaltime",
    /** @expose */
    DB_CALLS : "internal_serverdbcalls",
    /** @expose */
    DB_FETCHES : "internal_serverdbfetches"
};

window["PerfConstants"] = PerfConstants;
window["PerfLogLevel"] = PerfLogLevel;

/**
 * @public
 * @namespace
 * @const
 * @type {!IPerf}
 */
$A.ns.Aura.prototype.Perf = window["Perf"] ?
    //Planning to delete window.Perf, but can't until removing SFDC references to it
    //var tmp = window["Perf"];
    //delete window["Perf"];
    window["Perf"] :
{
    /**
     * @type {!window.typePerfLogLevel}
     * @expose
     * @const
     */
    currentLogLevel: PerfLogLevel.DISABLED,

    /**
     * @param {!string} id The id used to identify the mark.
     * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should
     * be logged at.
     * @return {!IPerf}
     * @expose
     */
    mark: function (id, logLevel) { return this; },

    /**
     * @param {!string} id This is the id associated with the mark that uses
     * the same id.
     * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should
     * be logged at.
     * @return {!IPerf}
     * @expose
     */
    endMark: function (id, logLevel) { return this; },

    /**
     * This method is used to the update the name of a mark
     *
     * @param {!string} oldName The id used to identify the old mark name.
     * @param {!string} newName The id used to identify the new mark name.
     * @return {!IPerf} for chaining methods
     * @expose
     */
    updateMarkName: function (oldName, newName) { return this; },

    /**
     * Serializes a measure object to JSON.
     *
     * @param {!window.typejsonMeasure} measure The measure to serialize.
     * @return {!string} JSON-serialized version of the supplied measure.
     * @expose
     */
    measureToJson: function (measure) { return ""; },

    /**
     * Serializes timers to JSON.
     *
     * @param {boolean=} includeMarks
     * @return {!string} JSON-serialized version of supplied marks.
     * @expose
     */
    toJson: function (includeMarks) { return ""; },

    /**
     * @param {!string} timer_name The name of the timer to set.
     * @param {number=} timer_delta The time delta to set.
     * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should be logged at. Defaults to PerfLogLevel.INTERNAL if left blank
     * @return {!IPerf}
     * @expose
     */
    setTimer: function (timer_name, timer_delta, logLevel) { return this; },

    /**
     * Get a JSON-serialized version of all existing timers and stats in POST friendly format.
     *
     * @return {!string} POST-friendly timers and stats.
     * @expose
     */
    toPostVar: function () { return ""; },

    /**
     * Returns all of the measures that have been captured
     *
     * @return {!Array.<window.typejsonMeasure>} all existing measures.
     * @expose
     */
    getMeasures: function () { return []; },

    /**
     * Returns the beaconData to piggyback on the next XHR call
     *
     * @return {?string} beacon data.
     * @expose
     */
    getBeaconData: function () { return null; },

    /**
     * Sets the beaconData to piggyback on the next XHR call
     *
     * @param {!string} beaconData
     * @expose
     */
    setBeaconData: function (beaconData) {},

    /**
     * Clears beacon data
     *
     * @expose
     */
    clearBeaconData: function () {},

    /**
     * Removes the existing timers
     *
     * @expose
     */
    removeStats: function () {},

    /**
     * Add a performance measurement from the server.
     *
     * @param {!string} label
     * @param {!number} elapsedMillis
     * @return {!IPerf}
     * @expose
     */
    stat: function (label, elapsedMillis) { return this; },

    /**
     * Get the stored server side performance measures.
     *
     * @param {!string} label
     * @return {!string|number}
     * @expose
     */
    getStat: function (label) { return -1; },

    /**
     * Called when the page is ready to interact with. To support the existing Kylie.onLoad method.
     *
     * @expose
     */
    onLoad: function () {},

    /**
     * This method is used to mark the start of a transaction
     *
     * @param {!string} tName The id used to identify the transaction.
     * @return {!IPerf} for chaining methods
     * @expose
     */
    startTransaction: function (tName) { return this; },

    /**
     * This method is used to mark the end of a transaction
     *
     * @param {!string} tName The id used to identify the transaction.
     * @return {!IPerf} for chaining methods
     * @expose
     */
    endTransaction: function (tName) { return this; },

    /**
     * This method is used to the update the name of the
     * transaction
     *
     * @param {!string} oldName The id used to identify the old transaction name.
     * @param {!string} newName The id used to identify the new transaction name.
     * @return {!IPerf} for chaining methods
     * @expose
     */
    updateTransaction: function (oldName, newName) { return this; },

    /**
     * This method is used to figure if onLoad/page_ready has been fired or
     * not
     *
     * @return {!boolean}
     * @expose
     */
    isOnLoadFired: function () { return false; },

    /**
     * @namespace
     * @type {!IPerf_util}
     * @const
     * @expose
     */
    util: /** @type {!IPerf_util} */ ({
        /**
         * Sets the roundtrip time cookie
         *
         * @param {!string=} name
         * @param {!string|number=} value
         * @param {Date=} expires
         * @param {string=} path
         * @expose
         */
        setCookie: function (name, value, expires, path) {}
    }),

    /**
     * Whether the full Kylie framework is loaded, as opposed to just the stubs.
     *
     * @type {boolean}
     * @const
     */
    enabled: false
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
// #include aura.storage.adapters.WebSQLAdapter
// #include aura.Logging
