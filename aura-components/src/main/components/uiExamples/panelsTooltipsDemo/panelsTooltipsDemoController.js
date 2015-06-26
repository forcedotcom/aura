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
        var refEl = cmp.getElement().querySelector('.positioned-target');
        var body = $A.newCmp({componentDef: 'uiExamples:panelContent'});
        
        // toggling selected on the button
        // so the button is stateful
        // 
        var btn = cmp.find('southbutton');
        btn.set('v.selected', true);
        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                referenceElement: refEl,
                showCloseButton: false,
                closeOnClickOut: true,
                useTransition: true,
                body  : body,
                direction: 'south',
                showPointer: true,
                animation: 'pop'
            },
            onDestroy: function (panel) {
                btn.set('v.selected', false);
            }

        }).fire();
    },

    openEastPanel: function(cmp){
        var refEl = '.positioned-target-east';
        var body = $A.newCmp({componentDef: 'uiExamples:panelContent'});
        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                referenceElementSelector: refEl,
                showCloseButton: false,
                closeOnClickOut: true,
                useTransition: true,
                body  : body,
                direction: 'east',
                showPointer: true
            },
            onCreate: function (panel) {
                console.log('createPanel ' + panel);
            }

        }).fire();
    },

    createPanelWithHeader: function (cmp, event, helper) {
        var body = $A.newCmp({componentDef: 'uiExamples:panelContent'}),
            header = $A.newCmp({componentDef: 'uiExamples:panelHeader'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                referenceElementSelector: '.customer-header-button',
                showPointer: true,
                direction: 'south',
                useTransition: false,
                showCloseButton: false,
                flavor: 'custom',
                header: header,
                body  : body
            },
            onCreate: function (panel) {
                header.setAttributeValueProvider(panel);
            }

        }).fire();
    },

    openWestPanel: function(cmp){
        var refEl = '.positioned-target-west';
        var body = $A.newCmp({componentDef: 'uiExamples:panelContent'});
        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                referenceElementSelector: refEl,
                showCloseButton: false,
                closeOnClickOut: true,
                useTransition: false,
                body  : body,
                direction: 'west',
                showPointer: true
            },
            onCreate: function (panel) {
                console.log('createPanel ' + panel);
            }

        }).fire();
    },
    openNorthPanel: function(cmp){
        var refEl = '.positioned-target-north';
        var body = $A.newCmp({componentDef: 'uiExamples:panelContent'});
        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                referenceElementSelector: refEl,
                showCloseButton: false,
                closeOnClickOut: true,
                useTransition: false,
                body  : body,
                direction: 'north',
                showPointer: true
            },
            onCreate: function (panel) {
                console.log('createPanel ' + panel);
            }

        }).fire();
    },

    createPanel: function (cmp, event, helper) {
        var body = $A.newCmp({componentDef: 'uiExamples:panelContent'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                title: 'Panel Header',
                flavor: 'custom',
                body  : body
            },
            onCreate: function (panel) {
                console.log('createPanel ' + panel);
            }

        }).fire();
    },
    createFullPanel: function (cmp, event, helper) {
        var body = $A.newCmp({componentDef: 'uiExamples:modalContent'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                title: 'Panel Header',
                flavor: 'full-screen',
                body  : body
            },
            onCreate: function (panel) {
                console.log('createPanel ' + panel);
            }

        }).fire();
    },
    createModal: function (cmp, event, helper) {
        var body = $A.newCmp({componentDef: 'uiExamples:modalContent'});
        var footer = $A.newCmp({componentDef: 'uiExamples:panelFooter'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'modal',
            visible: true,
            panelConfig : {
                title: 'Modal Header',
                body  : body,
                flavor: 'custom',
                footer: footer
            },
            onCreate: function (panel) {
                console.log('createmodal ' + panel);
            }

        }).fire();
    },
    createLargeModal: function (cmp, event, helper) {
        var body = $A.newCmp({componentDef: 'uiExamples:modalContent'});
        var footer = $A.newCmp({componentDef: 'uiExamples:panelFooter'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'modal',
            visible: true,
            panelConfig : {
                title: 'Modal Header',
                flavor: 'large',
                body  : body,
                footer: footer,
                animation: 'bottom',
                closeAnimation: 'top'
            },
            onCreate: function (panel) {
                console.log('createmodal ' + panel);
            }

        }).fire();
    },

    lazyLoadPanel: function(cmp) {
        var spinner = $A.newCmp({componentDef: 'ui:spinner'});
        $A.get('e.ui:createPanel').setParams({
            panelType   :'modal',
            visible: true,
            panelConfig : {
                title: 'Modal Header',
                body  : spinner,
                flavor: 'custom',
                animation: 'left'
            },
            onCreate: function (panel) {
                //simulating panel content has server dependencies and updates panel after content is loaded
                setTimeout(function() {
                    var body = $A.newCmp({componentDef: 'uiExamples:modalContent'});
                    panel.update({ body : body });
                }, 1000);
            }

        }).fire();
    }
})