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
	var storages = {};
	var adapters = {};
	
    var storageService = {
        getStorage : function(name) {
        	return storages[name];
        },
        
        initStorage : function(name, persistent, secure, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled, clearStorageOnInit) {
        	if (storages[name]) {
        		throw new Error("Storage named '" + name + "' already exists!");
        	}
        	
        	var adapter = this.createAdapter(this.selectAdapter(persistent, secure), name, maxSize, debugLoggingEnabled);
        	
        	var config = {
        		"name": name,
        		"adapter": adapter,
        		"maxSize": maxSize, 
        		"defaultExpiration": defaultExpiration, 
        		"defaultAutoRefreshInterval": defaultAutoRefreshInterval, 
        		"debugLoggingEnabled": debugLoggingEnabled, 
        		"clearStorageOnInit": clearStorageOnInit
        	};
        	
        	var storage = new AuraStorage(config);
        	storages[name] = storage;
        	
        	return storage;
        },
        
        registerAdapter : function(config) {
        	var name = config["name"];
        	var adapterClass = config["adapterClass"];
        	
        	if (adapters[name]) {
        		throw new Error("StorageService.registerAdapter() adapter '" + name + "' already registered!");
        	}
        	
        	adapters[name] = config;
        },
        
        createAdapter : function(adapter, name, maxSize, debugLoggingEnabled) {
        	var config = adapters[adapter];
        	if (!config) {
        		throw new Error("StorageService.createAdapter() unknown adapter '" + implementation + "'!");
        	}        
        	
        	var AdapterClass = config["adapterClass"];
        	
        	var adapterConfig = {
        		"name": name,
        		"maxSize": maxSize,
        		"debugLoggingEnabled": debugLoggingEnabled
        	};        	
        	
        	return new AdapterClass(adapterConfig);
        },
        
        fireModified : function() {
        	var e = $A.get("e.auraStorage:modified");
        	if (e) {
        		e.fire();
        	}
        },
        
        selectAdapter : function(persistent, secure) {
        	// Find the best match for the specific implementation based on the requested configuration 

        	var candidates = [];
        	for (var name in adapters) {
        		var adapter = adapters[name];
        		
            	// If secure is required then find all secure adapters otherwise use any adapter
        		if (!secure || adapter["secure"] === true) {
        			candidates.push(adapter);
        		}
        	}

        	if (candidates.length === 0) {
        		throw new Error("StorageService.selectAdapter() unable to find a secure adapter implementation!");
        	}
        	
        	// Now take the set of candidates and weed out any non-persistent if persistence is requested (not required)
        	var match;
        	for (var n = 0; !match && n < candidates.length; n++) {
        		adapter = candidates[n];
        		var adapterIsPersistent = adapter["persistent"];
        		if ((persistent && adapterIsPersistent === true) || (!persistent && !adapterIsPersistent)) {
        			match = adapter;
        		}
        	}
        	
        	if (!match) {
        		match = candidates[0];
        	}
        	
        	return match["name"];
        }
        
        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        ,"storages" : storages
        ,"adapters" : adapters
        //#end
    };

    //#include aura.storage.AuraStorageService_export

    return storageService;
};
