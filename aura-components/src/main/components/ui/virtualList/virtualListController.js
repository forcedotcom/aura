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
        cmp._initializing = true;

        helper.initialize(cmp);
        helper.initializeBody(cmp);
        helper.initializeDataModel(cmp);
        helper.initializeTemplate(cmp);
        helper.initializeItems(cmp);
        helper.createVirtualList(cmp);

        cmp._initializing = false;
    },
    handleTemplateChange: function(cmp, event, helper) {
        helper.handleTemplateChange(cmp, 'itemTemplate');
    },
    handleTemplateMapChange: function(cmp, event, helper) {
        helper.handleTemplateChange(cmp, 'templateMap');
    },
    
    addTemplate: function(cmp, event, helper) {
        var params = event.getParam('arguments');
        helper.addTemplate(cmp, params.key, params.template);
    },
    handleItemsChange: function (cmp, event, helper) {
    	if (cmp._initializing || cmp._appending || cmp._updating) {
    		return;
    	}
    
        helper.ignorePTVChanges(cmp, true);

        helper.markClean(cmp, 'v.items');
        helper.createVirtualList(cmp);
        helper.markDirty(cmp); 
        
        helper.ignorePTVChanges(cmp, false);
    },
    /** This function gets call as the "callback" from the dataProvider */
    handleDataChange: function(cmp, evt, helper) {
        // Ignore changes when we are initializing the component
        cmp.set("v.items", evt.getParam("data"), cmp._initializing);
        helper.markDirty(cmp); // So we go into the rerender
    },
    rerenderList: function (cmp, evt, helper) {
        helper.createVirtualList(cmp);
    },
    appendItems: function (cmp, event, helper) {
        var items = event.getParam('arguments').items;
        cmp = helper._getRootComponent(cmp);

        if (items && items.length) {
        	cmp._appending = true;
            helper.appendVirtualRows(cmp, items);
            cmp._appending = false;
        }
    },
    updateItem: function (cmp, event, helper) {
        var params  = event.getParam('arguments'),
            index   = params.index,
            item    = params.item;
        cmp = helper._getRootComponent(cmp);

        helper.ignorePTVChanges(cmp, true);
        helper.updateItem(cmp, item, index);
        helper.ignorePTVChanges(cmp, false);
    },
    getComponentByIndex: function (cmp, event, helper) {
        var params   = event.getParam('arguments'),
            index    = params.index,
            callback = params.callback;
        cmp = helper._getRootComponent(cmp);

        return helper.getComponentByIndex(cmp, index, callback);
    }
})// eslint-disable-line semi
