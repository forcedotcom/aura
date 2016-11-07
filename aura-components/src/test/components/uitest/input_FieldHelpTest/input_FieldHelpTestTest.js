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
     * Test adding tooltip component to ui:inputText
     */
    testInputText: {
        browsers: ['DESKTOP', "IPHONE"],
        test: [function (cmp) {
            var tooltip = this.createTooltip();
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
    
    /**
     * Test adding tooltip component to ui:inputNumber
     */
    testInputNumber: {
    	 browsers: ['DESKTOP', "IPHONE"],
         test: [function (cmp) {
             var tooltip = this.createTooltip();
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
    
    /**
     * Test adding icon-only component instead of tooltip to ui:inputText
     */
    testUseIconComponent: {
        browsers: ['DESKTOP', "IPHONE"],
        test: [function (cmp) {
            var icon = this.createIcon();
            this.createInputComponentAndAddToBody(cmp, icon, "markup://ui:inputText", "Sample Input Text");

            $A.test.addWaitForWithFailureMessage(true, function() {
                return $A.test.select("label.uiLabel").length > 0;
            }, "Icon component was not found. ", function(cmp) {
                var iconElements = $A.test.select("label.uiLabel");
                var iconElement;
                for(var i = 0; i < iconElements.length; i++) {
                    if(iconElements[i].innerText === ' icon ') { 
                        iconElement = iconElements[i];
                    }
                }
                
                // Added isInstanceOf('force:icon') to inputHelper.renderFieldHelpComponent to allow icons in label.
                $A.test.assertNotUndefinedOrNull(iconElement, "The icon element should be added to the label. ");
            })
        }]
    },
    
    // Helpers
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
    
    createTooltip: function () {
        var icon = this.createIcon();
        
        var tooltip = $A.createComponentFromConfig({
            descriptor: 'markup://ui:tooltip',
            attributes: {
                "body": icon,
                "tooltipBody": "This is help text. ",
                "advanced": true,
                "trigger": $A.get('$Browser').isDesktop ? "hover" : "none",
            },
            localId: "tooltip"
        });
        
        return [tooltip];
    },
    
    createIcon: function () {
        icon = $A.createComponentFromConfig({
            descriptor: 'markup://ui:label',
            attributes: {
              "label": " icon "
            }
        });
        
        icon.isInstanceOf = function(cmp) {
            if(cmp === 'force:icon') {
                return true;
            } else {
                return false;
            }
        }
        
        return [icon];
    }   
})