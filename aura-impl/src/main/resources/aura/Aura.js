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

// -- Aura Bootstrap ------------------------------------------------------------

if (typeof Aura !== 'undefined') {//eslint-disable-line no-use-before-define
    Aura._Aura = Aura;
}
var Aura = {};
window["Aura"] = Aura;

// -- Namespaces ------------------------------------------------------------
Aura.Utils      = {};
Aura.Errors     = {};
Aura.Context    = {};
Aura.System     = {};
Aura.Style      = {};
Aura.Flavors    = {};
Aura.Value      = {};
Aura.Model      = {};
Aura.Component  = {};
Aura.Provider   = {};
Aura.Library    = {};
Aura.Event      = {};
Aura.Layouts    = {};
Aura.Controller = {};
Aura.Attribute  = {};
Aura.L10n       = {};
Aura.Services   = {};
Aura.Storage    = {};

/**
 * @description This, $A, is supposed to be our ONLY window-polluting top-level variable.
 * Everything else in Aura is attached to it.
 */
window['$A'] = {};

// -- Polyfills --------------------------------------------------------
// #include aura.polyfill.Array
// #include aura.polyfill.Function
// #include aura.polyfill.RequestAnimationFrame
// #include aura.polyfill.Object
// #include aura.polyfill.Json
// #include aura.polyfill.Promise

// -- Utils ------------------------------------------------------------
// #include aura.util.ExportSymbolsHelper
// #include aura.util.Style
// #include aura.util.Bitset
// #include aura.util.NumberFormat
// #include aura.util.DocLevelHandler
// #include aura.util.SizeEstimator
// #include aura.util.SecureFilters
// #include aura.util.Util
// #include aura.Logger
// #include aura.util.Override

// -- Errors ------------------------------------------------------------
// #include aura.AuraError
// #include aura.AuraFriendlyError

// -- Context -----------------------------------------------------------
// #include aura.context.AuraContext

// -- System ------------------------------------------------------------
// #include aura.system.DefDescriptor

// -- Style -------------------------------------------------------------
// #include aura.style.StyleDef

// -- Flavors -----------------------------------------------------------
// #include aura.flavors.FlavorDefaultDef
// #include aura.flavors.FlavorsDef

// -- Value -------------------------------------------------------------
// #include aura.value.PropertyReferenceValue
// #include aura.value.FunctionCallValue
// #include aura.value.PassthroughValue
// #include aura.value.ValueFactory
// #include aura.value.ExpressionFunctions

// -- Model -------------------------------------------------------------
// #include aura.model.ValueDef
// #include aura.model.ModelDef
// #include aura.model.Model

// -- Component ---------------------------------------------------------
// #include aura.component.ComponentClassRegistry
// #include aura.component.ComponentDefStorage
// #include aura.component.Component
// #include aura.component.InvalidComponent
// #include aura.component.ComponentDef

// -- Renderer ----------------------------------------------------------

// -- Provider ----------------------------------------------------------
// #include aura.provider.GlobalValueProviders
// #include aura.provider.LabelQueue
// #include aura.provider.LabelValueProvider
// #include aura.provider.ObjectValueProvider
// #include aura.provider.ContextValueProvider

// -- Helper -------------------------------------------------------------

// -- Library ------------------------------------------------------------
// #include aura.library.LibraryDefRegistry

// -- Event --------------------------------------------------------------
// #include aura.event.EventDef
// #include aura.event.Event

// -- Controller ---------------------------------------------------------
// #include aura.controller.ActionDef
// #include aura.controller.Action
// #include aura.controller.ControllerDef

// -- Attribute ----------------------------------------------------------
// #include aura.attribute.AttributeDef
// #include aura.attribute.AttributeSet
// #include aura.attribute.AttributeDefSet

// -- RequiredVersion ----------------------------------------------------------
// #include aura.requiredVersion.RequiredVersionDef
// #include aura.requiredVersion.RequiredVersionDefSet

// -- L10n ---------------------------------------------------------------
// #include aura.l10n.AuraLocalizationContext

// -- Storage -------------------------------------------------------------
// #include aura.storage.AuraStorageService
// #include aura.storage.AuraStorage

// -- Services -----------------------------------------------------------
// #include aura.AuraClientService
// #include aura.AuraComponentContext
// #include aura.AuraComponentService
// #include aura.AuraRenderingService
// #include aura.AuraExpressionService
// #include aura.AuraHistoryService
// #include aura.AuraEventService
// #include aura.AuraLocalizationService
// #include aura.AuraStyleService
// #include aura.metrics.AuraMetricsService

// -- Mode injection ------------------------------------------------------
// #include {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"], "path" : "aura.AuraDevToolService"}

