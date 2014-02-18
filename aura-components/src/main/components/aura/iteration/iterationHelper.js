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
        var forceServer = cmp.getAttributes().getValue("forceServer").getValue();
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
            $A.componentService.newComponentAsync(this, this.createAddComponentCallback(indexCollector, j), cdr, ivp, false, false, forceServer);
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
        
        $A.setCreationPathIndex(index);
        $A.pushCreationPath("body");
        //
        // Take off our index, but add the number of components that we will create.
        //
        for (var j = 0; j < body.getLength(); j++) {
            $A.setCreationPathIndex(j);
            var cdr = body.get(j);
            if (!ivp) {
                ivp = $A.expressionService.createPassthroughValue(extraProviders, cdr.valueProvider || atts.getValueProvider());
            }
            ret.push( $A.componentService.newComponentDeprecated(cdr, ivp, false, doForce) );
        }
        
        $A.popCreationPath("body");
        return ret;
    },
    
    createNewComponents: function(cmp, callback) {
        var start = this.getStart(cmp);
        var end = this.getEnd(cmp);
        var atts = cmp.getAttributes();
        var realbody = atts.getValue("realbody");
        var body = atts.getValue("body");
        var bodyLen = body.getLength();
        if ((end - start) > (realbody.getLength()/bodyLen)) {
            // now we don't have enough, create a new cmp at the end
            var items = cmp.getValue("v.items");
            //var cmps = this.createComponentsForIndex(cmp, items, realbody.getLength() + start, false);
            this.createSelectiveComponentsForIndex(cmp, items, (realbody.getLength()/bodyLen) + start, false, callback);
        }
    },

    
    createRealBody: function(cmp, doForce, callback) {
        var atts = cmp.getAttributes();
        var items = atts.getValue("items");
        //
        // The collector for the components.
        // Note that we put the count of items in our count, and
        // decrement for each one when we add the subitems on. This protects
        // us from 'instant' callbacks which occur inline (and would cause us
        // to think we had finished after the first item was processed).
        //
        var bodyCollector = {
            realBodyList:[],
            count: (items && items.getLength) ? items.getLength() : 0, // items length if exists else zero
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
        var realbody = [];
        var atts = cmp.getAttributes();
        var items = atts.getValue("items");

        if (items && !items.isLiteral() && !items.isEmpty()) {
            $A.pushCreationPath("realbody");

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
            $A.popCreationPath("realbody");
        }
        
        return realbody;
    },
    
    createSelectiveComponentsForIndex: function(cmp, items, index, doForce, callback) {
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
        var forceServer = cmp.getAttributes().getValue("forceServer").getValue();
        var selectiveBodyCollector = {
            realBodyList: [],
            count: body.getLength(),
            cmp: cmp,
            callback: callback
        };
        cmp._currentSelectiveBodyCollector = selectiveBodyCollector;
        for (var j = 0; j < body.getLength(); j++) {
            var cdr = body.get(j);
            if (!ivp) {
                ivp = $A.expressionService.createPassthroughValue(extraProviders, cdr.valueProvider || atts.getValueProvider());
            }
            $A.setCreationPathIndex(j);
            $A.componentService.newComponentAsync(this, this.createSelectiveComponentsCallback(selectiveBodyCollector, j), cdr, ivp, false, false, forceServer);
        }
    },
    
    createSelectiveComponentsCallback: function(selectiveBodyCollector, index) {
        return function(newcmp) {
            selectiveBodyCollector.realBodyList[index] = newcmp;
            selectiveBodyCollector.count -= 1;
            if (selectiveBodyCollector.count === 0) {
                var accum = [];
                var rbl = selectiveBodyCollector.realBodyList;
                for (var i = 0; i < rbl.length; i++) {
                    accum.push(rbl[i]);
                }
                
                if (selectiveBodyCollector.cmp._currentSelectiveBodyCollector != selectiveBodyCollector) {
                    for (var j = 0; j < accum.length; j++) {
                        accum[j].destroy(true);
                    }
                    return;
                }
                selectiveBodyCollector.cmp._currentSelectiveBodyCollector = null;
                selectiveBodyCollector.callback(accum);
            }
        };
    },
    
    rerenderEverything: function(cmp) {
        this.createRealBody(cmp, false, function(newBody) {
            if (cmp.isValid()) {
                var realbody = cmp.getValue("v.realbody");
                realbody.destroy();
                realbody.setValue(newBody);
                cmp.getEvent("rerenderComplete").fire();
            }
        });
    },
    
    rerenderSelective: function(cmp) {
        // optimized for insert/remove/push. if this is called as a result of a setValue then anything could change
        var helper = this;
        var start = this.getStart(cmp);
        var end = this.getEnd(cmp);
        var atts = cmp.getAttributes();
        var items = atts.getValue("items");
        var realbody = atts.getValue("realbody");
        var body = atts.getValue("body");
        var bodyLen = body.getLength();
        if (!realbody.isEmpty()) {
            var exit = false;
            var varName = atts.get("var");
            var indexVar = atts.get("indexVar");
            var diffIndex = -1;
            var data;
            // look for a diff between the old items and the new items
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
                    var removed = cmparray.splice(i, bodyLen);
                    for (var k = 0; k < body.getLength(); k++) {
                        removed[k].destroy();
                    }
                    this.incrementIndices(cmparray, i, indexVar, -1, bodyLen);
                    realbody.setValue(cmparray);
                    this.createNewComponents(cmp, function(newcmps) {
                        if (exit === true) {
                            helper.rerenderEverything(cmp);
                        } else {
                            for (var j = 0; j < newcmps.length; j++) {
                                realbody.push(newcmps[j]);
                            }
                            cmp.getEvent("rerenderComplete").fire();
                        }
                    });
                } else {
                    // item was added, instantiate new cmp, re-number rest
                    this.incrementIndices(cmparray, i, indexVar, 1, bodyLen);
                    //var newcmp = this.createComponentsForIndex(cmp, items, diffIndex, false)[0];
                    this.createSelectiveComponentsForIndex(cmp, items, diffIndex, false, function(newcmps) {
                        if (exit === true) {
                            helper.rerenderEverything(cmp);
                        } else { // directly return
                            cmparray.splice.apply(cmparray, [i, 0].concat(newcmps));
                            if (end - start < cmparray.length/bodyLen) {
                                // now there is 1 too many, need to remove from the end
                                for (var j = 0; j < bodyLen; j++) {
                                    var endcmp = cmparray.pop();
                                    endcmp.destroy();
                                }
                            }
                            realbody.setValue(cmparray);
                            cmp.getEvent("rerenderComplete").fire();
                        }
                    });
                }               
            } else {
                this.createNewComponents(cmp, function(newcmps) {
                    if (exit === true) {
                        helper.rerenderEverything(cmp);
                    } else {
                        for (var j = 0; j < newcmps.length; j++) {
                            realbody.push(newcmps[j]);
                        }
                        cmp.getEvent("rerenderComplete").fire();
                    }
                });
            }
            exit = true;
        } else {
            this.rerenderEverything(cmp);
        }
    },

    incrementIndices: function(cmpArray, start, indexVar, change, bodyLen) {
        for (var i = start; i < cmpArray.length; (bodyLen ? i+=bodyLen : i++)) {
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
        if (value && value.auraType === "Value"){
            value = value.unwrap();
        }
        if (aura.util.isString(value)) {
            value = parseInt(value, 10);
        }
        return value;
    }
})
