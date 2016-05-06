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
    /**
     * 
     */
    testInputText: {
        browsers: ['DESKTOP', "IPHONE"],
        test: [function (cmp) {
            var tooltip = this.createTooltip(cmp);
            this.createInputComponentAndAddToBody(cmp, tooltip, "markup://ui:inputText", "Sample Input Text");

            var tooltip = $A.test.select(".uiTooltip")[0];
            $A.test.addWaitForWithFailureMessage(true, function() {
            	return $A.test.select(".uiTooltip").length > 0;
            }, "Tooltip component was not found. ", function(cmp) {
            	var tooltip = $A.test.select(".uiTooltip")[0];
            	$A.test.assertTrue(tooltip.parentNode.classList.contains("uiLabel"), "Tooltip was not found in label component.");
            })
        }]
    },
    
    testInputNumber: {
    	 browsers: ['DESKTOP', "IPHONE"],
         test: [function (cmp) {
             var tooltip = this.createTooltip(cmp);
             this.createInputComponentAndAddToBody(cmp, tooltip, "markup://ui:inputNumber", "Sample Input Number");

             var tooltip = $A.test.select(".uiTooltip")[0];
             $A.test.addWaitForWithFailureMessage(true, function() {
             	return $A.test.select(".uiTooltip").length > 0;
             }, "Tooltip component was not found. ", function(cmp) {
             	var tooltip = $A.test.select(".uiTooltip")[0];
             	$A.test.assertTrue(tooltip.parentNode.classList.contains("uiLabel"), "Tooltip was not found in label component.");
             })
         }]
    },
    
    createInputComponentAndAddToBody: function (cmp, tooltip, descriptor, label) {
        var input = $A.createComponentFromConfig({
            descriptor: descriptor,
            attributes: {
                "label": label,
                "fieldHelpComponent": tooltip  
            },
            localId: "inputComponent"
        });
        
        cmp.set('v.body', input);
    },
    
    createTooltip: function (cmp) {
        icon = $A.createComponentFromConfig({
            descriptor: 'markup://ui:label',
            attributes: {
              "label": " icon "
            }
        });
        
        var tooltip = $A.createComponentFromConfig({
            descriptor: 'markup://ui:tooltip',
            attributes: {
                "body": [icon],
                "tooltipBody": "This is help text. ",
                "advanced": true,
                "trigger": $A.get('$Browser').isDesktop ? "hover" : "none",
            },
            localId: "tooltip"
        });
        
        return [tooltip];
    },
})