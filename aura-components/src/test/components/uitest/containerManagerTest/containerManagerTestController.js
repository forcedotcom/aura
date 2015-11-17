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
    },

    createPanel: function(cmp, event, helper) {
        cmp.bodyCounter += 1;

        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : {
                title: cmp.bodyCounter,
                'class': 'shift',
                showPointer: true,
                useTransition: false,
                showCloseButton: true
            },
            onCreate: function (panel) {
                $A.log('panel created ' + panel);
                var panelEl = panel.getElement();
                panelEl.id = 'panel_'+cmp.bodyCounter;
                panelEl.style.marginLeft = (30 * cmp.bodyCounter) + 'px';
                helper.globalPanelRefs.push(panel);
            }
        }).fire();
    },

})