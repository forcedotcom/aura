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
    setOriginalItems: function(cmp, evt) {
        var other = cmp.get("v.list");
        cmp.find("iteration").set("v.items", other)
    },

    setItems: function(cmp, evt) {
        var other = cmp.get("m.data");
        cmp.find("iteration").set("v.items", other);
    },

    setCapitalItems: function(cmp, evt) {
        var other = cmp.get("m.capitalData");
        cmp.find("iteration").set("v.items", other);
    },

    changeOneValue: function(cmp, evt) {
    	var iter = cmp.find("iteration");
    	var data = iter.get("v.items");
        data[cmp.get("v.tochange")] = {stringy: cmp.get("v.newvalue") }
    	iter.set("v.items", data)
    },

    pushOneValue: function(cmp, evt) {
        var data = cmp.find("iteration").get("v.items");
        data.push({"stringy":cmp.get("v.newvalue")});
        cmp.find("iteration").set("v.items", data)
    },

    insertOneValue: function(cmp, evt) {
        var data = cmp.find("iteration").get("v.items");
        data.splice(parseInt(cmp.get("v.tochange"), 10),
        			0,
        			{"stringy":cmp.get("v.newvalue")});
        cmp.find("iteration").set("v.items", data);
    },

    deleteOneValue: function(cmp, evt) {
        var data = cmp.find("iteration").get("v.items");
        data.splice(parseInt(cmp.get("v.tochange"), 10), 1);
        cmp.find("iteration").set("v.items", data);
    }
})
