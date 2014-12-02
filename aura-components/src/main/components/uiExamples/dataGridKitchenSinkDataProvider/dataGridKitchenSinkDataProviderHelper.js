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
    sort: function (items, column, descending) {
        items.sort(function (a, b) {
            var aGtb = parseInt(a[column]) > parseInt(b[column]),
                ret;

            if (aGtb) {
                ret = 1;
            }
            else if (a[column] === b[column]) {
                ret = 0;
            }
            else {
                ret = -1;
            }

            if (descending) {
                ret = -ret;
            }

            return ret;
        });
    },
    
    applyPagination: function(tasks, currentPage, pageSize) {
    	var index = (currentPage - 1) * pageSize;
    	return tasks.slice(index, currentPage * pageSize);
    },

    createTasks: function (cmp) {
        var items = [],
        	maxItems = cmp.get('v.totalItems'),
        	isEven, isTriple;

        for (var i = 1; i <= maxItems; i++) {
        	isEven = i % 2 == 0;
        	isTriple = i % 3 == 0;
        	
            items.push({
                id           : i,
                subject      : 'Foo ' + i, 
                activityDate : isTriple ? '2014-01-01' : null,
                who          : {
                    name : 'John Doe With A Fairly Long Name ' + i,
                    id   : '00' + i
                },
                what: {
                    name : 'Acme' + i,
                    id   : '00' + i
                },
                url: isEven ? 'https://www.google.com' : 'https://www.salesforce.com'
            });
        }
        
        return cmp.get("v.empty") ? [] : items;
    }
})