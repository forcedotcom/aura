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
    init: function(component) {
        var dataProvider = component.get("v.dataProvider[0]");
        if(dataProvider && dataProvider.getModel()) {
            component.set("v.items", dataProvider.get("m.items"));
        }
    },

    fetchData: function (component, event, helper) {
        var superCmp   = component.getSuper(),
            isExtended = superCmp.getDef().getDescriptor().getName() !== 'component',
            argumentsParam  = event.getParam('arguments'),
            options    = argumentsParam.options,
            index      = argumentsParam.index;

        if (isExtended) {
            component = superCmp;
        }

        // Show loading indicator
        helper.showLoading(component.getSuper(), true);
        if (options) {
            component.set("v.keyword", options.keyword);
        }

        // fire dataProvide event
        var dataProviders = component.get("v.dataProvider");
        if (!index) {
            index = 0;
        }
        var provideEvent = dataProviders[index].get("e.provide");
        provideEvent.setParams({
            parameters: options
        });
        provideEvent.fire();

    },

    handleClick: function(component, event, helper) {
        var targetCmp = helper.getEventSourceOptionComponent(component, event);
        if (targetCmp) {
            var selectEvt = component.get("e.selectListOption");
            selectEvt.setParams({
                option: targetCmp
            });
            selectEvt.fire();
        }
    },

    handleHeaderClick: function(component) {
        var selectEvt = component.get("e.selectListOption");
        selectEvt.setParams({
            option: component.get("v.listHeader")[0],
            isHeader: true
        });
        selectEvt.fire();
    },

    handleFooterClick: function(component) {
        var selectEvt = component.get("e.selectListOption");
        selectEvt.setParams({
            option: component.get("v.listFooter")[0],
            isFooter: true
        });
        selectEvt.fire();
    },

    handleMouseDown: function(component, event) {
        //prevent loss of focus from the auto complete input
       event.preventDefault();
    },

    handleListHighlight: function(component, event, helper) {
        helper.handleListHighlight(component, event);
    },

    handlePressOnHighlighted: function(component, event, helper) {
        helper.handlePressOnHighlighted(component, event);
    },

    matchText: function(component, event, helper) {
        helper.matchText(component, event.getParam("keyword"));
    },

    visibleChange: function(component, event, helper) {
        helper.setUpEvents(component, true);
    }
})// eslint-disable-line semi
