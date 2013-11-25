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
    add: function (cmp) {
        var list = cmp.find('list'),
            task = {
            ActivityDate: "2013-08-27",
            IsClosed: false,
            Id: "Client"
        };

        list.getValue('v.items').insert(0, task);
    },
    remove: function (cmp) {
        var list = cmp.find('list');

        list.getValue('v.items').remove(1);
    }

})