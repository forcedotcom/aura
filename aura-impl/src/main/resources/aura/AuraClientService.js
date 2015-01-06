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
 * @description The Aura Client Service, accessible using $A.services.client.
 *            Communicates with the Aura Server.
 * @constructor
 */
var AuraClientService = function() {
    // #include aura.controller.Action
    // #include aura.controller.ActionCallbackGroup
    // #include aura.controller.ActionQueue
    // #include aura.controller.ActionCollector
    // #include aura.model.ValueDef
    // #include aura.AuraClientService_private

    var NOOP = function() {};

    var clientService = {

        /**
         * Init host is used to set the host name for communications.
         *
         * It should only be called once during the application life cycle, since it
         * will be deleted in production mode.
         *
         * Note that in testing, this can be used to make the host appear unreachable.
         *
         * @param {string} host the host name of the server.
         * @public
         */
        initHost : function(host) {
            priv.host = host || "";
            //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
            delete this.initHost;
            //#end
        },

        /**
         * Initialize aura.
         *
         * This should never be called by client code. It is exposed, but deleted after
         * first use.
         *
         * @param {Object} config the configuration for aura.
         * @param {string} token the XSS token.
         * @param {function} callback the callback when init is complete.
         * @param {object} container the place to install aura (defaults to document.body).
         * @private
         */
        init : function(config, token, callback, container) {
            $A.Perf.mark("Initial Component Created");
            $A.Perf.mark("Initial Component Rendered");
            var body = document.body;

            //
            // not on in dev modes to preserve stacktrace in debug tools
            // Why? - goliver
            // I think this should be done in all cases, the $A.error can be more
            // instructive than an uncaught exception.
            //
            //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
            try {
                //#end

            	if (token) {
                    priv.token = token;
                }

                // Why is this happening in the ClientService? --JT
                // NOTE: no creation path here, we are at the top level
                var component = componentService.newComponentDeprecated(config, null, false, true);

                $A.Perf.endMark("Initial Component Created");

                renderingService.render(component, container || body);
                renderingService.afterRender(component);

                $A.Perf.endMark("Initial Component Rendered");
                callback(component);

                // not on in dev modes to preserve stacktrace in debug tools
                //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
            } catch (e) {
                $A.error("Error during init", e);
                throw e;
            }
            //#end
            delete this.init;
        },

        /**
         * This function is used by the test service to determine if there are outstanding actions.
         *
         * @private
         */
        idle : function() {
            return priv.foreground.idle() && priv.background.idle() && priv.actionQueue.actions.length === 0;
        },

        /**
         * Initialize definitions.
         *
         * This should never be called by client code. It is exposed, but deleted after
         * first use.
         *
         * @param {Object} config the set of definitions to initialize
         * @private
         */
        initDefs : function(config) {
            var evtConfigs = aura.util.json.resolveRefs(config["eventDefs"]);
            $A.Perf.mark("Registered Events [" + evtConfigs.length + "]");
            for ( var j = 0; j < evtConfigs.length; j++) {
                eventService.getEventDef(evtConfigs[j]);
            }
            $A.Perf.endMark("Registered Events [" + evtConfigs.length + "]");

            var libraryConfigs = aura.util.json.resolveRefs(config["libraryDefs"]);
            $A.Perf.mark("Registered Libraries [" + libraryConfigs.length + "]");
            for (j = 0; j < libraryConfigs.length; j++) {
                componentService.getLibraryDef(libraryConfigs[j]);
            }
            $A.Perf.endMark("Registered Libraries [" + libraryConfigs.length + "]");

            var controllerConfigs = aura.util.json.resolveRefs(config["controllerDefs"]);
            $A.Perf.mark("Registered Controllers [" + controllerConfigs.length + "]");
            for (j = 0; j < controllerConfigs.length; j++) {
                componentService.getControllerDef(controllerConfigs[j]);
            }
            $A.Perf.endMark("Registered Controllers [" + controllerConfigs.length + "]");

            var comConfigs = aura.util.json.resolveRefs(config["componentDefs"]);
            $A.Perf.mark("Registered Components [" + comConfigs.length + "]");
            for ( var i = 0; i < comConfigs.length; i++) {
                componentService.getDef(comConfigs[i]);
            }
            $A.Perf.endMark("Registered Components [" + comConfigs.length + "]");

            $A.Perf.endMark("PageStart");

            // Let any interested parties know that defs have been initialized
            for ( var n = 0; n < priv.initDefsObservers.length; n++) {
                priv.initDefsObservers[n]();
            }

            priv.initDefsObservers = [];

            // Use the non-existence of initDefs() as the sentinel indicating that defs are good to go
            delete this.initDefs;
        },

        /**
         * Run a callback after defs are initialized.
         *
         * This is for internal use only. The function is called synchronously if definitions have
         * already been initialized.
         *
         * @param {function} callback the callback that should be invoked after defs are initialized
         * @private
         */
        runAfterInitDefs : function(callback) {
            if (this.initDefs) {
                // Add to the list of callbacks waiting until initDefs() is done
                priv.initDefsObservers.push(callback);
            } else {
                // initDefs() is done and gone so just run the callback
                callback();
            }
        },

        /**
         * Load an app by calling loadComponent.
         *
         * @param {DefDescriptor}
         *            descriptor The key for a definition with a qualified name
         *            of the format prefix://namespace:name.
         * @param {Map}
         *            attributes The configuration data to use in the app
         * @param {function}
         *            callback The callback function to run
         * @memberOf AuraClientService
         * @private
         */
        loadApplication : function(descriptor, attributes, callback) {
            this.loadComponent(descriptor, attributes, callback, "APPLICATION");
        },

        /**
         * Fire an event exception from the wire.
         *
         * This is published, but only for use in the case of an event exception serialized as JS,
         * not sure if this is important.
         *
         * @param {Object} config The data for the exception event
         * @memberOf AuraClientService
         * @private
         */
        throwExceptionEvent : function(config) {
            priv.thowExceptionEvent(config);
        },

        /**
         * Load a component.
         *
         * @param {DefDescriptor}
         *            descriptor The key for a definition with a qualified name
         *            of the format prefix://namespace:name
         * @param {Map}
         *            attributes The configuration data to use. If specified,
         *            attributes are used as a key value pair.
         * @param {function}
         *            callback The callback function to run
         * @param {String}
         *            defType Sets the defType to "COMPONENT"
         * @memberOf AuraClientService
         * @private
         */
        loadComponent : function(descriptor, attributes, callback, defType) {
            var that = this;
            this.runAfterInitDefs(function() {
                $A.run(function() {
                    var desc = new DefDescriptor(descriptor);
                    var tag = desc.getNamespace() + ":" + desc.getName();

                    var method = defType === "APPLICATION" ? "getApplication" : "getComponent";
                    var action = $A.get("c.aura://ComponentController." + method);

                    action.setStorable({
                        "ignoreExisting" : true
                    });
                    //
                    // No, really, do not abort this. The setStorable above defaults this
                    // to be abortable, but, even though nothing should ever trigger an action
                    // that could be abortable here (we haven't loaded the app yet, so it shouldn't
                    // be possible), we want to avoid any confusion.
                    //
                    action.setAbortable(false);

                    action.setParams({
                        name : tag,
                        attributes : attributes
                    });

                    action.setCallback(that, function(a) {
                        var state = a.getState();
                        if (state === "SUCCESS") {
                            callback(a.getReturnValue());
                        } else if (state === "INCOMPLETE"){
                            // Use a stored response if one exists
                            var storage = Action.prototype.getStorage();
                            if (storage) {
                                var key = action.getStorageKey();
                                storage.get(key, function(actionResponse) {
                                    if (actionResponse) {
                                        storage.log("AuraClientService.loadComponent(): bootstrap request was INCOMPLETE using stored action response.", [action, actionResponse]);
                                        action.updateFromResponse(actionResponse);
                                        action.finishAction($A.getContext());
                                    } else {
                                        $A.error("Unable to load application.");
                                    }
                                });
                            }
                        } else {
                            //
                            // This can be either error or aborted, and we really should only
                            // see error.
                            //
                            var errors = a.getError();

                            if (errors && errors[0] && errors[0].message) {
                                $A.error(a.getError()[0].message);
                            } else {
                                $A.error("Unable to load component, action state = "+state);
                            }
                        }

                        $A.Perf.endMark("Sending XHR " + $A.getContext().getNum());
                    });

                    clientService.enqueueAction(action);

                    //
                    // Now make sure we load labels....
                    //
                    var labelAction = $A.get("c.aura://ComponentController.loadLabels");
                    // no parameters, no callback.
                    labelAction.setCallback(that, function(a) {});
                    clientService.enqueueAction(labelAction);
                }, "loadComponent");
            });
        },

        /**
         * Check to see if we are inside the aura processing 'loop'.
         *
         * @private
         */
        inAuraLoop : function() {
            return priv.auraStack.length > 0;
        },

        /**
         * Check to see if a public pop should be allowed.
         *
         * We allow a public pop if the name was pushed, or if there is nothing
         * on the stack.
         *
         * @param {string} name the name of the public 'pop' that will happen.
         * @return {Boolean} true if the pop should be allowed.
         */
        checkPublicPop : function(name) {
            if (priv.auraStack.length > 0) {
                return priv.auraStack[priv.auraStack.length-1] === name;
            }
            //
            // Allow public pop calls on an empty stack for now.
            //
            return true;
        },

        /**
         * Push a new name on the stack.
         *
         * @param {string} name the name of the item to push.
         * @private
         */
        pushStack : function(name) {
            priv.auraStack.push(name);
        },

        /**
         * Pop an item off the stack.
         *
         * The name of the item must match the previously pushed. If this is the last
         * item on the stack we do post processing, which involves sending actions to
         * the server.
         *
         * @param name the name of the last item pushed.
         * @private
         */
        popStack : function(name) {
            var count = 0;
            var lastName;
            var done;

            if (priv.auraStack.length > 0) {
                lastName = priv.auraStack.pop();
                if (lastName !== name) {
                    $A.error("Broken stack: popped "+lastName+" expected "+name+", stack = "+priv.auraStack);
                }
            } else {
                $A.warning("Pop from empty stack");
            }

            if (priv.auraStack.length === 0) {
                var tmppush = "$A.clientServices.popStack";
                priv.auraStack.push(tmppush);
                clientService.processActions();
                done = !$A["finishedInit"];
                while (!done && count <= 15) {
                    $A.renderingService.rerenderDirty(name);

                    done = !clientService.processActions();

                    count += 1;
                    if (count > 14) {
                        $A.error("popStack has not completed after 15 loops");
                    }
                }

                // Force our stack to nothing.
                lastName = priv.auraStack.pop();
                if (lastName !== tmppush) {
                    $A.error("Broken stack: popped "+tmppush+" expected "+lastName+", stack = "+priv.auraStack);
                }

                priv.auraStack = [];
                priv.actionQueue.incrementNextTransactionId();
            }
        },


        /**
         * Perform a hard refresh.
         *
         * @memberOf AuraClientService
         * @private
         */
        hardRefresh : function() {
            return priv.hardRefresh();
        },

        /**
         * Marks the application as outdated.
         *
         * @memberOf AuraClientService
         * @private
         */
        setOutdated : function() {
            return priv.setOutdated();
        },

        /**
         * A utility to handle events passed back from the server.
         */
        parseAndFireEvent : function(evtObj) {
            var descriptor = evtObj["descriptor"];

            if (evtObj["eventDef"]) {
                // register the event with the EventDefRegistry
                eventService.getEventDef(evtObj["eventDef"]);
            }

            if (eventService.hasHandlers(descriptor)) {
                var evt = $A.getEvt(descriptor);
                if (evtObj["attributes"]) {
                    evt.setParams(evtObj["attributes"]["values"]);
                }

                evt.fire();
            }
        },

        /**
         * For bootstrapping only
         *
         * @private
         */
        fireLoadEvent : function(eventName) {
            return priv.fireLoadEvent(eventName);
        },

        /**
         * Reset the token.
         *
         * @param {Object}
         *            newToken Refresh the current token with a new one.
         * @memberOf AuraClientService
         * @private
         */
        resetToken : function(newToken) {
            priv.token = newToken;
        },


        /**
         * Create an action group with a callback.
         *
         * The callback will be called when all actions are complete within the group.
         *
         * @param actions
         *      {Array.<Action>} the array of actions.
         * @param scope
         *      {Object} the scope for the function.
         * @param callback
         *      {function} The callback function
         */
        makeActionGroup : function(actions, scope, callback) {
            var group = undefined;
            $A.assert($A.util.isArray(actions), "makeActionGroup expects a list of actions, but instead got: " + actions);
            if (callback !== undefined) {
                $A.assert($A.util.isFunction(callback),
                        "makeActionGroup expects the callback to be a function, but instead got: " + callback);
                group = new ActionCallbackGroup(actions, scope, callback);
            }
            return group;
        },

        /**
         * Run the actions.
         *
         * This function effectively attempts to submit all pending actions immediately (if
         * there is room in the outgoing request queue). If there is no way to immediately queue
         * the actions, they are submitted via the normal mechanism. Note that this does not change
         * the 'transaction' associated with the current aura stack, so abortable actions might go
         * out in two separate requests without cancelling each other.
         *
         * @param {Array.<Action>}
         *            actions an array of Action objects
         * @param {Object}
         *            scope The scope in which the function is executed
         * @param {function}
         *            callback The callback function to run
         * @memberOf AuraClientService
         * @public
         */
        runActions : function(actions, scope, callback) {
            var i;

            clientService.makeActionGroup(actions, scope, callback);
            for (i = 0; i < actions.length; i++) {
                priv.actionQueue.enqueue(actions[i]);
            }
            clientService.processActions();
        },

        /**
         * Inject a component and set up its event handlers. For Integration
         * Service.
         *
         * FIXME: this should be private.
         *
         * @param {Object} rawConfig the config for the component to be injected
         * @param {String} locatorDomId the DOM id where we should place our element.
         * @param {String} localId the local id for the component to be created.
         * @memberOf AuraClientService
         * @public
         */
        injectComponent : function(rawConfig, locatorDomId, localId) {
            var config = $A.util.json.resolveRefs(rawConfig);

            // Save off any context global stuff like new labels
            $A.getContext().merge(config["context"]);

            var actionResult = config["actions"][0];
            var action = $A.get("c.aura://ComponentController.getComponent");
            var self = this;

            action.setCallback(action, function(a) {
                var element = $A.util.getElement(locatorDomId);

                // Check for bogus locatorDomId
                var errors;
                if (!element) {
                    // We have no other place to display this
                    // critical failure - fallback to the
                    // document.body
                    element = document.body;
                    errors = [
                        "Invalid locatorDomId specified - no element found in the DOM with id=" + locatorDomId
                    ];
                } else {
                    errors = a.getState() === "SUCCESS" ? undefined : action.getError();
                }

                var componentConfig;
                if (!errors) {
                    componentConfig = a.getReturnValue();
                } else {
                    //
                    // Make sure we clear any configs associated with the action.
                    //
                    $A.getContext().clearComponentConfigs(a.getId());
                    //
                    // Display the errors in a ui:message instead
                    //
                    componentConfig = self.createIntegrationErrorConfig(errors);
                }

                componentConfig["localId"] = localId;

                var root = $A.getRoot();
                var c = $A.componentService.newComponentDeprecated(componentConfig, root);

                if (!errors) {
                    // Wire up event handlers
                    self.addComponentHandlers(c, config["actionEventHandlers"]);
                }

                var body = root.get("v.body");
                body.push(c);
                // Do not let Aura consider this initial setting into the surrogate app as a candiadate for rerendering
                root.set("v.body",body,true);

                $A.render(c, element);

                $A.afterRender(c);
            });

            action.updateFromResponse(actionResult);
            action.finishAction($A.getContext());
        },

        /**
         * Create error component config to display integration service errors
         *
         * @param {(String|String[])} errorText
         * @returns {Object} error config for ui:message
         */
        createIntegrationErrorConfig: function(errorText) {
            return {
                        "componentDef" : {
                            "descriptor" : "markup://ui:message"
                        },

                        "attributes" : {
                            "values" : {
                                "title" : "Aura Integration Service Error",
                                "severity" : "error",
                                "body" : [
                                    {
                                        "componentDef" : {
                                            "descriptor" : "markup://ui:outputText"
                                        },

                                        "attributes" : {
                                            "values" : {
                                        "value" : $A.util.json.encode(errorText)
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    };
        },

        /**
         * Used within async callback for AIS.
         *
         * @param {Component} component - component
         * @param {String} locatorDomId - element id
         * @param {Object} [actionEventHandlers] - event handlers
         */
        renderInjection: function(component, locatorDomId, actionEventHandlers) {
            var error = null,
                hostEl = document.getElementById(locatorDomId);

            if (!hostEl) {
                error = "Invalid locatorDomId specified - no element found in the DOM with id=" + locatorDomId;
                hostEl = document.body;
                }

            if (component.isInstanceOf("aura:text")) {
                // check for component creation error
                error = component.get("v.value");
            }

            if (error) {
                // create same messaging as injectComponent
                var errorConfig = this.createIntegrationErrorConfig(error);
                errorConfig["localId"] = component.getLocalId();
                component = $A.componentService.newComponentDeprecated(errorConfig, $A.getRoot());
            }

            this.addComponentHandlers(component, actionEventHandlers);
            $A.render(component, hostEl);
            $A.afterRender(component);
        },

        /**
         * Use async created component for integration service
         *
         * @param {Object} config - component def config
         * @param {String} locatorDomId - id of element to inject component
         * @param {Object} [eventHandlers] - handlers of registered event
         */
        injectComponentAsync: function(config, locatorDomId, eventHandlers) {
            $A.componentService.newComponentAsync(undefined, function(component) {
                $A.clientService.renderInjection(component, locatorDomId, eventHandlers);
            }, config, $A.getRoot(), false, false, true);
            //
            // Now we go ahead and stick a label load on the request.
            //
            var labelAction = $A.get("c.aura://ComponentController.loadLabels");
            labelAction.setCallback(this, function(a) {});
            clientService.enqueueAction(labelAction);
        },

        /**
         * Add handlers of registered events for AIS
         *
         * @param {Component} component - component
         * @param {Object} [actionEventHandlers] - handlers of registered events
         */
        addComponentHandlers: function(component, actionEventHandlers) {
            if (actionEventHandlers) {
                var containerValueProvider = {
                    get : function(functionName) {
                        return {
                    run : function(evt) {
                        window[functionName](evt);
                            },
                    runDeprecated : function(evt) {
                        window[functionName](evt);
                        }
                    };
                }
            };

            for (var evt in actionEventHandlers) {
                component.addHandler(evt, containerValueProvider, actionEventHandlers[evt]);
                }
            }
        },

        /**
         * Return whether Aura believes it is online.
         * Immediate and future communication with the server may fail.
         * @memberOf AuraClientService
         * @return {Boolean} Returns true if Aura believes it is online; false otherwise.
         * @public
         */
        isConnected : function() {
            return !priv.isDisconnected;
        },

        /**
         * Inform Aura that the environment is either online or offline.
         *
         * @param {Boolean} isConnected Set to true to run Aura in online mode,
         * or false to run Aura in offline mode.
         * @memberOf AuraClientService
         * @public
         */
        setConnected: function(isConnected) {
        	priv.setConnected(isConnected);
        },

        /**
         * Queue an action for execution after the current event loop has ended.
         *
         * This function must be called from within an event loop.
         *
         * @param {Action} action the action to enqueue
         * @param {Boolean} background Set to true to run the action in the background, otherwise the value of action.isBackground() is used.
         * @memberOf AuraClientService
         * @public
         */
        // TODO: remove boolean trap http://ariya.ofilabs.com/2011/08/hall-of-api-shame-boolean-trap.html
        enqueueAction : function(action, background) {
            $A.assert(!$A.util.isUndefinedOrNull(action), "EnqueueAction() cannot be called on an undefined or null action.");
            $A.assert(!$A.util.isUndefined(action.auraType)&& action.auraType==="Action", "Cannot call EnqueueAction() with a non Action parameter.");

            if (background) {
                action.setBackground();
            }

            priv.actionQueue.enqueue(action);
        },

        /**
         * Defer the action by returning a Promise object.
         * Configure your action excluding the callback prior to deferring.
         * The Promise is a thenable, meaning it exposes a 'then' function for consumers to chain updates.
         *
         * @public
         * @param {Action} action - target action
         * @return {Promise} a promise which is resolved or rejected depending on the state of the action
         */
        deferAction : function (action) {
            var that = this;
            var promise = new Promise(function(success, error) {

                action.wrapCallback(that, function (a) {
                    if (a.getState() === 'SUCCESS') {
                        success(a.getReturnValue());
                    }
                    else {
                        // Reject the promise as it was not successful.
                        // Give the user a somewhat useful object to use on reject.
                        error({ state: a.getState(), action: a });
                    }
                });

                that.enqueueAction(action);
            });

            return promise;
        },

        /**
         * Gets whether or not the Aura "actions" cache exists.
         * @returns {Boolean} true if the Aura "actions" cache exists.
         */
        hasActionStorage: function() {
            return !!Action.getStorage();
        },

        /**
         * Checks to see if an action is currently being stored (by action descriptor and parameters).
         *
         * @param {String} descriptor - action descriptor.
         * @param {Object} params - map of keys to parameter values.
         * @param {Function} callback - called asynchronously after the action was looked up in the cache. Fired with a
         * single parameter, isInStorge {Boolean} - representing whether the action was found in the cache.
         */
        isActionInStorage : function(descriptor, params, callback) {
            var storage = Action.getStorage();
            callback = callback || NOOP;

            if (!$A.util.isString(descriptor) || !$A.util.isObject(params) || !storage) {
                callback(false);
                return;
            }

            storage.get(Action.getStorageKey(descriptor, params))
                .then(function(response) {
                    $A.run(function() {
                        callback(!!response && !!response.value && !response.isExpired);
                    });
            });
        },

        /**
         * Resets the cache cleanup timer for an action.
         *
         * @param {String} descriptor - action descriptor.
         * @param {Object} params - map of keys to parameter values.
         * @param {Function} callback - called asynchronously after the action was revalidated. Called with a single
         * parameter, wasRevalidated {Boolean} - representing whether the action was found in the cache and
         * successfully revalidated.
         */
        revalidateAction : function(descriptor, params, callback) {
            var storage = Action.getStorage();
            callback = callback || NOOP;

            if (!$A.util.isString(descriptor) || !$A.util.isObject(params) || !storage) {
                callback(false);
                return;
            }

            var actionKey = Action.getStorageKey(descriptor, params);
            storage.get(actionKey).then(function(response) {
                if (!!response && !!response.value) {
                    storage.put(actionKey, response.value)
                        .then(function() { callback(true); });
                } else {
                    callback(false);
                }
            });
        },

        /**
         * Clears an action out of the action cache.
         *
         * @param descriptor {String} action descriptor.
         * @param params {Object} map of keys to parameter values.
         * @param successCallback {Function} called after the action was invalidated. Called with true if the action was
         * successfully invalidated and false if the action was invalid or was not found in the cache.
         * @param errorCallback {Function} called if an error occured during execution
         */
        invalidateAction : function(descriptor, params, successCallback, errorCallback) {
            var storage = Action.getStorage();
            successCallback = successCallback || NOOP;
            errorCallback = errorCallback || NOOP;

            if (!$A.util.isString(descriptor) || !$A.util.isObject(params) || !storage) {
                successCallback(false);
                return;
            }

            storage.remove(Action.getStorageKey(descriptor, params))
                .then(function() { successCallback(true); }, errorCallback );
        },

        /**
         * process the current set of actions, looping if needed.
         *
         * This runs the current action set.
         *
         * @private
         */
        processActions : function() {
            var actions;
            var processedActions = false;
            var action;

            actions = priv.actionQueue.getClientActions();
            if(actions.length > 0) {
                priv.runClientActions(actions);
                processedActions = true;
            }

            //
            // Only send forground actions if we have something that
            // needs to be sent (force boxcar will delay this)
            // FIXME: we need measures of how long this delays things.
            //
            if (priv.actionQueue.needXHR() && priv.foreground.start()) {
                actions = priv.actionQueue.getServerActions();
                if (actions.length > 0) {
                    priv.request(actions, priv.foreground);
                    processedActions = true;
                } else {
                    priv.foreground.cancel();
                }
            }

            if (priv.background.start()) {
                action = priv.actionQueue.getNextBackgroundAction();
                if (action !== null) {
                    priv.request([action], priv.background);
                    processedActions = true;
                } else {
                    priv.background.cancel();
                }
            }
            return processedActions;
        }

        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        ,
        "priv" : priv
    //#end
    };

    // #include aura.AuraClientService_export

    return clientService;
};
