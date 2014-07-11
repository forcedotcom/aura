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
    handleModePress: function (cmp) {
    	var mode = cmp.get('v.mode');
        cmp.set("v.mode", mode === 'VIEW' ? 'EDIT' : 'VIEW');
    },

    handleCurrentPageChange: function (cmp) {
        // Tell the grid to fetch new items from the dataProvider.
        cmp.find('grid').getEvent('refresh').fire();
    },

    handleAddRow: function (cmp, evt, hlp) {
        hlp.fireAddRemove(cmp, {
            last: true,
            count: 1
        }); 
    },

    handleInsert: function (cmp, evt, hlp) {
        var index = cmp.get('v.index'),
            count = cmp.get('v.count') || 1,
            items = [],
            seed = 0;
        
        for (var i = 0; i < count; i++) {
        	seed = Math.floor(Math.random()*(10000-5020+1)+5020);
        	items.push({
                id           : seed,
                subject      : 'Foo ' + seed, 
                activityDate : '2014-01-01',
                who          : {
                    name : 'John New With A Fairly Long New Name ' + seed,
                    id   : '00' + seed
                },
                what: {
                    name : 'Acme' + seed,
                    id   : '00' + seed
                }
            });
        }

        if (!$A.util.isUndefinedOrNull(index)) {
            hlp.fireAddRemove(cmp, {
                index : index,
                count : count,
                items : items
            }); 
        }
    },

    handleRemove: function (cmp, evt, hlp) {
        var index = cmp.get('v.index'),
            count = cmp.get('v.count') || 1;

        if (!$A.util.isUndefinedOrNull(index)) {
            hlp.fireAddRemove(cmp, {
                index  : index,
                count  : count,
                remove : true
            }); 
        }
    },

    handleAction: function (cmp, evt, hlp) {
        var name = evt.getParam('name');

        switch (name) {
            case 'delete': 
                alert('delete '  + evt.getParam('index'));
        }
    },
    
    spit : function(cmp, evt, hlp) {
    	var list = cmp.find("grid").get("v.items");
		cmp.set("v.gridItems", list);
	},
	
	getSelected : function(cmp, evt, hlp) {
    	var list = cmp.find("grid").get("v.selectedItems");
		cmp.set("v.gridSelectedItems", list);
	},
	
	replaceData : function(cmp, evt, hlp) {
		cmp.find("data").getEvent("provide").fire();
	}
})