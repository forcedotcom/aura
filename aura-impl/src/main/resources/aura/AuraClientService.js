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
 * @namespace The Aura Client Service.  Communicates with the Aura Server.
 * @constructor
 */
var AuraClientService = function(){
    //#include aura.AuraClientService_private

    var clientService = {

        initHost : function(host){
            priv.host = host || "";
            //#if {"modes" : ["PRODUCTION"]}
            delete this.initHost;
            //#end
        },

        init: function(config, token, callback, container){
            $A.mark("ClientService.init");
            var body = document.body;
            //#if {"modes" : ["PRODUCTION"]}
            try {
            //#end
                priv.token = token;

                // Why is this happening in the ClientService? --JT
                var component = componentService.newComponent(config, null, false, true);

                $A.measure("Initial Component Created", "ClientService.init", $A.logLevel["DEBUG"]);

                renderingService.render(component, container || body);
                renderingService.afterRender(component);

                $A.measure("Initial Component Rendered", "ClientService.init", $A.logLevel["DEBUG"]);
                callback(component);

            //not on in dev modes to preserve stacktrace in debug tools
            //#if {"modes" : ["PRODUCTION"]}
            }catch(e){
                $A.error(e);
                throw e;
            }
            //#end
            delete this.init;
        },

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

        loadApplication : function(descriptor, attributes, callback){
            this.loadComponent(descriptor, attributes, callback, "APPLICATION");
        },

        throwExceptionEvent : function(config){
            priv.thowExceptionEvent(config);
        },

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

        hardRefresh : function(){
            return priv.hardRefresh();
        },

        setOutdated : function(){
            return priv.setOutdated();
        },

        fireLoadEvent : function(eventName){
            return priv.fireLoadEvent(eventName);
        },

        resetToken : function(newToken){
            priv.token = newToken;
        },

        runActions : function(actions, scope, callback){
            priv.request(actions, scope, callback);
        },
        
        getStorage : function() {
        	return priv.storage;
        },
        
        setStorage : function(implementation, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled) {
        	priv.storage = new AuraStorage(implementation, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled);
        }

        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        ,"priv" : priv
        //#end
    };


    //#include aura.AuraClientService_export

    return clientService;
};
