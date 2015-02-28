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
    /**
     * TODO::make pagination work with more than one data provider.
     *
     */
    handlePageChange: function(component, event, helper) {
        var currentPage = event.getParam("currentPage");
        var pageSize = event.getParam("pageSize");

        component.set("v.currentPage", currentPage, true);
        component.set("v.pageSize", pageSize);

        helper.triggerDataProvider(component);
    },

    handleDataChange: function(component, event, helper) {
        var concrete = component.getConcreteComponent(),
            concreteHelper = concrete.getDef().getHelper();

        if (concrete._refreshing) {
            helper.beforeRefresh(concrete, event);
            concrete._refreshing = false;
        }

        concreteHelper.handleDataChange(component, event, concrete._callback);
        concrete._callback = null; // remove reference to avoid a leak
    },

    init: function(component, event, helper) {
        helper.init(component);

        helper.initTriggerDataProviders(component);
    },

    // TODO: Support refresh-all behavior
    refresh: function(component, event, helper) {
        var concrete = component.getConcreteComponent(),
            params = event.getParam("parameters"),
            index = 0;

        if (params) {
            index = params.index;
            concrete._callback = params.callback;
        }

        concrete.set("v.currentPage", 1, true);
        concrete._refreshing = true;

        helper.triggerDataProvider(component, index, true);
    },

    /**
     * Handles removal of a row(s) from the list.
     *
     * Structure your "parameters" (inherited from ui:command) like so:
     *
     * parameters : {
     *     timeout  : Number     // number of milliseconds to use as an animation timeout
     *     animate  : Function  // invoked to apply whatever animation technique is most appropriate
     *     callback : Function  // invoked after the timeout and hard removal has occurred
     * }
     */
    addRemove: function (component, event, helper) {
        var params = event.getParams(),
            timeout = params.parameters && params.parameters.timeout,     // no default timeout
            animate = params.parameters && params.parameters.animate,
            callback = params.parameters && params.parameters.callback,
            items;

        if (params.remove) {

            // Default index and count if necessary.
            if (params.last) {
                items = component.getConcreteComponent().get('v.items');
                params.index = items ? items.length - 1 : null;
                params.count = 1;
            }

            if (params.count) {
                helper.remove(component, params.index, params.count, timeout, animate, callback);
            }
            else {
                throw new Error("Remove command must be provided with either a 'count' or 'last' parameter.");
            }
        }
        else {
            throw new Error('Add command not implemented on ui:abstractList.');
        }
    },

    triggerDataProvider: function(component, event, helper) {
        var params = event.getParam("parameters");
        var index = 0;
        if (params) {
            index = params.index;
        }
        helper.triggerDataProvider(component, index);
    }
})