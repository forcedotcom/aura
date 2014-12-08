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
	render : function(component, helper) {
		var value = component.get("v.value");
        if($A.util.isUndefinedOrNull(value)){
            value = "";
        }
        if(!($A.util.isComponent(value)||$A.util.isArray(value))){
            // JBUCH: HALO: TODO: MIGHT BE ABLE TO RETURN THIS TO SIMPLE TEXTNODE MANAGEMENT
            component._lastRenderedValue=value=$A.newCmp({componentDef:'aura:text', attributes:{values:{value:value}}});
        }
        return $A.renderingService.renderFacet(component,value);
	},

	rerender : function(component, helper) {
        var ret=[];
		if (component.isRendered()) {
            var value = component.get("v.value");
            if(!($A.util.isComponent(value)||$A.util.isArray(value))){
                if($A.util.isUndefinedOrNull(value)){
                    value = "";
                }
                if(component._lastRenderedValue && component._lastRenderedValue.isValid()){
                    // JBUCH: HALO: TODO: MIGHT BE ABLE TO RETURN THIS TO SIMPLE TEXTNODE MANAGEMENT
                    component._lastRenderedValue.set("v.value",value,true);
                    value=component._lastRenderedValue;
                    return $A.rerender(value);
                }else {
                    value = $A.newCmp({componentDef: 'aura:text', attributes: {values: {value: value}}});
                }
            }
            ret=$A.renderingService.rerenderFacet(component, value);
        }
        return ret;
    },

	unrender : function(component, helper) {
        $A.renderingService.unrenderFacet(component);
        if (component._lastRenderedValue) {
            component._lastRenderedValue.destroy();
            component._lastRenderedValue = null;
        }
	},

	afterRender : function(component, helper) {
		var value = component.get("v.value");
		if ($A.util.isComponent(value)||$A.util.isArray(value)) {
			$A.afterRender(value);
		}
	}
})
