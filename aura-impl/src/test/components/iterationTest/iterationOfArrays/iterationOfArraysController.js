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
        cmp.find("iteration").set("v.items", other);
    },

    setItems: function(cmp, evt) {
        var other = cmp.get("m.data");
        cmp.find("iteration").set("v.items", other);
    },

    setCapitalItems: function(cmp, evt) {
        var other = cmp.get("m.capitaldata");
        var iter = cmp.find("iteration");
        iter.set("v.items", other);
    },

    reverseItems: function(cmp, evt) {
        var iter = cmp.find("iteration");
        var items = iter.get("v.items");
        
        var reversed = items.reverse();

        iter.set("v.items", reversed);
    },

    changeOneValue: function(cmp, evt) {
        var index = cmp.get("v.tochange");
        var iter = cmp.find("iteration");
        
        var data = iter.get("v.items");
        data[index] = {stringy: cmp.get("v.newvalue") }
        
        iter.set("v.items", data);
    },

    pushOneValue: function(cmp, evt) {
        var iter = cmp.find("iteration");
        var old = iter.get("v.items");
        old.push({stringy:cmp.get("v.newvalue")});
        iter.set("v.items",old);
    },

    insertOneValue: function(cmp, evt) {
        var index = parseInt(cmp.get("v.tochange"), 10);
        var iter = cmp.find("iteration");
        var newdata = iter.get("v.items");

        // Create the new data item.
        newdata.splice(index, 0, {stringy:cmp.get("v.newvalue")});

        // To avoid over-rerendering, we SHOULD do a for loop over changed indeces:
        //     for (var i = index; i < newdata.length; i++) {
        //        iter.set("v.items[" + i + "]", newdata[i] }
        // BIT it seems iter.get("v.items[10]") doesn't work right.  So, sigh:
        iter.set("v.items", newdata);
    },

    deleteOneValue: function(cmp, evt) {
        var index = parseInt(cmp.get("v.tochange"), 10);
        var iter = cmp.find("iteration");
        var newdata = iter.get("v.items");
        
        // Remove the one data item.
        newdata.splice(index, 1);

        // This over-rerenders, but see insertOneValue for why iter.get("v.items[3]")
        // doesn't work... in this case, also, we don't have a good syntax to REMOVE
        // the last value (not keep it empty/undefined, but REMOVE it).
        iter.set("v.items", newdata);
    }
})
