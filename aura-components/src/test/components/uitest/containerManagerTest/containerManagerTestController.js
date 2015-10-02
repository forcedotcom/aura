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
        cmp.bodyCounter = 0;
        helper.setReferenceElement();
    },

    createPanel: function(cmp, event, helper) {

        var header = $A.newCmp({componentDef: 'uiExamples:panelHeader'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                referenceElementSelector: helper.globalRef,
                showPointer: true,
                useTransition: false,
                showCloseButton: true,
                header: header,
                body  : $A.newCmp({
                    componentDef : "markup://ui:outputText",
                    attributes : {
                        values : {
                            value : (cmp.bodyCounter+=1)
                        }
                    }
                })
            },
            onCreate: function (panel) {
                $A.log('panel created ' + panel);
                var panelEl = panel.getElement();
                panelEl.id = 'panel_'+cmp.bodyCounter;
                helper.setReferenceElement(panelEl.id);

                if(helper.globalPanelRefs.length >= 1) {
                    helper.bringToFrontDelegate();
                }
                helper.globalPanelRefs.push(panel);
            }

        }).fire();
    },

})