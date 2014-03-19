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
        var mode = cmp.getValue('v.mode');
        mode.setValue(mode.getValue() === 'VIEW' ? 'EDIT' : 'VIEW');
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
            count = cmp.get('v.count') || 1;

        if (!$A.util.isUndefinedOrNull(index)) {
            hlp.fireAddRemove(cmp, {
                index : index,
                count : count
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
    }
})