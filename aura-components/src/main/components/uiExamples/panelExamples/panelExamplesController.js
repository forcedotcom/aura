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
                direction: 'south'
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
    createFullPanel: function (cmp, event, helper) {
        var body = $A.newCmp({componentDef: 'uiExamples:modalContent'});

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
                //need this for event bubbling
                footer.setAttributeValueProvider(panel);
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
                body  : spinner
            },
            onCreate: function (panel) {
                //simulating panel content has server dependencies and updates panel after content is loaded
                setTimeout(function() {
                    var body = $A.newCmp({componentDef: 'uiExamples:modalContent'});
                    panel.update(body);
                }, 1000);
            }

        }).fire();
    },
    openPanel1: function(cmp){
        if (cmp._panel1) {
            return;
        }
        var refEl = '.uiExamplesPanelExamples .panel1';
        var body = $A.newCmp({componentDef: 'uiExamples:panelContent', attributes: {values:{'class': 'yellow'}}});
        var header = $A.newCmp({componentDef: 'uiExamples:panelHeader'});
        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                header: 'panel 1',
                referenceElementSelector: refEl,
                closeOnClickOut: false,
                showCloseButton: false,
                useTransition: false,
                body  : body,
                header: header,
                direction: 'south'
            },
            onCreate: function (panel) {
                header.setAttributeValueProvider(panel);
                cmp._panel1 = panel;
            },
            onDestroy: function() {
                delete cmp._panel1;
            }
        }).fire();
    },
    hidePanel1: function(cmp){
        if (cmp._panel1 && cmp._panel1.isValid()) {
            cmp._panel1.hide(function(){
            });
        }
    },
    showPanel1: function(cmp){
        if (cmp._panel1 && cmp._panel1.isValid()) {
            cmp._panel1.show();
        }
    },
    openPanel2: function(cmp){
        if (cmp._panel2) {
            return;
        }
        var refEl = '.uiExamplesPanelExamples .panel2';
        var body = $A.newCmp({componentDef: 'uiExamples:panelContent', attributes: {values:{'class': 'blue'}}});
        var header = $A.newCmp({componentDef: 'uiExamples:panelHeader'});
        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                header: 'panel 2',
                referenceElementSelector: refEl,
                closeOnClickOut: false,
                useTransition: false,
                showCloseButton: false,
                body  : body,
                header: header,
                direction: 'south'
            },
            onCreate: function (panel) {
                header.setAttributeValueProvider(panel);
                cmp._panel2 = panel;
            },
            onDestroy: function() {
                delete cmp._panel2;
            }

        }).fire();
    },
    hidePanel2: function(cmp){
        if (cmp._panel2 && cmp._panel2.isValid()) {
            cmp._panel2.hide();
        }
    },
    showPanel2: function(cmp){
        if (cmp._panel2 && cmp._panel2.isValid()) {
            cmp._panel2.show();
        }
    },
    openPanel3: function(cmp){
        if (cmp._panel3) {
            return;
        }
        var refEl = '.uiExamplesPanelExamples .panel3';
        var body = $A.newCmp({componentDef: 'uiExamples:panelContent', attributes: {values:{'class': 'green'}}});
        var header = $A.newCmp({componentDef: 'uiExamples:panelHeader'});
        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                header: 'panel 3',
                referenceElementSelector: refEl,
                closeOnClickOut: false,
                useTransition: false,
                showCloseButton: false,
                header: header,
                body  : body,
                direction: 'south'
            },
            onCreate: function (panel) {
                header.setAttributeValueProvider(panel);
                cmp._panel3 = panel;
            },
            onDestroy: function() {
                delete cmp._panel3;
            }
        }).fire();
    },
    hidePanel3: function(cmp){
        if (cmp._panel3 && cmp._panel3.isValid()) {
            cmp._panel3.hide();
        }
    },
    showPanel3: function(cmp){
        if (cmp._panel3 && cmp._panel3.isValid()) {
            cmp._panel3.show();
        }
    },
})