//-- LockerService -----------------------------------------------------------
//#include aura.locker.LockerService

/**
 * @class Aura
 * @classdesc The Aura framework. Default global instance name is $A.
 * @constructor
 *
 * @borrows Aura.Services.AuraClientService#enqueueAction as enqueueAction
 * @borrows Aura.Services.AuraClientService#deferAction as deferAction
 * @borrows Aura.Services.AuraRenderingService#render as render
 * @borrows Aura.Services.AuraRenderingService#rerender as rerender
 * @borrows Aura.Services.AuraRenderingService#unrender as unrender
 * @borrows Aura.Services.AuraRenderingService#afterRender as afterRender
 * @borrows Aura.Services.AuraComponentService#get as getCmp
 * @borrows Aura.Services.AuraComponentService#createComponent as createComponent
 * @borrows Aura.Services.AuraComponentService#createComponents as createComponents
 * @borrows Aura.Services.AuraComponentService#getComponent as getComponent
 * @borrows Aura.Services.AuraComponentService#newComponentDeprecated as newCmp
 * @borrows Aura.Services.AuraComponentService#newComponentDeprecated as newCmpDeprecated
 * @borrows Aura.Services.AuraComponentService#newComponentAsync as newCmpAsync
 * @borrows Aura.Services.AuraEventService.newEvent as getEvt
 * @borrows Aura.Services.AuraClientService#getCurrentTransactionId as getCurrentTransactionId
 * @borrows Aura.Services.AuraClientService#setCurrentTransactionId as setCurrentTransactionId
 */
