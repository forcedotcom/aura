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
({
	getStorage: function(cmp) {
		return $A.storageService.getStorage(cmp.get("v.name"));
	},

	init : function(cmp) {
		var debugLoggingEnabled = $A.util.getBooleanValue(cmp.get("v.debugLoggingEnabled"));

		// Temporary query param support to allow one extra level of switch so I
		// can turn on storage
		// w/out enabling it for the world right now
		var onlyUseStorageIfRequested = $A.util.getBooleanValue(cmp.get("v.requireUseStorageQueryParam"));
		if (onlyUseStorageIfRequested) {
			var useStorage = window.location.href.toLowerCase().indexOf(
					"aura.usestorage=true") > 0;
			if (!useStorage) {
				if (debugLoggingEnabled) {
					$A.log("Not enabling Aura Storage because the requireUseStorageQueryParam was specified and aura.useStorage=true was not present in the initial app url request");
				}

				return;
			}
		}

		var name = cmp.get("v.name");
		var defaultExpiration = parseInt(cmp.get("v.defaultExpiration"));
		var defaultAutoRefreshInterval = parseInt(cmp.get("v.defaultAutoRefreshInterval"));
		var maxSize = cmp.get("v.maxSize") * 1024.0;
		var clearStorageOnInit = $A.util.getBooleanValue(cmp.get("v.clearStorageOnInit"));
		var persistent = $A.util.getBooleanValue(cmp.get("v.persistent"));
		var secure = $A.util.getBooleanValue(cmp.get("v.secure"));

		$A.storageService.initStorage(name, persistent, secure, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled, clearStorageOnInit);
	}
})