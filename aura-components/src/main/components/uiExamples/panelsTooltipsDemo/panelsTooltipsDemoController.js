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
        var refEl = '.positioned-target';
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
                direction: 'south',
                showPointer: true
            },
            onCreate: function (panel) {
                console.log('createPanel ' + panel);
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
                useTransition: false,
                body  : body,
                direction: 'east',
                showPointer: true
            },
            onCreate: function (panel) {
                console.log('createPanel ' + panel);
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
                footer: footer
            },
            onCreate: function (panel) {
                console.log('createmodal ' + panel);
            }

        }).fire();
    }
})