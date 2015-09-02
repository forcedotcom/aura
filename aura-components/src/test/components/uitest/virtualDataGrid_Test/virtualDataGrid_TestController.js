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
    	cmp.find('provider').getEvent('provide').fire();
    },
    
    refreshData : function(cmp, evt, hlp) {
    	cmp.find('grid').getEvent('refresh').fire();
    },
    
    handleAddRow: function (cmp, evt, hlp) {
    	var dynamicItems = [];
    	var suffix = cmp.get('v.index') || 1;
		var amtToCreate = cmp.get('v.count') || 1;
		var i = 1;
		
		for (i; i <= amtToCreate; i++, suffix++){
			dynamicItems.push({ 
				'name' : 'Peter Parker ' + suffix,
				'phone' : '415555-' + suffix,
				'balance' : '$' + suffix,
            });
		};
		
		hlp.append(cmp, dynamicItems);
		cmp.set('v.index', suffix);
    },
    
    handleInsert: function (cmp, evt, hlp) {
        var index = cmp.get('v.index') || 0,
            count = cmp.get('v.count') || 1,
            items = cmp.find('grid').get('v.items'),
            i=0;
        
        for (i; i < count; i++, index++) {
        	var item = {
                name : 'Mary Jane' + index,
                phone : '999-' + index,
                balance : '$9' + index
            };
        	items.splice(index, 0, item);
        }
        
    	cmp.find('grid').set('v.items', items);
    	cmp.set('v.index', index);
    },
    
    handleRemove: function (cmp, evt, hlp) {
        var index = cmp.get('v.index') || 0,
            count = cmp.get('v.count') || 1,
            items = cmp.find('grid').get('v.items');
        items.splice(index, count);
        cmp.find('grid').set('v.items', items);
    }
})