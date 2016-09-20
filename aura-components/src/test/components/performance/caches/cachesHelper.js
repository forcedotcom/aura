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
    updateCache: function (cmp) {
        var a = cmp.get("c.getCacheInfo");
        cmp.set("v.data", { "cache":"waiting...", "size":0, "values":[], "key":"" });
        a.setParams({"cache": cmp.get("v.cache"), "key": cmp.get("v.key")});
        a.setCallback(a, function(action) {
            if (action.getState() === "SUCCESS") {
                var v = action.getReturnValue();
                cmp.set("v.data.cache", v.cache);
                cmp.set("v.data.key", v.key);
                cmp.set("v.data.size", v.size);
                cmp.set("v.data.count", v.count);
                cmp.set("v.data.values", v.values);
            } else {
                cmp.set("v.data.cache", "ERROR");
                cmp.set("v.data.key", action.getState());
                cmp.set("v.data.size", "0");
                cmp.set("v.data.count", "0");
                cmp.set("v.data.values", []);
            }
        });
        $A.enqueueAction(a);
    },
})

