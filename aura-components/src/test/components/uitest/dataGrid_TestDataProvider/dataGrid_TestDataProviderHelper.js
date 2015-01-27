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
     * Only sorts by numeric columns like 'id'.
     * ascending - b is greater than a.
     */
    sort: function (items, column, ascending) {
        items.sort(function (a, b) {
        	var aVal = a[column];
        	var bVal = b[column];
        	
        	if (!$A.util.isNumber(aVal)) {
        		// data is a space delimited string and using 
        		// last value (which should be an int value)
        		// in string as basis for sort.
        		// i.e. items = ["Foo 1", "Foo 2", "Foo 3", ...]
        		aValArr = aVal.split(" ");
        		bValArr = bVal.split(" ");
        		aVal = aValArr[aValArr.length - 1];
        		bVal = bValArr[bValArr.length - 1];
        	}
        	
        	var ret = parseInt(aVal) - parseInt(bVal);
        	
        	if (!ascending) {
        		ret = -ret;
        	}
        	
        	return ret;
        });
    },

    createTasks: function (cmp, currentPage, pageSize) {
        var items = [];

        // Hack to make 'zero based'. 
        --currentPage;
        var tmpId;
        
        for (var i = 1; i <= pageSize; i++) {
        	tmpId = ((currentPage * pageSize) + i);
            items.push({
                id           : tmpId,
                subject      : 'Foo '+tmpId, 
                date : '2014-01-01 '+tmpId,
                name : 'John Doe '+tmpId, 
                relatedTo : 'Acme '+tmpId
            });
        }

        return items;
    }
})