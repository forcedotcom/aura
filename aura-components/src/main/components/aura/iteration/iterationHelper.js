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
        var ivp = $A.expressionService.createPassthroughValue(extraProviders, atts.getValueProvider());
        for (var j = 0; j < body.getLength(); j++) {
            var cdr = body.get(j);
            ret.push($A.componentService.newComponentDeprecated(cdr, ivp, false, doForce));
        }
        return ret;
    },

    createRealBody: function(cmp, doForce) {
        var realbody = [];
        var atts = cmp.getAttributes();
        var items = atts.getValue("items");
        var varName = atts.get("var");
        var indexVar = atts.get("indexVar");
        if (items && !items.isLiteral() && !items.isEmpty()) {
            var realstart = 0;
            var realend = items.getLength();
            var start = atts.getValue("start");
            if (start.isDefined()) {
                start = this.getNumber(start);
                if (start > realstart) {
                    realstart = start;
                }
            }
            var end = atts.getValue("end");
            if (end.isDefined()) {
                end = this.getNumber(end);
                if (end < realend) {
                    realend = end;
                }
            }
            for (var i = realstart; i < realend; i++) {
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

    // temp workaround when strings get passed in until typedef takes care of this for us
    getNumber: function(value) {
        value = value.unwrap();
        if (aura.util.isString(value)) {
            value = parseInt(value, 10);
        }
        return value;
    }
})
