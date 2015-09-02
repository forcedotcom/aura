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
    init: function (cmp, event, helper) {
    	console.log('init');
    },
    
    provide: function (cmp, evt, helper) {
        var currentPage = cmp.get('v.currentPage'),
            pageSize = cmp.get('v.pageSize'),
            items = [],
            tmpId;
        
        for (var i = 1; i <= pageSize; i++) {
        	tmpId = ((currentPage * pageSize) + i);
            items.push({
                id : tmpId,
                name : 'John Doe ' + tmpId, 
                phone : '555-' + tmpId,
                balance : '$' + tmpId
            });
        }
        
        this.fireDataChangeEvent(cmp, items);
    }
})