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
	getStorage: function(cmp) {
		return $A.storageService.getStorage(cmp.get("v.storageName"));
	},
	
	isEnabled: function(cmp) {
	    var mode = $A.getContext().getMode();
	    return !$A.util.isUndefinedOrNull(this.getStorage(cmp)) && (mode !== "PROD");
	},
	
	update: function(cmp){
    	if (this.isEnabled(cmp)) {
    		var storage = this.getStorage(cmp);
	    	var size = storage.getSize();
	    	var maxSize = storage.getMaxSize();
	    	
	    	var severity;
	    	if (size < maxSize / 2) {
	    		severity = "success";
	    	} else if (size < maxSize) {
	    		severity = "warning";
	    	} else {
	    		severity = "important";
	    	}
	    	
	    	var stamp = cmp.find("stamp");
	    	stamp.getValue("v.severity").setValue(severity);
	    	
	    	cmp.getValue("v.value").setValue(Math.round(size * 100) / 100);
    	}
    }
})