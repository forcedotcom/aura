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
    assertChangeEvent: function(component, value){
        $A.test.assertTrue(undefined !== component._log, "change handler not invoked");
        $A.test.assertEquals(1, component._log.length, "unexpected number of change events recorded");
        this.assertEquivalent(value !== undefined ? value : component.get("v.map"), component._log[0].value, "unexpected value of change");
        component._log = undefined; // reset log
    },

    assertEquivalent: function(arg1, arg2, msg) {
        if (msg === undefined) {
            msg = "";
        } else {
            msg = msg + ": ";
        }
        var i;

        if (arg1 === undefined || arg2 === undefined) {
            $A.test.assertEquals(arg1, arg2, msg + "undefined in one but not both");
            return;
        }

        $A.test.assertEquals(arg1 instanceof Object, arg2 instanceof Object, msg + "objects should both be objects (or both not)");
        $A.test.assertEquals(arg1 instanceof Array, arg2 instanceof Array, msg + "objects should both be arrays (or both not)");
        if (arg1 instanceof Array) {
            $A.test.assertEquals(arg1.length, arg2.length, msg + "arrays have different lenghts");
            if (msg === "") {
                msg = "array";
            }
            for (i = 0; i < arg1.length; ++i) {
                this.assertEquivalent(arg1[i], arg2[i], msg + "[" + i + "]");
            }
        } else if (arg1 instanceof Object) {
            if (msg === "") {
                msg = "obj";
            }

            for (i in arg1) {
                if (typeof (arg2[i]) !== "function") {
                    $A.test.assertTrue(arg2.hasOwnProperty(i), msg + "[" + i + "] is not in second");
                    this.assertEquivalent(arg1[i], arg2[i], msg + "[" + i + "]");
                }
            }

            for (i in arg2) {
                if (typeof (arg1[i]) !== "function") {
                    $A.test.assertTrue(arg1.hasOwnProperty(i), msg + "[" + i + "] is not in first");
                }
            }
        } else {
            $A.test.assertEquals(arg1, arg2, msg);
        }
    },

    assertNoChangeEvent: function(component){
        $A.test.assertEquals(undefined, component._log);
    },

    calculateSize: function(map) {
        return $A.util.keys(map, true).length;
    },

    /**
     * Test getting a property reference from a MapValue.
     */
    //##$$ uncomment this line after halo changes are in master. Previouls used to fail because of W-1563175
    testGetWithPropertyReference:{
        test:function(component){

        	var newMap = component.find('htmlDiv').get('v.HTMLAttributes');
            try{
            	$A.test.assertTrue($A.util.isExpression(newMap["disabled"]));
                $A.test.assertEquals(false, newMap["disabled"].evaluate(), "failed to resolve propertyReferenceValue");
            }catch(e){
                $A.test.fail("Failed to resolve PropertyReferenceValues. Error :" + e);
            }
        }
    },

    /**
     * Setting map value to Map attribute type should use the provided value.
     */
    testSetMapValue: {
    	attributes:{ map : "{'do':'something','it':'the','right':'way'}" },
        test: [
            /*W-2251243, can we be intelligent about this
            // JF: HALO: Refactor this test case after halo work, the "halo" branch has the correct code
            function(component){ //Set value but new value is same as old value
           	   var mval = component.get("v.map");
           	   component.set("v.map", mval);
               this.assertNoChangeEvent(component);
            },*/
            function(component){ //Set value but new value's content is same as old value
                var oldMap = component.get("v.map");
                var setMap = this.clone(oldMap); // clone
                component.set("v.map", setMap);

                this.assertChangeEvent(component, setMap);
                var newMap = component.get("v.map");
                $A.test.assertEquals(3, this.calculateSize(newMap), "expected 3 values");
                $A.test.assertEquals("something", newMap["do"], "wrong first value");
                $A.test.assertEquals("the", newMap["it"], "wrong second value");
                $A.test.assertEquals("way", newMap["right"], "wrong third value");
            },function(component){ //Add new values to map and set attribute
	        	var oldMap = component.get("v.map");
	            oldMap["newKey"] = "newValue";
	            component.set("v.map",oldMap);

                this.assertChangeEvent(component, oldMap);
	            var newMap = component.get("v.map");
	            $A.test.assertTrue($A.util.isObject(newMap), "expected an Map");
	            $A.test.assertEquals(4, this.calculateSize(newMap), "expected 4 values");
	            $A.test.assertEquals("something", newMap["do"], "wrong first value");
	            $A.test.assertEquals("the", newMap["it"], "wrong second value");
	            $A.test.assertEquals("way", newMap["right"], "wrong third value");
	            $A.test.assertEquals("newValue", newMap["newKey"], "Map attribute not updated");
           }, function(component){ // Update map value - update value of a key
	       	    var oldMap =  component.get("v.map");
	       	    oldMap["newKey"] = "updatedValue"
	            component.set("v.map",oldMap);

	            this.assertChangeEvent(component, oldMap);
	            var newMap = component.get("v.map");
	            $A.test.assertEquals(4, this.calculateSize(newMap), "expected 4 values");
	            $A.test.assertEquals("updatedValue", newMap["newKey"], "wrong map value");
           }, function(component){ //Update map value - remove key
        	    var oldMap =  component.get("v.map");
	       	    delete oldMap["newKey"];
	       	    component.set("v.map",oldMap);

	            this.assertChangeEvent(component, oldMap);
	            var newMap = component.get("v.map");
	            $A.test.assertEquals(3, this.calculateSize(newMap), "expected 4 values");
	            $A.test.assertUndefined(newMap["newKey"]);
           }, function(component){ // Set to new map value
        	    var oldMap =  {"string":"something"};
	            component.set("v.map",oldMap);

	            this.assertChangeEvent(component, oldMap);
	            var newMap = component.get("v.map");
	            $A.test.assertTrue($A.util.isObject(newMap), "expected an Map");
	            $A.test.assertEquals(1, this.calculateSize(newMap), "expected 1 values");
	            $A.test.assertEquals("something", newMap["string"], "wrong map value");
           }]
    },

    /**
     * Setting a Map type attribute to a simple value that is not null should fail.
     */
    // JF: HALO: Component.set() does not alert when an attribute of type Object is being set to a non object
    //W-2251248
    _testSetSimpleValue: {
        test: function(component){
            var newValue = "simple string";
            var errMsg = "Expected exception from set(simpleValue)";
            try {
            	component.set("v.map", newValue);
                $A.test.fail(errMsg);
            } catch (e) {
            	if(e.message == errMsg){
            		$A.test.fail(errMsg);
            	}
            }
        }
    },

    /**
     * Setting a Map type attribute to a null value should clear the map.
     */
    testSetMapToNull: {
        test: function(component){
            // Set a default other than null
            component.set("v.map", undefined, true);

        	var oldMap = null;
            component.set("v.map", oldMap);

            this.assertChangeEvent(component, oldMap);
            var newMap = component.get("v.map")
            $A.test.assertNull(newMap);
        }
    },

    /**
     * Setting a Map type attribute to a simple value that is undefined should clear the map.
     */
    testSetMapToUndefined: {
        test: function(component){
            var oldMap = undefined;
            component.set("v.map", oldMap);

            this.assertChangeEvent(component, oldMap);
            var newMap = component.get("v.map")
            $A.test.assertUndefined(newMap);
        }
    },

    /**
     * This checks that change handlers on object key are fired after cmp.set
     */
    testMapSubkeyHandler: {
    	test: function(component) {
            $A.test.assertEquals(0, component.get("v.triggers.triggerCount"), "invalid initial triggerCount attribute");
            $A.test.assertUndefined(component._lastTriggerCount, "invalid initial _lastTriggerCount value");

            component.set("v.triggers.trigger", "one");
            $A.test.assertEquals(1, component._lastTriggerCount, "Replacing an object key didn't fire the object key change handler");

            component.set("v.triggers", { trigger: "dos", triggerCount: 27 });
            var triggerCount = component.get("v.triggers.triggerCount");
            $A.test.assertEquals(28, triggerCount, "Replacing an object didn't fire its object key change handler right after");
            $A.test.assertEquals(2, component._lastTriggerCount, "Replacing an object didn't fire its object key change handler right after");

            component.set("v.triggers.trigger", "san");
            $A.test.assertEquals(3, component._lastTriggerCount, "Replacing an object key didn't fire the object key change handler after the object was repaced");
        }
    },

    /**
     * This checks that change handlers on objects are fired after cmp.set
     */
    testMapHandler: {
    	test: function(component) {
            $A.test.assertUndefined(component._lastTrigger2Count, "invalid initial _lastTriggerCount value");
            $A.test.assertUndefined(component._noopCount, "invalid initial _noopCount value");

            component.set("v.triggers2.trigger", "one");
            $A.test.assertEquals(1, component._lastTrigger2Count, "Replacing an object key didn't fire the object key change handler");
            $A.test.assertEquals(1, component._noopCount, "Replacing an object key didn't fire the object change handler");

            component.set("v.triggers2", { trigger: "dos", triggerCount: 27 });
            $A.test.assertEquals(2, component._lastTrigger2Count, "Replacing an object didn't fire its object key change handler right after");
            $A.test.assertEquals(2, component._noopCount, "Replacing an object didn't fire its change handler right after");

            component.set("v.triggers2.trigger", "san");
            $A.test.assertEquals(3, component._lastTrigger2Count, "Replacing an object key didn't fire the object key change handler after the object was repaced");
            $A.test.assertEquals(3, component._noopCount, "Replacing an object key didn't fire the object change handler after the object was repaced");
        }
    },


    testMapModel : {
        test: function(component) {
            var map = component.get("m.map");
            $A.test.assertEquals(2, this.calculateSize(map), "expected 2 values");
        }
    },

    testMapServerAction : {
        test: function(component) {
            var a = component.get("c.echoMap");

            var map = component.get("m.map");
            a.setParams({ "map": map });

            var done = false;
            a.setCallback(this, function(a) {
                var newMap = a.getReturnValue();
                $A.test.assertEquals(2, this.calculateSize(newMap), "expected 2 values");
                done = true;
            });

            $A.run(function() { $A.enqueueAction(a); });
            $A.test.addWaitFor(true, function() { return done; });
        }
    },

    testSetNewSubmap: {
        attributes:{ map : "{'do':'something','it':'the','right':'way'}" },
        test: function(component) {

            var leaf = component.get("v.map.was.missing.foo");
            $A.test.assertUndefined(leaf);

            var map = component.get("v.map");
            $A.test.assertEquals(3, this.calculateSize(map), "expected 3 values");
            $A.test.assertUndefined(map.was);

            component.set("v.map.was.missing.foo", 17);
            leaf = component.get("v.map.was.missing.foo");
            $A.test.assertEquals(17, leaf);

            var submap = component.get("v.map.was");
            $A.test.assertTrue($A.util.isObject(submap), "expected object");
            $A.test.assertEquals(1, this.calculateSize(submap), "expected 1 values");
        }
    },

    testSetNewSubarray: {
        attributes:{ map : "{'do':'something','it':'the','right':'way'}" },
        test: function(component) {

            var leaf = component.get("v.map.was.0.foo");
            $A.test.assertUndefined(leaf);

            var map = component.get("v.map");
            $A.test.assertEquals(3, this.calculateSize(map), "expected 3 values");
            $A.test.assertUndefined(map.was);

            component.set("v.map.was.0.foo", 17);
            leaf = component.get("v.map.was.0.foo");
            $A.test.assertEquals(17, leaf);

            var subarray = component.get("v.map.was");
            $A.test.assertTrue($A.util.isArray(subarray), "expected array");
            $A.test.assertEquals(1, this.calculateSize(subarray), "expected 1 values");
        }
    },

    //Fails in Halo due to W-2256415, Setting new Maps as model values doesn't work. At least not similar to attributes
    _testMapSetValueRenders: {
        test: [ function(component) {
            var map = component.get("m.map");
            map["subkey"] = "put";
            component.set("m.map", map);
            // Insert a pause for re-rendering.  Put of a "new" key is CLEAN,
            // perhaps oddly, so it doesn't re-render:
            $A.test.addWaitFor("", function() {
            	var output = component.find("outputText");
                return $A.test.getText(output.getElement());
            });
        }, function(component) {
           var map = component.get("m.map");
            map["subkey"] = "put2";
            component.set("m.map", map);
            // Insert a pause for re-rendering.  Put of a "old" key is DIRTY,
            // in the usual "I've been changed" way, so it does re-render:
            $A.test.addWaitFor("put2", function() {
                var output = component.find("outputText");
                return $A.test.getText(output.getElement());
            });
        }, function(component) {
            var map = {"subKey": "set"};
            component.set("m.map", map);
            // Insert a pause for re-rendering.  SetValue leaves DIRTY child
            // objecst (W-1678810), so it does re-render.  Note that this also
            // tests our case-insensitivity.
            $A.test.addWaitFor("set", function() {
                var output = component.find("outputText");
                return $A.test.getText(output.getElement());
            });
        }, function(component) {
            // Checks case insensitivity
            var otherMap = $A.expressionService.create(null, { 'subkey' : "second" });
            component.set("m.map", otherMap);
            $A.test.addWaitFor("second", function() {
                var output = component.find("outputText");
                return $A.test.getText(output.getElement());
            });
        }
        ]
    },

    clone: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    }

})
