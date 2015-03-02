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
    replaceData : function(cmp, evt, hlp) {
        cmp.find("provider").getEvent("provide").fire();
    },

    handleCurrentPageChange: function (cmp) {
        // Tell the grid to fetch new items from the dataProvider.
        cmp.find('grid').getEvent('refresh').fire();
    },
     handleAddRow: function (cmp, evt, hlp) {
		var dynamicItems = [];
		var amtToCreate = cmp.get("v.numItems2Create");
		var num = cmp.get("v.currentRandNum");
		var i = 0;
		
		for (i; i < amtToCreate; i++, num++){
			dynamicItems.push( { 
				"date": "2020-10-12 "+num,
            	"id": ""+num,
            	"name": "Peter Parker "+num,
            	"relatedTo": "Media Inc "+num,
            	"subject": "Spidey "+num
            });
		}
		cmp.set("v.currentRandNum", num);
		
			
		hlp.fireAddRemove(cmp, {
            last: true,
            count: i,
            index: 0,
            items : dynamicItems
        }); 	
    },

    handleInsert: function (cmp, evt, hlp) {
        var index = cmp.get('v.index'),
            count = cmp.get('v.count') || 1,
            items = [],
            seed = cmp.get('v.currentRandNum'),
            i=0;
        
        for (i; i < count; i++, seed++) {
        	
        	items.push({
                id           : seed,
                subject      : 'Bar '+seed, 
                date : '2014-11-11 '+seed,
                name : 'New John '+seed,
                relatedTo : 'SFDC '+seed,
            });
        }
        cmp.set('v.currentRandNum', seed);
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
    }
})