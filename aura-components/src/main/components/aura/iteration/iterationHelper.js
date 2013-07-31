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
    /**
     * Create a callback with a closure for the collector and index.
     *
     * If you put a function closure in a loop, it takes the _last_
     * value for the variable. Passing by value protects us.
     */
    createAddComponentCallback: function(indexCollector, index) {
        // fixme: error handling here?
        return function(cmp) {
            indexCollector.body[index] = cmp;
            var bc = indexCollector.bodyCollector
            bc.count -= 1;
            if (bc.count === 0) {
                var accum = [];
                var rbl = bc.realBodyList;
                var i;

                for (i = bc.offset; i < rbl.length; i++) {
                    var j;
                    for (j = 0; j < rbl[i].length; j++) {
                        accum.push(rbl[i][j]);
                    }
                }
                if (bc.cmp._currentBodyCollector != bc) {
                    for (i = 0; i < accum.length; i++) {
                        accum[i].destroy(true);
                    }
                    return;
                }
                bc.cmp._currentBodyCollector = null;
                bc.callback(accum);
            }
        };
    },

    createComponentsForIndex: function(bodyCollector, cmp, items, index, doForce) {
        var ret = [];
        var atts = cmp.getAttributes();
        var varName = atts.get("var");
        var indexVar = atts.get("indexVar");
        var body = atts.getValue("body");
        var extraProviders = {};
        var indexCollector = {
            body:ret,
            bodyCollector:bodyCollector
        };
        bodyCollector.realBodyList[index] = ret;
        extraProviders[varName] = items.getValue(index);
        if (indexVar) {
            extraProviders[indexVar] = $A.expressionService.create(null, index);
        }
        var ivp;
        var len = body.getLength();
        //
        // Take off our index, but add the number of components that we will create.
        //
        bodyCollector.count += len - 1;
        for (var j = 0; j < body.getLength(); j++) {
            var cdr = body.get(j);
            if (!ivp) {
                ivp = $A.expressionService.createPassthroughValue(extraProviders, cdr.valueProvider || atts.getValueProvider());
            }
            ret[j] = null;
            $A.componentService.newComponentAsync(this, this.createAddComponentCallback(indexCollector, j), cdr, ivp);
        }
        return len;
    },

    createComponentsForIndexFromServer: function(cmp, items, index, doForce) {
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
        var len = body.getLength();
        //
        // Take off our index, but add the number of components that we will create.
        //
        for (var j = 0; j < body.getLength(); j++) {
            var cdr = body.get(j);
            if (!ivp) {
                ivp = $A.expressionService.createPassthroughValue(extraProviders, cdr.valueProvider || atts.getValueProvider());
            }
            ret.push( $A.componentService.newComponentDeprecated(cdr, ivp, false, doForce) );
        }
        return ret;
    },

    
    createRealBody: function(cmp, doForce, callback) {
        var atts = cmp.getAttributes();
        var items = atts.getValue("items");
        var varName = atts.get("var");
        var indexVar = atts.get("indexVar");

        //
        // The collector for the components.
        // Note that we put the count of items in our count, and
        // decrement for each one when we add the subitems on. This protects
        // us from 'instant' callbacks which occur inline (and would cause us
        // to think we had finished after the first item was processed).
        //
        var bodyCollector = {
            realBodyList:[],
            count: (items && items.getLength) ? items.getLength() : 0, // items length if it exists else zero
            callback: callback,
            cmp: cmp,
            offset:0
        };

        cmp._currentBodyCollector = bodyCollector;
        if (items && items.getLength && !items.isLiteral() && !items.isEmpty()) {
            var realstart = 0;
            var realend = items.getLength();
            var start = atts.getValue("start");
            if (start.isDefined()) {
                start = this.getNumber(start);
                if (start > realstart) {
                    realstart = start;
                    bodyCollector.offset = realstart;
                }
            }
            var end = atts.getValue("end");
            if (end.isDefined()) {
                end = this.getNumber(end);
                if (end < realend) {
                    realend = end;
                }
            }
            bodyCollector.count = realend-realstart;
            var count = 0;
            for (var i = realstart; i < realend; i++) {
                count += this.createComponentsForIndex(bodyCollector, cmp, items, i, doForce);
            }
            //
            // Catch the boundary condition where we end up creating nothing at all because
            // we never have a callback.
            //
            if (count === 0) {
                callback([]);
            }
        }
        else {
           callback([]);
        }
    },

    createRealBodyServer: function(cmp, doForce) {
        realbody = [];
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
                realbody = realbody.concat(this.createComponentsForIndexFromServer(cmp, items, i, doForce));
            }
        }
        
        return realbody;
    },

    
    rerenderEverything: function(cmp) {
        this.createRealBody(cmp, false, function(newBody) {
            if (cmp.isValid()) {
                var realbody = cmp.getValue("v.realbody");
                realbody.destroy();
                realbody.setValue(newBody);
            }
        });
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
