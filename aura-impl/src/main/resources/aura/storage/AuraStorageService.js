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
 * @namespace The Aura Storage Service, accessible using $A.storageService. 
 * @constructor
 */
var AuraStorageService = function(){
	var storages = {};
	var adapters = {};
	
    var storageService = {
   /**
    * Returns an existing storage using the specified name. For example, <code>$A.storageService.getStorage("MyStorage").getSize()</code> returns the cache size.
    * <p>See Also: <a href="#reference?topic=api:AuraStorage">AuraStorage</a></p>
	* @param {String} name The name of the requested storage. 
	* @memberOf AuraStorageService
	* @returns {AuraStorage} Returns an AuraStorage object corresponding to an existing storage.
	*/
        getStorage : function(name) {
        	return storages[name];
        },
        
        /**
         * Initializes and returns new storage.
         * <p>See Also: <a href="#help?topic=auraStorageService">Aura Storage Service</a></p>
         * @param {String} name Required. The unique name of the storage to be initialized.
         * @param {Boolean} persistent Set to true if the requested storage is persistent.
         * @param {Boolean} secure Set to true if the requested storage is secure.
         * @param {number} maxSize Specifies the maximum storage size in KB.
         * @param {number} defaultExpiration Specifies the default time in seconds after which the cache expires. When an item is requested that has gone past the default cache expiration time, it will not be used.
         * @param {number} defaultAutoRefreshInterval Specifies the default interval in seconds after which cached data is to be refreshed.
         * @param {Boolean} debugLoggingEnabled Set to true to enable debug logging in the JavaScript console for the Aura Storage Service.
         * @param {Boolean} clearStorageOnInit Set to true to clear storage when storage is initialized.
         * @memberOf AuraStorageService
         * @returns {AuraStorage} Returns an AuraStorage object for the new storage.
         */
        initStorage : function(name, persistent, secure, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled, clearStorageOnInit) {
        	if (storages[name]) {
        		$A.error("Storage named '" + name + "' already exists!");
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
        		$A.error("StorageService.registerAdapter() adapter '" + name + "' already registered!");
        	}
        	
        	adapters[name] = config;
        },

        getAdapterConfig : function(adapter) {
        	return adapters[adapter];
        },
        
        /**
         * Creates a storage adapter. Used mostly in non-production modes.
         * <p>Example:</p>
         * <code>$A.storageService.createAdapter("memory", "test", 4096, true);</code>
         * @param {String} adapter The new adapter to create 
         * @param {String} name The name of the adapter
         * @param {Integer} maxSize The maximum size to allocate to the storage adapter
         * @param {Boolean} debugLoggingEnabled Set to true to enable logging, or false otherwise.
         * @memberOf AuraStorageService
         */
        createAdapter : function(adapter, name, maxSize, debugLoggingEnabled) {
        	var config = adapters[adapter];
        	if (!config) {
        		$A.error("StorageService.createAdapter() unknown adapter '" + implementation + "'!");
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
        
        /**
         * Selects an adapter based on the given configuration. Used mostly in non-production modes.
         * <p>See Also: <a href="#help?topic=auraStorageService">Aura Storage Service</a></p>
         * @param {Boolean} persistent Set to true if the adapter should be persistent, or false otherwise.
         * @param {Boolean} secure Set to true if the adapter should be secure, or false otherwise.
         * @memberOf AuraStorageService
         */
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
        		$A.error("StorageService.selectAdapter() unable to find a secure adapter implementation!");
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
