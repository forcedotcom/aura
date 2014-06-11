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
    clearAll: function(cmp, evt) {
        if (confirm("Are you sure you want to clear all aura definitions out of every cache?")) {
            var a = cmp.get("c.clearAllRegistries");
            a.setCallback(cmp, function(action){
                alert("done");
            });
            $A.enqueueAction(a);
        }
    },

    toggleMBeans: function(cmp, event) {
        var val = $A.util.getBooleanValue(cmp.get("v.mbeans"));
        cmp.set("v.mbeans", !val);
    }
})
