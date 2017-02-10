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
        // This is only needed for tests, we should update the tests to not use the models anymore and then
        // this whole method can be removed
        var dataProvider = component.get("v.dataProvider[0]");
        if(dataProvider && dataProvider.getModel()) {
            component.set("v.items", dataProvider.get("m.items"));
        }
        var items = component.get("v.items");
        if (items && items.length > 0) {
            component.set("v.privateItems", items);
        }
    },

    fetchData: function (component, event, helper) {
        var superCmp   = component.getSuper(),
            isExtended = superCmp.getType() !== 'aura:component',
            argumentsParam  = event.getParam('arguments'),
            options    = argumentsParam.options,
            index      = argumentsParam.index,
            targetCmp;

        if (isExtended) {
            targetCmp = superCmp;
        }  else {
            targetCmp = component;
        }

        // Show loading indicator, using a delay when specified
        var loadingIndicatorDelay = targetCmp.get("v.loadingIndicatorDelay");
        if (loadingIndicatorDelay > 0) {
            if (component._loadingTimer) {
                clearTimeout(component._loadingTimer);
            }
            component._loadingTimer = setTimeout($A.getCallback(function() {
                helper.showLoading(targetCmp, true);
            }), loadingIndicatorDelay);
        } else {
            helper.showLoading(targetCmp, true);
        }

        if (options) {
            targetCmp.set("v.keyword", options.keyword);
        }

        helper.fireDataProvideEvent(targetCmp, options, index);
    },

    abortFetchData: function(component, event, helper) {
        var argumentsParam  = event.getParam('arguments'),
            options = argumentsParam.options,
            index = argumentsParam.index;
        helper.fireAbortEvent(component, options, index);
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

    handleHeaderClick: function(component, event, helper) {
        var header = helper.getHeader(component),
            unselectable = (header && header.isInstanceOf('ui:autocompleteListSelectable') && !header.get("v.selectable"));
        if (unselectable) {
            return;
        }
        var selectEvt = component.get("e.selectListOption");
        selectEvt.setParams({
            option: component.get("v.listHeader")[0],
            isHeader: true
        });
        selectEvt.fire();
    },

    handleFooterClick: function(component, event, helper) {
        var footer = helper.getFooter(component),
            unselectable = (footer && footer.isInstanceOf('ui:autocompleteListSelectable') && !footer.get("v.selectable"));
        if (unselectable) {
            return;
        }
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
