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

    openNotification: function(cmp){
        var refEl = '.uiExamplesPanelExamples a';
        var body = $A.createComponentFromConfig({descriptor: 'markup://uiExamples:panelContent'});
        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                referenceElementSelector: refEl,
                showCloseButton: false,
                closeOnClickOut: true,
                useTransition: false,
                body  : body,
                direction: 'south',
                showPointer: true
            }
        }).fire();
    },

    createPanelWithHeader: function (cmp, event, helper) {
        var body = $A.createComponentFromConfig({descriptor: 'markup://uiExamples:panelContent'}),
            header = $A.createComponentFromConfig({descriptor: 'markup://uiExamples:panelHeader'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                referenceElementSelector: '.uiExamplesPanelExamples .customer-header-button',
                showPointer: true,
                direction: 'south',
                useTransition: false,
                showCloseButton: false,
                flavor: 'custom',
                header: header,
                body  : body
            },
            onCreate: function (panel) {
                $A.log('panel created ' + panel);
            }

        }).fire();
    },
    createFullPanel: function (cmp, event, helper) {
        var body = $A.createComponentFromConfig({descriptor: 'markup://uiExamples:modalContent'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                title: 'Panel Header',
                flavor: 'full-screen',
                body  : body
            }

        }).fire();
    },
    createModal: function (cmp, event, helper) {
        var body = $A.createComponentFromConfig({descriptor: 'markup://uiExamples:modalContent'});
        var footer = $A.createComponentFromConfig({descriptor: 'markup://uiExamples:panelFooter'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'modal',
            visible: true,
            panelConfig : {
                title: 'Modal Header',
                body  : body,
                footer: footer
            },
            onCreate: function (panel) {
                //need this for event bubbling
                footer.setAttributeValueProvider(panel);
                console.log('createmodal ' + panel);
            }

        }).fire();
    },
    createLargeModal: function (cmp, event, helper) {
        var body = $A.createComponentFromConfig({descriptor: 'markup://uiExamples:modalContent'});
        var footer = $A.createComponentFromConfig({descriptor: 'markup://uiExamples:panelFooter'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'modal',
            visible: true,
            panelConfig : {
                title: 'Modal Header',
                flavor: 'large',
                body  : body,
                footer: footer
            }
        }).fire();
    },

    lazyLoadPanel: function(cmp) {
        $A.componentService.createComponent('ui:spinner', null, function(spinner){
            $A.get('e.ui:createPanel').setParams({
                panelType   :'modal',
                visible: true,
                panelConfig : {
                    title: 'Modal Header',
                    body  : spinner
                },
                onCreate: function (panel) {
                    //simulating panel content has server dependencies and updates panel after content is loaded
                    setTimeout(function() {
                        $A.componentService.createComponent('uiExamples:modalContent', null, function(body){
                            panel.update({body:body});
                        });
                    }, 1000);
                }
            }).fire();
        });
    },
    
    createCustomPanel: function(cmp, event) {
    	$A.componentService.createComponent(
            'ui:outputText', 
    		{value: 'This is a dynamically registered panel type'}, 
            function(textCmp){
    			$A.get('e.ui:createPanel').setParams({
    	            panelType   :'customPanel',
    	            visible: true,
    	            panelConfig : {
    	                title: 'Custom Panel',
    	                body  : textCmp
    	            }
    	        }).fire();
    	    }
        );	
    }
})