function AuraInstance () {
    this.globalValueProviders = {};
    this.displayErrors        = true;

    this.logger               = new Aura.Utils.Logger();

    /**
     * Collection of basic utility methods to operate on the DOM and Aura Components. <br/>
     * See the documentation for <a href="#reference?topic=api:Util">Util</a> for the members.
     *
     * @type $A.ns.Util
     * @platform
     */
    this.util                 = new Aura.Utils.Util();
    this["util"]              = this.util; //Move this? (check prod mangling)

    this.auraError            = Aura.Errors.AuraError;
    this.auraFriendlyError    = Aura.Errors.AuraFriendlyError;

    /**
     * Instance of the AuraLocalizationService which provides utility methods for localizing data or getting formatters for numbers, currencies, dates, etc.<br/>
     * See the documentation for <a href="#reference?topic=api:AuraLocalizationService">AuraLocalizationService</a> for the members.
     *
     * @type AuraLocalizationService
     * @platform
     */
    this.localizationService  = new Aura.Services.AuraLocalizationService();
    this.clientService        = new Aura.Services.AuraClientService();
    this.componentService     = new Aura.Services.AuraComponentService();
    this.renderingService     = new Aura.Services.AuraRenderingService();
    this.expressionService    = new Aura.Services.AuraExpressionService();
    this.historyService       = new Aura.Services.AuraHistoryService();
    this.eventService         = new Aura.Services.AuraEventService();
    this.storageService       = new Aura.Services.AuraStorageService();
    this.styleService         = new Aura.Services.AuraStyleService();
    this.metricsService       = new Aura.Services.MetricsService();
    this.lockerService        = new Aura.Services.LockerService();

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    this.devToolService = new AuraDevToolService();
    //#end


    /** @field */
    this.services = {
        /**
         * Rendering Service
         *
         * @public
         * @type AuraRenderingService
         * @memberOf Aura.Services
         */
        rendering : this.renderingService,
        /**
         * Event Service
         *
         * @public
         * @type AuraEventService
         * @memberOf Aura.Services
         */
        event : this.eventService,
        /**
         * Component Service
         *
         * @public
         * @type AuraComponentService
         * @memberOf Aura.Services
         */
        component : this.componentService,
        /**
         * Client Service
         *
         * @public
         * @type AuraClientService
         * @memberOf AuraInstance.prototype
         */
        client : this.clientService,

        /**
         * History Service
         *
         * @public
         * @type AuraHistoryService
         * @memberOf AuraInstance.prototype
         */
        history : this.historyService,

        /**
         * Localization Service
         *
         * @public
         * @type AuraLocalizationService
         * @memberOf AuraInstance.prototype
         */
        localization : this.localizationService,

        /**
         * Storage Service
         *
         * @public
         * @type AuraStorageService
         * @memberOf AuraInstance.prototype
         */
        storage : this.storageService,

        /**
         * Alias of Component Service
         *
         * @public
         * @type AuraComponentService
         * @memberOf AuraInstance.prototype
         * @see Aura#services.component
         */
        cmp : this.componentService,

        /**
         * Alias of Event Service
         *
         * @public
         * @type AuraEventService
         * @memberOf AuraInstance.prototype
         * @see Aura#services.event
         */
        e : this.eventService,

        /**
         * Alias of Localization Service
         *
         * @public
         * @type AuraLocalizationService
         * @memberOf AuraInstance.prototype
         * @see Aura#service.localization
         */
        l10n : this.localizationService,

        /**
         * Style Service
         *
         * @public
         * @type AuraStyleService
         * @memberOf AuraInstance.prototype
         */
        style: this.styleService,
        
        /**
         * Metrics Service
         *
         * @public
         * @type AuraMetricsService
         * @memberOf AuraInstance.prototype
         */
        metrics: this.metricsService,

        /**
         * Locker Service
         *
         * @public
         * @type AuraLockerService
         * @memberOf AuraInstance.prototype
         */
        locker: this.lockerService,
        
        get : function(key) {
            var ret = $A.services[key];
            if (!ret && key === "root") {
                return $A.getRoot();
            }
            return ret;
        }
    };


    // Doced at the source by the @borrows statements on the Aura class
    this.Component                 = Component;

    this.enqueueAction             = this.clientService.enqueueAction.bind(this.clientService);
    this.deferAction               = this.clientService.deferAction.bind(this.clientService);
    this.getCurrentTransactionId   = this.clientService.getCurrentTransactionId.bind(this.clientService);
    this.setCurrentTransactionId   = this.clientService.setCurrentTransactionId.bind(this.clientService);

    this.render                    = this.renderingService.render.bind(this.renderingService);
    this.rerender                  = this.renderingService.rerender.bind(this.renderingService);
    this.unrender                  = this.renderingService.unrender.bind(this.renderingService);
    this.afterRender               = this.renderingService.afterRender.bind(this.renderingService);

    this.getCmp                    = this.componentService.get.bind(this.componentService);
    this.getComponent              = this.componentService.getComponent.bind(this.componentService);
    this.createComponent           = this.componentService["createComponent"].bind(this.componentService);
    this.createComponents          = this.componentService["createComponents"].bind(this.componentService);
    this.newCmp                    = this.componentService["newComponentDeprecated"].bind(this.componentService);
    this.newCmpDeprecated          = this.componentService["newComponentDeprecated"].bind(this.componentService);
    this.newCmpAsync               = this.componentService["newComponentAsync"].bind(this.componentService);

    this.createComponentFromConfig = this.componentService.createComponentFromConfig.bind(this.componentService);
    this.getEvt                    = this.eventService.newEvent.bind(this.eventService);

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

    //	Google Closure Compiler Symbol Exports
	this["getCurrentTransactionId"] = this.getCurrentTransactionId;
    this["setCurrentTransactionId"] = this.setCurrentTransactionId;
    this["clientService"] = this.clientService;
    this["componentService"] = this.componentService;
    this["renderingService"] = this.renderingService;
    this["expressionService"] = this.expressionService;
    this["historyService"] = this.historyService;
    this["localizationService"] = this.localizationService;
    this["eventService"] = this.eventService;
    this["layoutService"] = this.layoutService;
    this["metricsService"] = this.metricsService;
    this["lockerService"] = this.lockerService;
    this["storageService"] = this.storageService;
    this["styleService"] = this.styleService;
    this["services"] = this.services;
    this["enqueueAction"] = this.enqueueAction;
    this["deferAction"] = this.deferAction;
    this["render"] = this.render;
    this["rerender"] = this.rerender;
    this["unrender"] = this.unrender;
    this["afterRender"] = this.afterRender;
    this["logger"] = this.logger;
    this["getCmp"] = this.getCmp;
    this["getComponent"] = this.getComponent;
    this["pushCreationPath"] = this.pushCreationPath;
    this["popCreationPath"] = this.popCreationPath;
    this["setCreationPathIndex"] = this.setCreationPathIndex;
        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        this["devToolService"] = this.devToolService;
        this["getQueryStatement"] = this.devToolService.newStatement;
        this["qhelp"] = function() { return this.devToolService.help();};
        //#end
    this["createComponent"] = this.createComponent;
    this["createComponents"] = this.createComponents;
    this["createComponentFromConfig"] = this.createComponentFromConfig;
    this["newCmp"] = this.newCmp;
    this["newCmpDeprecated"] = this.newCmpDeprecated;
    this["newCmpAsync"] = this.newCmpAsync;
    this["getEvt"] = this.getEvt;
    this["Component"] = this.Component;

    this["auraError"] = this.auraError;
    this["auraFriendlyError"] = this.auraFriendlyError;
    this["hasDefinition"] = this.hasDefinition;
    this["getDefinition"] = this.getDefinition;
    this["getDefinitions"] = this.getDefinitions;

    var services = this.services;

    // TODO: convert to //#exportSymbols when available


    services["rendering"] = services.rendering;
    services["event"] = services.event;
    services["component"] = services.component;
    services["client"] = services.client;
    services["history"] = services.history;
    services["l10n"] = services.localization;
    services["storage"] = services.storage;
    services["metrics"] = services.metrics;
    services["cmp"] = services.cmp;
    services["e"] = services.e;
    services["c"] = {

        get: function(name) {
            var path = (name||'').split('.');
            var controllerDef = path.shift();
            var action = path.shift();

            return services.component.getControllerDef(controllerDef).get(action);
        }
    };

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

}

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
AuraInstance.prototype.initAsync = function(config) {

    // Context is created async because of the GVPs go though async storage checks
    $A.context = new Aura.Context.AuraContext(config["context"], function(context) {

        $A.context = context;
        $A.clientService.initHost(config["host"]);
        $A.setLanguage();

        $A.metricsService.initialize();

        $A.clientService.loadComponent(config["descriptor"], config["attributes"], $A.initPriv, config["deftype"]);
    });
};

