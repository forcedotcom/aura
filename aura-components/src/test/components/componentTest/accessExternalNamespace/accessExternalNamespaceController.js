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
    testComponentAccess: function(cmp) {
        var cmpToCreate = cmp.get("v.cmpToCreate");
        $A.createComponent(cmpToCreate, {}, function(newCmp){
            // Output "null" text so tests can verify easier
            if (newCmp === null) {
                $A.util.setText(cmp.find("output").getElement(), "null");
            } else {
                cmp.find("output").set("v.body", newCmp);
            }
            cmp.set("v.completed", true);
        });
    },

    getAttribute: function(cmp) {
        var attr = cmp.get("v.attrName");
        var attrValue = cmp.find("output").get("v.body")[0].get("v." + attr);
        // Output "undefined" text so tests can verify easier
        if (attrValue === undefined) {
            attrValue = "undefined";
        }
        $A.util.setText(cmp.find("attrValue").getElement(), attrValue);
    }
})