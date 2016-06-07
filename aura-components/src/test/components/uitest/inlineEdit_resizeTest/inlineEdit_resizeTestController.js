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
    
    init : function(cmp, evt, helper) {
        var items = [];
        
        for (var i = 0; i < 10; i++) {
            items.push({
                data : {
                    id : i,
                    name : "Name" + i,
                    grade : i,
                    linkLabel : "Link" + i
                },
                status : {},
                errors : {}
            });
        }
        // this row is an empty row
        items[5].data.name = '';
        items[5].data.grade = '';
        items[5].data.linkLabel = ';'
        
        cmp.set("v.items", items);
        
        // Generate edit layouts:
        cmp.find("grid").set("v.editLayouts", helper.EDIT_LAYOUTS);
    },
    
    onEdit : function(cmp, evt) {
        var params = evt.getParams();
        $A.log("Edited[" + params.index + "] " + params.key + " --> " + params.value);
    },
    
    onResize : function(cmp, evt, helper) {
        var src = evt.getParam("src");
        cmp.set("v.prevResize", {
            src : {
                index : src.colIndex,
                label : src.column.get("v.label")
            },
            width : evt.getParam("newSize")
        });
    }
})// eslint-disable-line semi