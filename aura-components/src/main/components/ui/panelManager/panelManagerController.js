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
    init: function(cmp, event, helper) {
        helper.initialize(cmp, event);
    },

    openPanel: function(cmp, event, helper) {
        helper.openPanel(cmp, event);
    },

    closePanel: function(cmp, event, helper) {
        var config = event.getParams() || {};
        if (config.destroy) {
            helper.destroyPanel(cmp, event);
        } else {
            helper.closeInstance(cmp, config.instance);
        }
    },
    
    updatePanel: function(cmp, event, helper) {
    	helper.updatePanel(cmp, event);
    },

    _onPanelTransitionBegin: function(cmp, event, helper) {
        helper.transitionBegin(cmp, event);
    },

    _onPanelTransitionEnd: function(cmp, event, helper) {
        helper.transitionEnd(cmp, event);
    },

    createSlidePanel: function(cmp, evt, helper) {
        helper.createPanelSliderDEPRECATED(cmp, evt.getParams() || {});
    },

    destroySlidePanel: function(cmp, evt, helper) {
        helper.destroySlidePanelDEPRECATED(cmp, evt, true);
    },

    destroyPanel: function(cmp, evt, helper) {
        helper.destroyPanel(cmp, evt);
    },

    destroyAllPanels: function(cmp, event, helper) {
        helper.destroyAllPanels(cmp, event);
    },

    onPanelLoaded: function(cmp, evt, helper) {
        helper.onPanelLoaded(cmp, evt);
    }
})