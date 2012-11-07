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
({
	init : function(cmp) {
		if ($A.storageService.getStorage()) {
			return;
		}

		var debugLoggingEnabled = cmp.getValue("v.debugLoggingEnabled")
				.getBooleanValue();

		// Temporary query param support to allow one extra level of switch so I
		// can turn on storage
		// w/out enabling it for the world right now
		var onlyUseStorageIfRequested = cmp.getValue(
				"v.requireUseStorageQueryParam").getBooleanValue();
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

		var implementation = cmp.get("v.implementation");
		var defaultExpiration = parseInt(cmp.get("v.defaultExpiration"));
		var defaultAutoRefreshInterval = parseInt(cmp.get("v.defaultAutoRefreshInterval"));
		var maxSize = cmp.get("v.maxSize") * 1024.0;
		var clearStorageOnInit = cmp.getValue("v.clearStorageOnInit").getBooleanValue();

		$A.storageService.setStorage(implementation, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled, clearStorageOnInit);
	}
})