/**
 * Set the language for the HTML document.
 *
 * This must be called after the context is initialized and we have our GVPs set up.
 */
AuraInstance.prototype.setLanguage = function() {
    var lang = $A.get("$Locale.userLocalLang") || "en";
    document["getElementsByTagName"]("html")[0]["setAttribute"]("lang", lang);
};

/**
 * Initializes Aura with context info but without retrieving component from server. Used for synchronous initialization.
 *
 * @param {Object} config The configuration attributes
 * @param {Boolean} useExisting
 * @param {Boolean} doNotInitializeServices Set to true if the History service should not be initialized, or false if
 * 	 it should. Defaults to true for Aura Integration Service.
 */
AuraInstance.prototype.initConfig = function(config, useExisting, doNotInitializeServices) {
    config = $A.util.json.resolveRefsObject(config);

    if (!useExisting || $A.util.isUndefined($A.getContext())) {
        $A.clientService.initHost(config["host"], config["sid"]);
        // creating context.
        $A.context = new Aura.Context.AuraContext(config["context"]);
        $A.setLanguage();
        this.initPriv(config["instance"], config["token"], null, doNotInitializeServices);
        $A.context.finishComponentConfigs($A.context.getCurrentAction().getId());
        $A.context.setCurrentAction(null);
    } else {
        // Use the existing context and just join the new context into it
        // FIXME: is this used? it won't do the right thing if there are components.
        $A.getContext()['merge'](config["context"]);
    }
};

/**
 * Initializes Aura in debug environment.
 *
 * @param {Object} config The descriptor ("markup://foo:bar"), attributes, defType ("APPLICATION" or "COMPONENT"), and
 *        timestamp of last modified change
 * @param {String} token
 * @param {Object} container Sets the container for the component.
 * @param {Boolean=} doNotInitializeServices True if the History service should not be initialized, or false if
 *        it should. Defaults to true for Aura Integration Service.
 * @private
 */
AuraInstance.prototype.initPriv = function(config, token, container, doNotInitializeServices) {
    $A.metricsService.bootstrapMark("metadataReady"); // we have loaded the app tree from the server

    if (!$A["hasErrors"]) {
        var app = $A.clientService["init"](config, token, $A.util.getElement(container));
        $A.setRoot(app);

        if (!$A.initialized) {
            $A.initialized = true;
            $A.addDefaultErrorHandler(app);
            // Restore component definitions from AuraStorage into memory (if persistent)
            $A.componentService.restoreDefsFromStorage().then(function () {
                $A.finishInit(doNotInitializeServices);
            });
        }
        
    }
};

/**
 * Add default handler to aura:systemError event
 * @private
 */
AuraInstance.prototype.addDefaultErrorHandler = function (app) {
    $A.eventService.addHandler({
        "event": "aura:systemError",
        "globalId": app.getGlobalId(),
        "handler": function(event) {
            if (event["handled"]) { return; }
            $A.message(event.getParam("message"));
            event["handled"] = true;
        }
    });
};

/**
 * Signals that initialization has completed.
 * @private
 */
AuraInstance.prototype.finishInit = function(doNotInitializeServices) {
    if (!this["finishedInit"]) {
        $A.util.removeClass(document.body, "loading");
        delete $A.globalValueProviders;
        this["finishedInit"] = true;
        $A.get("e.aura:initialized").fire();
        $A.metricsService.applicationReady();
    }

    // Unless we are in IntegrationServices, dispatch location hash change.
    if (!doNotInitializeServices) {
        $A.historyService.init();
    }
};

