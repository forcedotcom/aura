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
     * Behavior when the data from one of its data providers changes
     *
     * @param {Component} component Potentially non-concrete (ui:abstractList) component instance.
     * @param event ui:dataChanged.
     * @param {Function} callback An optional callback to invoke after 'v.items' has been replaced.
     */
    handleDataChange: function(component, event, callback) {
        var concrete = component.getConcreteComponent();

        concrete.set("v.items", event.getParam("data"));
        this.showLoading(component, false);

        if (callback) {
            callback();
        }
    },

    /** Behavior to prepare the list for new data before a refresh **/
    beforeRefresh: function(component, event) {
        component.getConcreteComponent().set("v.items", []);
    },

    updateEmptyListContent:function (component) {
        // make sure we are referencing a concrete component.
        var concrete_component = component.getConcreteComponent();
        var items = concrete_component.get("v.items");
        var has_items = items != null && items.length > 0;
        $A.util[has_items ? "removeClass" : "addClass"](concrete_component.getElement(), "showEmptyContent");
    },

    /** Behavior for triggering data providers on initialization **/
    initTriggerDataProviders: function(component) {
        this.triggerDataProvider(component);
    },

    init: function(component) {
        this.initDataProvider(component);
        this.initPagers(component);
    },

    initDataProvider: function(component) {
        var dataProviders = component.get("v.dataProvider");

        if (dataProviders && dataProviders.length && dataProviders.length > 0) {
            for (var i = 0; i < dataProviders.length; i++) {
                dataProviders[i].addHandler("onchange", component, "c.handleDataChange");
            }

            component._dataProviders = dataProviders;
        }
    },

    initPagers: function(component) {
        var facets = component.getFacets();
        var pagers = [];

        // walk each facet looking for instances of ui:pager
        for (var i = 0, len = facets.length; i < len; i++) {
            var facet = facets[i];

            for (var n = 0; n < facet.length; n++) {
                var c = facet[n];
                if (c.getDef().getDescriptor().getQualifiedName() != "markup://aura:unescapedHtml") {
                    if (c.isInstanceOf("ui:pager")) {
                        pagers.push(c);
                    } else {
                        pagers = pagers.concat(c.find({instancesOf: "ui:pager"}));
                    }
                }
            }
        }

        // wireup handlers and values
//      var chainedAttrs = ["currentPage", "pageSize", "totalItems"];
        var j = pagers.length;
        while (j--) {
            var pager = pagers[j];
            pager.addHandler("onPageChange", component, "c.handlePageChange");

//          TODO: want to wire this up so that the valueProvider for these attributes is always the parent list, not the component
//              in which the paginators were referenced, but not sure we can do that today...
//          var k = chainedAttrs.length;
//          while (k--) {
//              var exp = "v." + chainedAttrs[k];
//              pager.set(exp, component.get(exp));
//          }
        }

        // cache the pagers
        component._pagers = pagers;
    },

    /**
     * @param component {Component} ui:abstractList
     * @param param {Number/Boolean} count or boolean for last item
     * @param timeout
     * @param callback
     */
    remove: function (component, index, count, timeout, animate, callback) {
        var items = component.get('v.items'),
            array = this.exclude(items, index),
            helper = component.getConcreteComponent().getDef().getHelper();

        helper.removeItem(component, array, index, timeout, animate, callback);
    },

    /**
     * Provides a default implementation of row removal. Intentionally does not do anything nice.
     * ui:infiniteList implements removal utilizing 'timeout', 'animate', and 'callback'.
     * Do NOT change this function - override with custom logic instead.
     */
    removeItem: function (component, array, index, timeout, animate, callback) {
        component.set('v.items', array);
    },

    exclude: function (items, index) {
        var array = [],
            i;

        for (i = 0; i < items.length; i++) {
            if (i !== index) {
                array.push(items[i]);
            }
        }

        return array;
    },

    showLoading:function (component, visible) {
        $A.util.toggleClass(component, "loading", !!visible);
    },

    triggerDataProvider: function(component, index, refresh) {
        this.showLoading(component, true);
        if (!index) {
            index = 0;
        }

        if (index >= 0 && index < component._dataProviders.length) {
            var e = component._dataProviders[index].get("e.provide");
            if (refresh) {
                e.setParams({parameters:{refresh:true}});
            }
            e.fire();
        } else {
            this.showLoading(component, false);
            this.handleError(component, "Index is out of bounds for list's data provider trigger.")
        }
    },

    handleError: function(cmp, errorMsg) {
        cmp.getConcreteComponent()._refreshing = false;
        $A.error(errorMsg);
    }
})
