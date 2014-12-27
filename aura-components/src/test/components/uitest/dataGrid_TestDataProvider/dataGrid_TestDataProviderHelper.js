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