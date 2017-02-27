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
    init: function (cmp, event, helper) {
        cmp.counter = 0;
    },

    openPanel: function(cmp){
        var refEl = '.refElement2';
        var body = $A.createComponentFromConfig({componentDef: { descriptor: "markup://ui:outputText"},
    		attributes: {
    			values: {
    				value: "First panel body\nClick on the ChangeRefElem button to change the reference element"
    			}
    		}});
        
        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                referenceElementSelector: refEl,
                showCloseButton: true,
                closeOnClickOut: false,
                useTransition: true,
                body  : body,
                direction: 'east',
                showPointer: true              
            }
        }).fire();
    },
  
    changeReferenceElement: function(cmp){
    	var panel = cmp.find("pm").find("panel");
    	var refElement1 = cmp.find("refElement1").getElement();

    	panel.set("v.referenceElement", refElement1);
    	
    	panel.set("v.body", $A.createComponentFromConfig({componentDef: { descriptor: "markup://ui:outputText"},
    		attributes: {
    			values: {
    				value: "New panel body\nHere is some more text!"
    			}
    		}
    	}));
    },

    onSelectChange: function(cmp){
        var select = cmp.find('directions');
        var direction = select.get('v.value');
        var body = $A.createComponentFromConfig({componentDef: { descriptor: "markup://ui:outputRichText" },
            attributes: {
                values: {
                    value: "<div class=\"panel-bd\">Panel Body</div>"
                }
            }});
        
        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                referenceElement: cmp.find('directions-holder').getElement(),
                showCloseButton: false,
                closeOnClickOut: true,
                useTransition: true,
                body  : body,
                direction: direction,
                showPointer: false,
                animation: 'pop'
            },
            onDestroy: function (panel) {
                // btn.set('v.selected', false);
            }

        }).fire();
    }
})