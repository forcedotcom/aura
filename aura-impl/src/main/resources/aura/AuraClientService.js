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
/*jslint sub: true */
/**
 * @namespace The Aura Client Service, accessible using $A.services.client. Communicates with the Aura Server.
 * @constructor
 */
var AuraClientService = function(){
    // #include aura.AuraClientService_private

    var clientService = {

    	/** @private */
        initHost : function(host){
            priv.host = host || "";
            // #if {"modes" : ["PRODUCTION"]}
            delete this.initHost;
            // #end
        },

    	/** @private */
        init: function(config, token, callback, container){
            $A.mark("ClientService.init");
            var body = document.body;
            // #if {"modes" : ["PRODUCTION"]}
            try {
            // #end
                priv.token = token;

                // Why is this happening in the ClientService? --JT
                var component = componentService.newComponent(config, null, false, true);

                $A.measure("Initial Component Created", "ClientService.init", $A.logLevel["DEBUG"]);

                renderingService.render(component, container || body);
                renderingService.afterRender(component);

                $A.measure("Initial Component Rendered", "ClientService.init", $A.logLevel["DEBUG"]);
                callback(component);

            // not on in dev modes to preserve stacktrace in debug tools
            // #if {"modes" : ["PRODUCTION"]}
            }catch(e){
                $A.error(e);
                throw e;
            }
            // #end
            delete this.init;
        },

    	/** @private */
        initDefs: function(config){
             $A.mark("ClientService.initDefs");
             var evtConfigs = aura.util.json.resolveRefs(config["eventDefs"]);
             for(var j=0;j<evtConfigs.length;j++){
                 eventService.getEventDef(evtConfigs[j]);
             }
             $A.measure("Registered Events ["+evtConfigs.length+ "]", "ClientService.initDefs");

             var controllerConfigs = aura.util.json.resolveRefs(config["controllerDefs"]);
             for(j=0;j<controllerConfigs.length;j++){
                 componentService.getControllerDef(controllerConfigs[j]);
             }
             $A.measure("Registered Controllers ["+controllerConfigs.length+ "]", "ClientService.initDefs");


             var comConfigs = aura.util.json.resolveRefs(config["componentDefs"]);
             for(var i=0;i<comConfigs.length;i++){
                 componentService.getDef(comConfigs[i]);
             }
             $A.measure("Registered Components ["+comConfigs.length+ "]", "ClientService.initDefs");

             delete this.initDefs;
             $A.measure("Initial Scripts Finished", "PageStart");
        },

        /**
         * Load an app by calling loadComponent.
         * @param {DefDescriptor} descriptor
         * 				The key for a definition with a qualified name of the format prefix://namespace:name.
         * @param {Map} attributes
         * 				The configuration data to use in the app
         * @param {function} callback
         * 				The callback function to run
         * @memberOf AuraClientService
         * @private
         */
        loadApplication : function(descriptor, attributes, callback){
            this.loadComponent(descriptor, attributes, callback, "APPLICATION");
        },

        /**
         * Throw an exception.
         * @param {Object} config
         * 				The data for the exception event
         * @memberOf AuraClientService
         * @private
         */
        throwExceptionEvent : function(config){
            priv.thowExceptionEvent(config);
        },

        /**
         * Load a component.
         * @param {DefDescriptor} descriptor
         * 				The key for a definition with a qualified name of the format prefix://namespace:name
         * @param {Map} attributes
         * 				The configuration data to use. If specified, attributes are used as a key value pair.
         * @param {function} callback
         * 				The callback function to run
         * @param {String} defType
         *				Sets the defType to "COMPONENT"
         * @memberOf AuraClientService
         * @private
         */
        loadComponent : function(descriptor, attributes, callback, defType){
            var url = priv.host+"/aura";
            var desc = new DefDescriptor(descriptor);
            var tag = desc.getNamespace() + ":" + desc.getName();
            if(!defType){
                defType = "COMPONENT";
            }

            var num = aura.getContext().incrementNum();
            params = {
                'aura.tag' : tag,
                'aura.context' : $A.getContext().encodeForServer(false),
                'aura.deftype' : defType,
                'aura.num' : num
            };

            if (attributes){
                for (var key in attributes) {
                    var value = attributes[key];
                    params[key] = $A.util.isObject(value) ? $A.util.json.encode(value) : value;
                }
            }

            function doCallback(stuff) {
                // check if def already loaded if not: try later...
                if(!$A.clientService.initDefs){
                    var errors = [];
                    var ctx = stuff["context"];
                    $A.getContext().join(ctx);
                    priv.flushLoadEventQueue();
                    callback(stuff);
                    priv.fireDoneWaiting();
                    $A.measure("Completed Component Callback", "Sending XHR " + num);
                }
                else{
                    setTimeout(function(){doCallback(stuff);},30);
                }
            }

            function processResponse(response) {
                var stuff = priv.checkAndDecodeResponse(response);

                if (!stuff) { return; }

                doCallback(stuff);
            }

            priv.fireLoadEvent("e.aura:waiting");
            $A.util.transport.request({
                "url": priv.host+'/aura',
                "method": 'GET',
                "callback": processResponse,
                "params" : params
            });
        },

        /**
         * Perform a hard refresh.
         * @memberOf AuraClientService
         * @private
         */
        hardRefresh : function(){
            return priv.hardRefresh();
        },

        /**
         * Marks the application as outdated.
         * @memberOf AuraClientService
         * @private
         */
        setOutdated : function(){
            return priv.setOutdated();
        },

        /**
         * For bootstrapping only
         * @private
         */
        fireLoadEvent : function(eventName){
            return priv.fireLoadEvent(eventName);
        },

        /**
         * Reset the token.
         * @param {Object} newToken
         * 				Refresh the current token with a new one.
         * @memberOf AuraClientService
         * @private
         */
        resetToken : function(newToken){
            priv.token = newToken;
        },

        /**
         * Run the actions.
         * @param {Object} actions
         * @param {function} scope
         * 				The scope in which the function is executed
         * @param {function} callback
         * 				The callback function to run
         * @memberOf AuraClientService
         * @private
         */
        runActions : function(actions, scope, callback){
            priv.request(actions, scope, callback);
        },

        /**
         * Inject a component and set up its event handlers. For Integration Service.
         * @param {Component} parent
         * @param {Object} rawConfig
         * @param {String} placeholderId
         * @param {String} localId
         * @memberOf AuraClientService
         * @private
         */
        injectComponent: function(rawConfig, locatorDomId, localId) {
    		var config = $A.util.json.resolveRefs(rawConfig);
    		
    		// Save off any context global stuff like new labels
    		$A.getContext().join(config["context"]);
    		
    		var actionResult = config["actions"][0];
            var action = $A.get("c.aura://ComponentController.getComponent");
            
            action.setCallback(action, function(a) {
                var element = $A.util.getElement(locatorDomId);
                
	        	// Check for bogus locatorDomId
                var errors;
                if (!element) {
                	// We have no other place to display this critical failure - fallback to the document.body
                	element = document.body;
                	errors = ["Invalid locatorDomId specified - no element found in the DOM with id=" + locatorDomId];
                } else {
                	errors = a.getState() === "SUCCESS" ? undefined : action.getError();
                }
                
            	var componentConfig;
		        if (!errors) {
		        	componentConfig = a.getReturnValue();
		        } else {
		        	// Display the errors in a ui:message instead
		        	componentConfig = {
						"componentDef" : {
							"descriptor" : "markup://ui:message"
						},

						"attributes" : {
							"values" : {
								"title" : "Aura Integration Service Error",
								"severity" : "error",
								"body" : [{
									"componentDef" : {
										"descriptor" : "markup://ui:outputText"
									},

									"attributes" : {
										"values" : {
											"value" : $A.util.json.encode(errors)
										}
									}
								}]
							}
						}
					};
		        }
		        
            	componentConfig["localId"] = localId;
            	
            	var root = $A.getRoot();
                var c = $A.componentService.newComponent(componentConfig, root);

                if (!errors) {
	                // Wire up event handlers
	                var actionEventHandlers = config["actionEventHandlers"];
	                if (actionEventHandlers) {
		                var containerValueProvider = { 
		            		getValue: function(functionName) { 
		            			return { 
		            				run: function(event) { window[functionName](event); } 
		            			};
		        			}
		                };
		                
		                for (var event in actionEventHandlers) {
		                	c.addHandler(event, containerValueProvider, actionEventHandlers[event]);
		                }
	                }
                }
                
                root.getValue("v.body").push(c);
                
                $A.render(c, element);

                $A.afterRender(c);
            });
            
    		action.complete(actionResult);        	
        }

        // #if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        ,"priv" : priv
        // #end
    };


    // #include aura.AuraClientService_export

    return clientService;
};
