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
    changeOneValue: function(cmp, evt) {
    	var data = cmp.find("iteration").get("v.items");
        
        data[cmp.get("v.tochange")]["letters"] = cmp.get("v.newvalue");
        cmp.find("iteration").set("v.items", data);
    },

    changeEndIndex: function(cmp, evt) {
        var inputValue = cmp.get("v.inputValue");
        cmp.set("v.newEndIndex", inputValue);
        //cmp.find("innerIteration").set("v.end", 5);
    }
})
