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
    createComponentsForIndex: function(cmp, items, index, doForce) {
        var ret = [];
        var atts = cmp.getAttributes();
        var varName = atts.get("var");
        var indexVar = atts.get("indexVar");
        var body = atts.getValue("body");
        var extraProviders = {};
        extraProviders[varName] = items.getValue(index);
        if (indexVar) {
            extraProviders[indexVar] = $A.expressionService.create(null, index);
        }
        var ivp;
        for (var j = 0; j < body.getLength(); j++) {
            var cdr = body.get(j);
            if (!ivp) {
                ivp = $A.expressionService.createPassthroughValue(extraProviders, cdr.valueProvider || atts.getValueProvider());
            }
            ret.push($A.componentService.newComponentDeprecated(cdr, ivp, false, doForce));
        }
        return ret;
    },

    createRealBody: function(cmp, doForce) {
        var realbody = [];
        var atts = cmp.getAttributes();
        var items = atts.getValue("items");
        var varName = atts.get("var");
        if (items && !items.isLiteral() && !items.isEmpty()) {
            var start = this.getStart(cmp);
            var end = this.getEnd(cmp);
            for (var i = start; i < end; i++) {
                realbody = realbody.concat(this.createComponentsForIndex(cmp, items, i, doForce));
            }
        }
        return realbody;
    },

    rerenderEverything: function(cmp) {
        var realbody = cmp.getValue("v.realbody");
        var newbody = this.createRealBody(cmp, false);
        realbody.destroy();
        realbody.setValue(newbody);
    },

    rerenderSelective: function(cmp) {
        // optimized for insert/remove/push. if this is called as a result of a setValue then anything could change
        var start = this.getStart(cmp);
        var end = this.getEnd(cmp);
        var atts = cmp.getAttributes();
        var items = atts.getValue("items")
        var realbody = atts.getValue("realbody");
        if (!realbody.isEmpty()) {
            var varName = atts.get("var");
            var indexVar = atts.get("indexVar");
            var diffIndex = -1;
            var data;
            // look for a diff between the components we already created and the data
            for (var i = 0; i < realbody.getLength(); i++) {
                var bodycmp = realbody.getValue(i);
                var vp = bodycmp.getAttributes().getValueProvider();
                var index = vp.getValue(indexVar).unwrap();
                data = vp.getValue(varName);
                if (items.getValue(index) !== data) {
                    // we have a diff
                    diffIndex = index;
                    break;
                }
            }
            if (diffIndex !== -1) {
                // something was added or removed at or before diffIndex
                var cmparray = realbody.unwrap();
                var nextItem = items.getValue(diffIndex + 1);
                if (nextItem !== data) {
                    // this item was removed, delete this item, re-number rest
                    var removed = cmparray.splice(i, 1);
                    removed[0].destroy();
                    this.incrementIndices(cmparray, i, indexVar, -1);
                } else {
                    // item was added, instantiate new cmp, re-number rest
                    this.incrementIndices(cmparray, i, indexVar, 1);
                    var newcmp = this.createComponentsForIndex(cmp, items, diffIndex, false)[0];
                    cmparray.splice(i, 0, newcmp);
                    if (end - start < cmparray.length) {
                        // now there is 1 too many, need to remove from the end
                        var endcmp = cmparray.pop();
                        endcmp.destroy();
                    }
                }
                
                realbody.setValue(cmparray);
            }
            if (end - start > realbody.getLength()) {
                // now we don't have enough, create a new cmp at the end
                var items = cmp.getValue("v.items");
                var cmps = this.createComponentsForIndex(cmp, items, realbody.getLength() + start, false);
                for (var j = 0; j < cmps.length; j++) {
                    realbody.push(cmps[j]);
                }
            }
        } else {
            this.rerenderEverything(cmp);
        }
    },

    incrementIndices: function(cmpArray, start, indexVar, change) {
        for (var i = start; i < cmpArray.length; i++) {
            var vp = cmpArray[i].getAttributes().getValueProvider();
            var index = vp.getValue(indexVar);
            index.setValue(index.unwrap() + change);
        }
    },

    getStart: function(cmp) {
        var start = cmp.get("v.start");
        if (!$A.util.isEmpty(start)) {
            return Math.max(0, this.getNumber(start));
        } else {
            return 0;
        }
    },

    getEnd: function(cmp) {
        var length = cmp.get("v.items.length");
        var end = cmp.get("v.end");
        if (!$A.util.isEmpty(end)) {
            return Math.min(length, this.getNumber(end));
        } else {
            return length;
        }
    },

    // temp workaround when strings get passed in until typedef takes care of this for us
    getNumber: function(value) {
        if (aura.util.isString(value)) {
            value = parseInt(value, 10);
        }
        return value;
    }
})
