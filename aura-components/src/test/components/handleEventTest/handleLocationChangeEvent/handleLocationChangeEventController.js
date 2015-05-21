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
    locationChange: function(cmp, event){
        var order = cmp.get("v.order");
        var append = order === "" ? "locationChange" : ";locationChange";
        cmp.set("v.order", order + append);

        if(cmp.get("v.hideLocationChangeTimes") === 0) {
            cmp.set("v.locationChangeCount", cmp.get("v.locationChangeCount") + 1);
        }
    },

    click: function(cmp, event){
        var order = cmp.get("v.order");
        var append = order === "" ? "click" : ";click";
        cmp.set("v.order", order + append);

        cmp.set("v.clickCount", cmp.get("v.clickCount") + 1);
        if(cmp.get("v.hideLocationChangeTimes") > 0) {
            cmp.set("v.hideLocationChangeTimes", cmp.get("v.hideLocationChangeTimes") - 1);
        }
    }
})
