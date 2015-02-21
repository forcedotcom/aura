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
		var tag = component.get("v.tag");
		if ($A.util.isUndefinedOrNull(tag)) {
			$A.error("Undefined tag attribute for " + component.getGlobalId());
		}

        var element;
		var HTMLAttributes = component.get("v.HTMLAttributes");

		// FIXME: LEGACY IE SUPPORT
		// Fix for name being read only attribute on IE7
		if ($A.get("$Browser.isIE7") && tag == "input") {
            var value = HTMLAttributes["name"];
			if ($A.util.isEmpty(value)) {
				element = document.createElement(tag);
			} else {
				element = document.createElement('<input name="' + value + '">');
			}
		} else {
			element = document.createElement(tag);
		}

		for ( var attribute in HTMLAttributes) {
			helper.createHtmlAttribute(component, element, attribute, HTMLAttributes[attribute]);
		}

		if (element.tagName === "A" && !element.getAttribute("href")) {
            element.setAttribute("href", "javascript:void(0);");
		}

		if (helper.canHaveBody(component)) {
            var body=component.get("v.body");
            $A.renderingService.renderFacet(component,body,element);
			//$A.render(component.get("v.body"), element);
		}

		return element;
	},

	rerender : function(component, helper) {
		var element = component.getElement(),
			htmlAttr = "v.HTMLAttributes";

		if (!element) {
			return;
		}
		
		var skipMap = {
			"height" : true,
			"width" : true,
			"class" : true
		};

		var HTMLAttributes = component.get(htmlAttr);
		if (HTMLAttributes) {
			for (var name in HTMLAttributes) {
				var lowerName = name.toLowerCase();
				if (skipMap[lowerName] || lowerName.indexOf("on") == 0) {
					continue;
				}
				
				var value = HTMLAttributes[name];
				if ($A.util.isExpression(value)) {
					value = value.evaluate();
				}
				
				if (helper.SPECIAL_BOOLEANS.hasOwnProperty(lowerName)) {
					value = $A.util.getBooleanValue(value);
				}
	
				var oldValue = element[helper.caseAttribute(lowerName)];
				if (value !== oldValue) {
					helper.createHtmlAttribute(component, element, lowerName, value);
				    if($A.util.isExpression(oldValue)){
                        oldValue.removeChangeHandler(component,"HTMLAttributes."+name);
                    }
                }
			}
	
			var className = HTMLAttributes["class"];
			if ($A.util.isExpression(className)) {
                 className = className.evaluate();
             }

            if($A.util.isUndefinedOrNull(className)){
 				className='';
            }
			
			if (!$A.util.isUndefinedOrNull(element.auraClass)) {
				className += (" " + element.auraClass);
			}
			
			if (element["className"] !== className) {
				element["className"] = className;
			}
		}
		
		if (element.tagName ==="A" && !element.getAttribute("href")) {
			element.setAttribute("href", "javascript:void(0);");
		}

		if (helper.canHaveBody(component)) {
            $A.renderingService.rerenderFacet(component,component.get("v.body"),element);
		}
	},

	afterRender : function(component, helper) {
		if (helper.canHaveBody(component)) {
			$A.afterRender(component.get("v.body"));
		}
	},

	unrender : function(component, helper) {
		// Even if we don't have body we need to deattach the elements from the component itself
		$A.renderingService.unrenderFacet(component, component.get("v.body"));
	}
})
