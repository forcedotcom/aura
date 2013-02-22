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
 	init: function(component) {
 		this.initDataProvider(component);
 		this.initPagers(component);
 		
 		this.triggerDataProvider(component);
	},

	initDataProvider: function(component) {
		var dataProvider = component.getValue("v.dataProvider").unwrap();
		
		if (dataProvider && dataProvider.length && dataProvider.length > 0) {
			dataProvider = dataProvider[0];
			dataProvider.addHandler("onchange", component, "c.handleDataChange");
			component._dataProvider = dataProvider;
		}		
	},
	
	initPagers: function(component) {
		var facets = component.getFacets();
		var pagers = [];
		
		// walk each facet looking for instances of ui:pager
		for (var i=0, len=facets.length; i<len; i++) {
			var facet = facets[i];

			facet.each(function(facet) {
				if (facet.getDef().getDescriptor().getQualifiedName() != "markup://aura:unescapedHtml") {
		        	if (facet.isInstanceOf("ui:pager")) {
		        		pagers.push(facet);
		        	} else {
		        		pagers.concat(facet.find({instancesOf:"ui:pager"}));
		        	}
		        }	
			});
        }
		
		// wireup handlers and values
		var chainedAttrs = ["currentPage", "pageSize", "totalItems"];
		var j = pagers.length;
		while (j--) {
			var pager = pagers[j];
			pager.addHandler("onPageChange", component, "c.handlePageChange");
			
//			TODO: need to get this working so that the expressions are actually chained and all point back to the same underlying value
//				  (like they would be via markup)
//			var k = chainedAttrs.length;
//			while (k--) {
//				var exp = "v." + chainedAttrs[k];
//				pager.getValue(exp).setValue(component.getValue(exp));	
//			}
		}
		
		// cache the pagers
		component._pagers = pagers;
	},
	
	triggerDataProvider: function(component) {
		//==
		console.log("Triggering data provider:");
		console.log("  currentPage : " + component._dataProvider.get("v.currentPage"));
		//==
		component._dataProvider.get("e.provide").fire();
	},
	
	logPagers: function(component) {
		var pagers = component._pagers;
		if (!pagers) { return; }
		
		var i = pagers.length;
		
		var attrs = ["currentPage", "pageCount", "pageSize", "totalItems", "startIndex", "endIndex"];
		
		while (i--) {
			console.log(pagers[i].getDef().toString());
			
			j = attrs.length;
			while (j--) {
				console.log("  " + attrs[j] + " : " + pagers[i].get("v."+attrs[j]));	
			}
		}
	}
})