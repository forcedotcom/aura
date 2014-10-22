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
    init: function(cmp, evt, helper) {
        var bodyTemplate = cmp.get("v.body"),
            isTrue       = $A.util.getBooleanValue(cmp.get("v.isTrue")),
            template     = cmp.get("v.template"),
            localCreation = true;

        if (bodyTemplate.length && !template.length) {
            cmp.set("v.template", bodyTemplate, true);
            cmp.set("v.body", [], true);
            localCreation = false;
        }

        var body = helper.createBody(cmp, isTrue, localCreation);
        cmp.set("v.body", body, true);
        cmp._truth=isTrue;
    },
    handleTheTruth: function(cmp, evt, helper) {
        var isTrue  = $A.util.getBooleanValue(cmp.get("v.isTrue"));
        if(cmp._truth!==isTrue) {
            cmp.set("v.body", helper.createBody(cmp, isTrue, true));
            cmp._truth=isTrue;
        }
    }
})