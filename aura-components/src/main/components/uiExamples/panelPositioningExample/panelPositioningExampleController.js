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
    init: function() {

    },

    handleMouseDown: function(cmp, evt, helper) {
        helper.handleMouseDown(cmp, evt);
    },

    handleChange: function(cmp, evt, helper) {
        var advanced = evt.source.get('v.value');
        cmp.set('v.advanced', advanced);
    },

    handleShowPointer: function(cmp, evt, helper) {
        cmp.set("v.showPointer", evt.source.get('v.value'));
    },

    handlePress: function(cmp, evt, helper) {
        var advanced = cmp.get('v.advanced');
        var body = $A.createComponentFromConfig({descriptor: 'markup://aura:unescapedHtml', attributes: {value: '<div class="panel-content">This is the panel</div>'}})
        var bigTarget = cmp.find('bigTarget').getElement();
        var littleTarget = cmp.find('littleTarget').getElement();
        var value = cmp.find('direction').get('v.value');
        var pad = parseInt(cmp.find('pad').get('v.value'),10);
        var padTop = cmp.find('padTop').get('v.value');
        var bundingBoxPad = cmp.find('bundingBoxPad').get('v.value');
        var boxDirectionPad = cmp.find('boxDirectionPad').get('v.value');
        var pointerPad = cmp.find('pointerPad').get('v.value');
        var isInside;
        isInside = cmp.find('isInside').get('v.value');

        var panelConfig ={
            referenceElement: isInside ? bigTarget : littleTarget,
            showCloseButton: false,
            closeOnClickOut: true,
            flavor: 'default, error',
            useTransition: false,
            body  : body,
            direction: value,
            showPointer: false,
            boundingElement: isInside ? window : bigTarget,
            inside: isInside,
            pad: pad,
            padTop: padTop !== undefined ? parseInt(padTop, 10) : undefined,
            pointerPad: pointerPad,
            bundingBoxPad: bundingBoxPad,
            boxDirectionPad: boxDirectionPad,
            showPointer: cmp.get("v.showPointer"),
            classNames: "slds-theme--warning,good"
        };

        if(cmp.find('isAdvanced').get('v.value')) {
            delete panelConfig.direction;
            panelConfig.advanced = true;
            panelConfig.align = cmp.find('align').get('v.value');
            panelConfig.targetAlign = cmp.find('targetAlign').get('v.value');
        }

        $A.get('e.ui:createPanel').setParams({
            panelType   :'panel',
            visible: true,
            panelConfig : panelConfig
        }).fire();
    }
})