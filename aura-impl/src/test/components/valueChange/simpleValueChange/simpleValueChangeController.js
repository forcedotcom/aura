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
    stringChange : function(cmp, evt){
                var val = (evt.getParam("value") === undefined)?'undefined':evt.getParam("value").getValue();
                cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
                cmp.find("value").getElement().innerHTML = val;
        $A.get("e.test:vote").setParams({candidate : 'string'}).fire();
    },

    mapChange : function(cmp, evt){
                var val = (evt.getParam("value") === undefined)?'undefined':evt.getParam("value").getValue();
                cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
                cmp.find("value").getElement().innerHTML = val;
        $A.get("e.test:vote").setParams({candidate : 'map'}).fire();
    },

    listChange : function(cmp, evt){
                var val = (evt.getParam("value") === undefined)?'undefined':evt.getParam("value").unwrap();
                cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
                cmp.find("value").getElement().innerHTML = val;
        $A.get("e.test:vote").setParams({candidate : 'list'}).fire();
    },

    recurseAChange : function(cmp, evt){
                var val = (evt.getParam("value") === undefined)?'undefined':evt.getParam("value").getValue();
                var depth = cmp.getValue("m.recurseADepth");

                cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
                cmp.find("value").getElement().innerHTML = val;
                depth.setValue(depth.getValue()+1);
                cmp.getValue("m.recurseA").setValue("recursing(A): "+depth.getValue());
                depth.setValue(depth.getValue()-1);
    },

        //
        // This is a ping-pong recursion with recurseCChange.
        //
    recurseBChange : function(cmp, evt){
                var val = (evt.getParam("value") === undefined)?'undefined':evt.getParam("value").getValue();
                var depth = cmp.getValue("m.recurseBDepth");

                cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
                cmp.find("value").getElement().innerHTML = val;
                depth.setValue(depth.getValue()+1);
                cmp.getValue("m.recurseC").setValue("recursing(B): "+depth.getValue());
                depth.setValue(depth.getValue()-1);
    },

        //
        // This is a ping-pong recursion with recurseBChange.
        //
    recurseCChange : function(cmp, evt){
                var val = (evt.getParam("value") === undefined)?'undefined':evt.getParam("value").getValue();
                var depth = cmp.getValue("m.recurseCDepth");

                cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
                cmp.find("value").getElement().innerHTML = val;
                depth.setValue(depth.getValue()+1);
                cmp.getValue("m.recurseB").setValue("recursing(C): "+depth.getValue());
                depth.setValue(depth.getValue()-1);
    },

        //
        // Chain a single change through to 'unchained'
        //
    chainedChange : function(cmp, evt){
                var val = (evt.getParam("value") === undefined)?'undefined':evt.getParam("value").getValue();

                cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
                cmp.find("value").getElement().innerHTML = val;
                cmp.getValue("m.unchained").setValue("finished");
    },

    unchainedChange : function(cmp, evt){
                var val = (evt.getParam("value") === undefined)?'undefined':evt.getParam("value").getValue();

                cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
                cmp.find("value").getElement().innerHTML = val;
    }
})
