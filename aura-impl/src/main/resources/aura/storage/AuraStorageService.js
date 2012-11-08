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
 * @namespace The Aura Storage Service.
 * @constructor
 */
var AuraStorageService = function(){
	var storage = null;
	var adapters = {};
	
    var storageService = {
        getStorage : function() {
        	return storage;
        },
        
        setStorage : function(implementation, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled, clearStorageOnInit) {
        	storage = new AuraStorage(implementation, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled, clearStorageOnInit);
        },
        
        registerAdapter : function(adapterClass) {
        	var name = adapterClass.NAME;
        	if (adapters[name]) {
        		throw new Error("StorageService.registerAdapter() adapter '" + name + "' already registered!");
        	}
        	
        	adapters[name] = adapterClass;
        },
        
        createAdapter : function(name) {
        	var AdapterClass = adapters[name];
        	if (!AdapterClass) {
        		throw new Error("StorageService.getAdapter() unknown adapter '" + name + "'!");
        	}
        
        	return new AdapterClass();
        }
        
        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        ,"storage" : storage
        //#end
    };

    //#include aura.storage.AuraStorageService_export

    return storageService;
};
