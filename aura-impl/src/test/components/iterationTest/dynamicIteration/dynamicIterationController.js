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
        var data = cmp.find("iteration").getAttributes().getValue("items");
        var other = cmp.getValue("v.list");
        data.setValue(other);
    },

    setItems: function(cmp, evt) {
        var data = cmp.find("iteration").getAttributes().getValue("items");
        var other = cmp.getValue("m.data");
        data.setValue(other);
    },

    setCapitalItems: function(cmp, evt) {
        var data = cmp.find("iteration").getAttributes().getValue("items");
        var other = cmp.getValue("m.capitaldata");
        data.setValue(other);
    },

    changeOneValue: function(cmp, evt) {
        var data = cmp.find("iteration").getAttributes().getValue("items");
        var val = data.getValue(cmp.get("v.tochange")).getValue("stringy");
        val.setValue(cmp.get("v.newvalue"));
    },

    pushOneValue: function(cmp, evt) {
        var data = cmp.find("iteration").getAttributes().getValue("items");
        data.push({stringy:cmp.get("v.newvalue")});
    },

    insertOneValue: function(cmp, evt) {
        var data = cmp.find("iteration").getAttributes().getValue("items");
        data.insert(parseInt(cmp.get("v.tochange"), 10), {stringy:cmp.get("v.newvalue")});
    },

    deleteOneValue: function(cmp, evt) {
        var data = cmp.find("iteration").getAttributes().getValue("items");
        data.remove(parseInt(cmp.get("v.tochange"), 10));
    }
})