/**
 * @description Use <code>$A.error()</code> in response to a serious error that has no recovery path.
 *
 * If this occurs during a test, the test will be stopped unless you add calls to '$A.test.expectAuraError' for
 * each error that occurs. <code>auraErrorsExpectedDuringInit</code> allows server side errors to not stop the
 * test as well.
 *
 *
 * @public
 * @param {String} msg The error message to be displayed to the user.
 * @param {Error} [e] The error object to be displayed to the user.
 * @platform
 * @deprecated throw new Error(msg) instead
 */
AuraInstance.prototype.error = function(msg, e){
    this.logger.error(msg, e);
};

/**
 * Optionally sets and returns whether to display error dialog
 *
 * @private
 * @param {Boolean} [toggle] toggles display of error dialog
 * @returns {Boolean} whether to display error dialog
 */
AuraInstance.prototype.showErrors = function(toggle){
    if (toggle !== undefined) {
        this.displayErrors = !!toggle;
    }
    return this.displayErrors;
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
 * @platform
 */
AuraInstance.prototype.warning = function(w, e) {
    this.logger.warning(w, e);
};

/**
 * Displays an error message to the user. Currently used for displaying errors that do not cause the application to
 * stop completely.
 *
 * @public
 * @param {String} msg The message to display.
 */
AuraInstance.prototype.message = function(msg) {
    if (!this.displayErrors) {
        return;
    }

    var message = $A.util.getElement("auraErrorMessage");
    message.innerHTML = "";
    message.appendChild(document.createTextNode(msg));

    $A.util.removeClass(document.body, "loading");
    $A.util.addClass(document.body, "auraError");
};

/**
 * Returns a callback which is safe to invoke from outside Aura, e.g. as an event handler or in a setTimeout.
 * @public
 * @function
 * @param {Function} callback The method to call after reestablishing Aura context.
 * @platform
 */
AuraInstance.prototype.getCallback = function(callback) {
    $A.assert($A.util.isFunction(callback),"$A.getCallback(): 'callback' must be a valid Function");
    var context=$A.getContext().getCurrentAccess();
    var transactionId = $A.getCurrentTransactionId();
    return function(){
        var nested = $A.clientService.inAuraLoop();
        $A.getContext().setCurrentAccess(context);
        $A.clientService.pushStack(name);
        var savedTid = $A.getCurrentTransactionId();
        if (transactionId) {
            $A.setCurrentTransactionId(transactionId);
        }
        try {
            return callback.apply(this,Array.prototype.slice.call(arguments));
        } catch (e) {
            // Should we even allow 'nested'?
            // no need to wrap AFE with auraError as customers who throw AFE would want to handle it with their own custom experience.
            if (nested || e instanceof $A.auraFriendlyError) {
                throw e;
            } else {
                throw new $A.auraError("Uncaught error in "+name, e);
            }
        } finally {
            $A.clientService.popStack(name);
            $A.getContext().releaseCurrentAccess();
            if (nested) {
                $A.setCurrentTransactionId(savedTid);
            }
        }
    };
};

/**
 * Returns the value referenced using property syntax. Gets the value from the specified global value provider.
 * @public
 * @function
 * @param {String} key The data key to look up on element, for example, <code>$A.get("$Label.section.key")</code>.
 * @param {Function} callback The method to call with the result if a server trip is expected.
 * @platform
 */
AuraInstance.prototype.get = function(key, callback) {
// JBUCH: TODO: FIXME
//    if(callback){
//        throw new Error("Remove Me!");
//    }
    key = $A.expressionService.normalize(key);
    var path = key.split('.');
    var root = path.shift();
    var valueProvider = $A.services[root] || $A.getValueProvider(root);
    if (valueProvider) {
        if (path.length) {
            if (valueProvider.get) {
                return valueProvider.get(path.join('.'), callback);
            } else {
                return $A.expressionService.resolve(path, valueProvider);
            }
        }
        return valueProvider.getValues ? valueProvider.getValues() : valueProvider;
    }

};

/**
 * Sets the value referenced using property syntax on the specified global value provider.
 * @public
 * @function
 * @param {String} key The data key we want to change on the global value provider, for example, <code>$A.set("$Custom.something","new Value")</code>.
 * @param {Object} value The value to set the key location to. If the global value provider does not implement .set(), this method will throw an exception.</code>.
 * @platform
 */
AuraInstance.prototype.set = function(key, value) {
    key = $A.expressionService.normalize(key);
    var path = key.split('.');
    var root = path.shift();
    var valueProvider = $A.getValueProvider(root);
    if(!valueProvider){
        $A.assert(false, "Unable to set value for key '" + key + "'. No value provider was found for '" + root + "'.");
    }
    if(!valueProvider["set"]){
        $A.assert(false, "Unable to set value for key '" + key + "'. Value provider does not implement 'set(key, value)'.");
    }
    var oldValue=$A.get(key);
    var result=valueProvider["set"](path.join('.'), value);
    $A.expressionService.updateGlobalReference(key,oldValue,value);
    return result;
};


/**
 * Returns a live reference to the global value indicated using property syntax.
 *
 * @param {String} key The data key for which to return a reference.
 * @return {PropertyReferenceValue}
 * @public
 * @platform
 * @export
 */
AuraInstance.prototype.getReference = function(key) {
    return $A.expressionService.getReference(key);
};

Aura.OverrideMap$Instance = undefined;

/**
 * Override a function in aura.
 *
 * This should only be available to plugins, and only works on functions designed for this purpose.
 *
 * @param {string} name the name of the override point
 * @param {Function} fn the function to insert in the chain.
 * @param {Object} scope a scope for invoking the function.
 * @param {number} priority a priority for the function (0 = highest -> first, 100 = lowest ->last, default 50)
 * @public
 */
AuraInstance.prototype.installOverride = function(name, fn, scope, priority) {
    if (Aura.OverrideMap$Instance === undefined) {
        Aura.OverrideMap$Instance = new Aura.OverrideMap();
    }
    if (priority === undefined) {
        priority = 50;
    }
    var override = Aura.OverrideMap$Instance.map[name];
    if (!override) {
        throw new Error("$A.installOverride: Invalid name: "+name);
    }
    $A.assert(fn && $A.util.isFunction(fn), "Function must be a defined function");
    override.install(fn, scope, priority);
};

/**
 * Remore an override in aura.
 *
 * @public
 */
AuraInstance.prototype.uninstallOverride = function(name, fn) {
    if (Aura.OverrideMap$Instance === undefined) {
        Aura.OverrideMap$Instance = new Aura.OverrideMap();
    }
    var override = Aura.OverrideMap$Instance.map[name];
    if (!override) {
        throw new Error("$A.uninstallOverride: Invalid name: "+name);
    }
    override.uninstall(fn);
};

/**
 * Gets the component that is passed to a controller method. For example, <code>$A.getRoot().get("v.attrName");</code> returns the attribute from the root component.
 * @public
 * @function
 * @platform
 */
AuraInstance.prototype.getRoot = function() {
    return this.root;
};

/**
 * @private
 */
AuraInstance.prototype.setRoot = function(root) {
    this.root = root;
};

/**
 * Gets the current <code>AuraContext</code>. The context consists of the mode, descriptor, and namespaces to be loaded.
 *
 * @public
 * @function
 * @return {AuraContext} current context
 */
AuraInstance.prototype.getContext = function() {
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
 * @platform
 */
AuraInstance.prototype.run = function(func, name) {
    $A.assert(func && $A.util.isFunction(func), "The parameter 'func' for $A.run() must be a function!");
    if (name === undefined) {
        name = "$A.run()";
    }
    var nested = $A.services.client.inAuraLoop();

    $A.services.client.pushStack(name);
    try {
        return func();
    } catch (e) {
        // no need to wrap AFE with auraError as customers who throw AFE would want to handle it with their own custom experience.
        if (nested || e instanceof $A.auraFriendlyError) {
            throw e;
        } else {
            throw (e instanceof $A.auraError) ? e : new $A.auraError("Uncaught error in "+name, e);
        }
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
AuraInstance.prototype.assert = function(condition, assertMessage) {
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
AuraInstance.prototype.userAssert = function(condition, msg) {
    // For now use the same method
    $A.assert(condition, msg);
};

/**
 *  Logs to the browser's JavaScript console if it is available.
 *  This method doesn't log in PROD or PRODDEBUG modes.
 *  If both value and error are passed in, value shows up in the console as a group with value logged within the group.
 *  If only value is passed in, value is logged without grouping.
 *  <p>For example, <code>$A.log(action.getError());</code> logs the error from an action.</p>
 *
 * @public
 * @param {Object} value The first object to log.
 * @param {Object} error The error messages to be logged in the stack trace.
 * @platform
 */
AuraInstance.prototype.log = function(value, error) {
    this.logger.info(value, error);
};

/**
 * Logs a stack trace. Trace calls using <code>console.trace()</code> if defined on the console implementation.
 * @public
 */
AuraInstance.prototype.trace = function() {
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
AuraInstance.prototype.setMode = function(mode) {
    this.mode = mode;
    this.enableAssertions = (mode !== 'PROD' && mode !== 'PTEST');
};

/**
 * Get GVP directly.
 * @param {String} type The type of global value provider to retrieve.
 * @return {GlobalValueProvider} The global value provider, such as $Label, $Browser, $Locale, etc.
 *
 * @private
 */
AuraInstance.prototype.getValueProvider = function(type) {
    return this.getContext().getGlobalValueProvider(type);
};

/**
 * Add a new Global Value Provider.
 * @param {String} type The type of global value provider to add. Types must start with a '$', and may not use reserved
 *                      types, such as '$Label', '$Browser', or '$Locale'
 * @param {ValueProvider} The global value provider. This can either implement a '.get(expression)' and
 *                               optional '.set(expression, value)' method, or simply be an instance of an Object.
 *
 * @public
 */
AuraInstance.prototype.addValueProvider=function(type,valueProvider){
    $A.assert($A.util.isString(type),"$A.addValueProvider(): 'type' must be a valid String.");
    $A.assert(type.charAt(0)==='$',"$A.addValueProvider(): 'type' must start with '$'.");
    $A.assert(",$browser,$label,$locale,".indexOf(","+type.toLowerCase()+",")===-1,"$A.addValueProvider(): '"+type+"' is a reserved valueProvider.");
    $A.assert(!$A.util.isUndefinedOrNull(valueProvider),"$A.addValueProvider(): 'valueProvider' is required.");
    var context=this.getContext();
    if(context){
        $A.assert(this.getValueProvider(type)==null,"$A.addValueProvider(): '"+type+"' has already been registered.");
        context.addGlobalValueProvider(type,valueProvider);
    }else{
        $A.assert(this.globalValueProviders[type]==null,"$A.addValueProvider(): '"+type+"' has already been registered.");
        this.globalValueProviders[type]=valueProvider;
    }
};

/**
 * Gets the event or component definition. If it is not currently on the client, we will access the server to attempt to retrieve it.
 *
 * @public
 *
 * @param  {String}   descriptor Descriptor in the pattern prefix:name or markup://prefix:name. Use e.prefix:name, or markup://e.prefix:name for an event definition.
 * @param  {Function} callback   Function whos first parameter is the requested definition if it exists. Otherwise the first parameter is null.
 * @return undefined
 */
AuraInstance.prototype.getDefinition = function(descriptor, callback) {
    $A.assert($A.util.isString(descriptor), "'descriptor' must be an event or component descriptor such as 'prefix:name' or 'e.prefix:name'.");
    $A.assert($A.util.isFunction(callback), "'callback' must be a valid function.");

    if(descriptor.indexOf("e.") !== -1) {
        return this.eventService.getDefinition(descriptor, callback);
    }
    return this.componentService.getDefinition(descriptor, callback);
};

/**
 * Similar to $A.getDefinition() will retrieve an array of definitions at one time. Optimal if you expect them not to be available on the client.
 * @public
 * @param  {Array}   descriptors An Array of Descriptors in the format expected by $A.getDefinition() can be a mix of events and component descriptors.
 * @param  {Function} callback   Function whos first parameter is an array of the definitions requested. Some definitions may be null, which are those definitions you don't have access to or did not exist.
 * @return undefined             Always use the callback to access the definitions you requested.
 */
AuraInstance.prototype.getDefinitions = function(descriptors, callback) {
    $A.assert($A.util.isArray(descriptors), "'descriptors' must be an array of definition descriptors to retrieve.");
    $A.assert($A.util.isFunction(callback), "'callback' must be a valid function.");

    var pendingMap = {};
    var returnDefinitions = [];
    var requestDefinitions = [];
    var descriptor;
    var def;
    var isEvent;
    for(var c=0,length=descriptors.length;c<length;c++) {
        descriptor = descriptors[c];
        if(descriptor && descriptor.indexOf("e.") !== -1) {
            descriptor = descriptor.replace("e.", "");
            isEvent = true;
            def =this.eventService.getEventDef(descriptor);
        } else {
            def = this.componentService.getDef(descriptor);
            isEvent = false;
        }
        if(def) {
            returnDefinitions[c] = def;
        } else {
            // Detect without access checks to see if
            if((isEvent && !this.eventService.hasDefinition(descriptor)) ||
                    (!isEvent && !this.componentService.getComponentDef(this.componentService.createDescriptorConfig(descriptor)))) {

                requestDefinitions.push(descriptors[c]);
                pendingMap[descriptor] = {
                    "position": c,
                    "isEvent": isEvent
                };
            } else {
                returnDefinitions[c] = null;
            }
        }
    }

    if(!requestDefinitions.length) {
        callback(returnDefinitions);
    } else {
        var action = $A.get("c.aura://ComponentController.getDefinitions");
        action.setParams({
            "names": requestDefinitions
        });
        action.setCallback(this, function () {
            //$A.assert(action.getState() === 'SUCCESS', "Definition '" + descriptor + "' was not found on the client or the server.");
            // We use getDef at the moment so we do the access check.
            //executeCallbackcallback(this.getDef(descriptor));
            //var returnValue = action.getReturnValue();
            var pendingInfo;
            for(var requestedDescriptor in pendingMap) {
                if(pendingMap.hasOwnProperty(requestedDescriptor)) {
                    pendingInfo = pendingMap[requestedDescriptor];
                    if(pendingInfo["isEvent"]) {
                        returnDefinitions[pendingInfo["position"]] = this.eventService.getEventDef(requestedDescriptor) || null;
                    } else {
                        returnDefinitions[pendingInfo["position"]] = this.componentService.getDef(requestedDescriptor) || null;
                    }
                }
            }
            callback(returnDefinitions);
        });

        $A.enqueueAction(action);
    }
};

/**
 * Detect if a definition is present on the client. May still exist on the server.
 * @public
 * @param  {String}   descriptor Descriptor in the pattern prefix:name. Use e.prefix:name for an event definition.
 * @return {Boolean}             True if the definition is present on the client.
 */
AuraInstance.prototype.hasDefinition = function(descriptor) {
    $A.assert($A.util.isString(descriptor), "'descriptor' must be an event or component descriptor such as 'prefix:name' or 'e.prefix:name'.");

    if(descriptor.indexOf("e.") !== -1) {
        return this.eventService.hasDefinition(descriptor.replace("e.", ""));
    }
    return this.componentService.hasDefinition(descriptor);
};

// #include aura.util.PerfShim
AuraInstance.prototype.Perf = window['Perf'] || PerfShim;

// #include aura.Aura_export

// At this point, Aura has been defined with all our types on it, but $A itself
// is just a placeholder. Use this function to preserve Aura while populating
// $A, without making a new top-level name:
(function bootstrap() {
    /**
     * @description This, $A, is supposed to be our ONLY window-polluting top-level variable. Everything else in Aura is
     *            attached to it.
     *
     * @platform
     * @namespace
     * @alias $A
     *
     * @borrows AuraComponentService#createComponent as $A.createComponent
     * @borrows AuraComponentService#createComponents as $A.createComponents
     * @borrows AuraComponentService#getComponent as $A.getComponent
     * @borrows AuraClientService#enqueueAction as $A.enqueueAction
     * @borrows AuraInstance#getRoot as $A.getRoot
     * @borrows AuraInstance#getCallback as $A.getCallback
     * @borrows AuraInstance#get as $A.get
     * @borrows AuraInstance#set as $A.set
     * @borrows AuraInstance#error as $A.error
     * @borrows AuraInstance#log as $A.log
     * @borrows AuraInstance#warning as $A.warning
     * @borrows AuraInstance#run as $A.run
     * @borrows AuraComponentService#newComponentDeprecated as $A.newCmp
     * @borrows AuraComponentService#newComponentAsync as $A.newCmpAsync
     * @borrows AuraInstance#localizationService as localizationService
     * @borrows AuraInstance#util as util
     */
    window['$A'] = new AuraInstance();
    $A.metricsService.bootstrapMark("frameworkReady");

})();

// TODO: Remove the legacy 'aura' top-level name.
window['aura'] = window['$A'];

// -- Storage Adapters -------------------------------------------------
// #include aura.storage.adapters.MemoryAdapter
// #include aura.storage.adapters.IndexedDBAdapter
// #include aura.storage.adapters.CryptoAdapter

// -- Metrics Plugins --------------------------------------------------
// #include aura.metrics.plugins.TransportMetricsPlugin
// #include aura.metrics.plugins.PerfMetricsPlugin
// #include aura.metrics.plugins.QueuedActionsMetricsPlugin
// #include aura.metrics.plugins.ClientServiceMetricsPlugin
// #include aura.metrics.plugins.AuraContextPlugin
// #include aura.metrics.plugins.DomHandlersPlugin

// #include {"excludeModes" : ["PRODUCTION"], "path" : "aura.metrics.plugins.ComponentServiceMetricsPlugin"}

// #include aura.Logging
//#include {"modes" : ["DOC","TESTING","AUTOTESTING", "TESTINGDEBUG", "AUTOTESTINGDEBUG"], "path" : "aura.test.Test"}
