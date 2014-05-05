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
    init: function (cmp) {
        cmp.set('v.totalItems', 100);
    },

    handleProvide: function (cmp, evt, hlp) {
        var currentPage = cmp.get('v.currentPage'),
            pageSize = cmp.get('v.pageSize'),
            sortBy = cmp.get('v.sortBy'),
            tasks = hlp.createTasks(cmp, currentPage, pageSize),
            column = sortBy, 
            ascending = true;

        if (column && column.indexOf('-') === 0) {
            column = sortBy.slice(1);
            ascending = false;
        }

        if (column) {
            hlp.sort(tasks, column, ascending);
        }

        hlp.fireDataChangeEvent(cmp, tasks);
    }
})