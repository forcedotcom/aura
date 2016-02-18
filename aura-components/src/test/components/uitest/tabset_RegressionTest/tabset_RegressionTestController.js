 /*
 * Copyright (C) 2016 salesforce.com, inc.
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
    onTabRemove: function(cmp, evt) {
        var callbackCount = cmp.get("v._tabRemoveCount");
        cmp.set("v._tabRemoveCount", callbackCount + 1);
        
        var indices = cmp.get("v._tabRemoveIndices");
        indices.push(evt.getParam("index"));
        cmp.set("v._tabRemoveIndices", indices);

        // name is an optional requirement
        var name = evt.getParam("name");
        if (name) {
            var names = cmp.get("v._tabRemoveNames");
            names.push(name);
            cmp.set("v._tabRemoveNames", names);
        }
    }
})