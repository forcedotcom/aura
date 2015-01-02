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
    addInputDate: function(cmp, evt, helper) {
        $A.newCmpAsync(this, function(newCmp) {
            var holder = cmp.find("additionalHolder");
            var body = holder.get("v.body");
            body.push(newCmp);
            holder.set("v.body", body);
            cmp.set("v.count", cmp.get("v.count")+1)
        }, { "componentDef":{"descriptor":"markup://ui:inputDate"}, "attributes":{"values":{"value":"{!v.addl}", "displayDatePicker":true } } });
    }
})
