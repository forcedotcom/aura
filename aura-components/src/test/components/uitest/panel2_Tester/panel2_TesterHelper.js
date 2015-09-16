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
	createHeaderFooterInstance : function(cmp, forceCreate) {
		if (cmp.get("v.panelHeader").length == 0 || forceCreate) {
			var defaultCustomHeader = $A.newCmp({
	    		componentDef: "markup://ui:outputText",
	    		attributes: {
	    			values: {
	    				"class": "defaultCustomPanelHeader",
	    				value: "This is a default custom panel header"
	    			}
	    		}
			});
			cmp.set("v.panelHeader", defaultCustomHeader);
		}
		
		if (cmp.get("v.panelFooter").length == 0 || forceCreate) {
			var defaultCustomFooter = [$A.newCmp({
	    		componentDef: "markup://ui:outputText",
	    		attributes: {
	    			values: {
	    				"class": "defaultCustomPanelFooter",
	    				value: "This is a default custom panel footer"
	    			}
	    		}}), $A.newCmp({
    			componentDef: "markup://ui:button",
	    		attributes: {
	    			values: {
	    				"class": "defaultCustomPanelFooterBtn",
	    				label: "a button"
	    			}
	    	}})];
			cmp.set("v.panelFooter", defaultCustomFooter);
		}
	}
})