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
    clearCmpBody : function(cmp, id) {
        cmp.find(id).set("v.body", []);
    },
    setCmpBody : function(cmp, id){
        $A.createComponent(
            "ui:button",
            {
                label : "New Button"
            },
            function(newCmp){
                cmp.find(id).set("v.body", [newCmp]);
                cmp.index("newButton", newCmp.getGlobalId());
            }
        );
    },
    addCmpBody : function(cmp, id){
        $A.createComponent(
            "ui:button",
            {
                label : "Added Button"
            },
            function(newCmp){
                var body = cmp.find(id).get("v.body");
                var newBody = body.length > 0 ? [body[0]] : [];
                newBody.push(newCmp);
                cmp.find(id).set("v.body", newBody);
                cmp.index("addButton", newCmp.getGlobalId());
            }
        );
    }
})