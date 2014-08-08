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
        if (value instanceof Array) {
        	var actual = component._log[0].value;
        	$A.test.assertEquals(value.length, actual.length, "Unexpected value of change length mismatch");
        	for (var i = 0; i < value.length; i++) {
        		// Deal with nested-array support if and when we need it.
        		$A.test.assertEquals(value[i], actual[i], "Unexpected value of change at index " + i);
        	}
        } else {
        	// We punt on map support until we need it.
            $A.test.assertEquals(value, component._log[0].value, "unexpected value of change");
        }
        component._log = undefined; // reset log
    },

    assertNoChangeEvent: function(component){
        $A.test.assertEquals(undefined, component._log);
    },

    /**
     * Checking to see what version of the browser we are looking at and returning whether we are looking at IE7/8.
     * This is used mainly for $A.util.keys(...). The logic in it is different for IE7/8 vs all other browsers. A
     * fix for $A.util.keys was the best approach but was too risky, since people on SFDC were already using it incorrectly.
     * This approach will fix the test failures without causing additional test failures for everyone else that is using 
     * $A.util.keys(...)
     */
    isIE7_8 : function(){
    	var browser = $A.get("$Browser");
	    return browser.isIE7 || browser.isIE8;
    },
    
    calculateSize: function(map) {  	
        return $A.util.keys(map, !this.isIE7_8()).length;
    },
    
    /**
     * Verify creating map values.
     */
    //TODO ##$$: RJ Refactor this test case after halo work, the "halo" branch has the correct code
    //##$$ Remove this line
    //##$$ uncomment this line
    testCreateMapValue:{
		test: [function(component){
			    var mval = $A.expressionService.create(null, {"string":"something","integer":23,"boolean":true});
			    mval = mval.unwrap(); //##$$ Remove this line
	            $A.test.assertTrue($A.util.isObject(mval), "expected a map");
	            $A.test.assertEquals(3, this.calculateSize(mval), "expected 3 values");
	            $A.test.assertEquals("something", mval["string"], "expected string value");
	            $A.test.assertEquals(23, mval["integer"], "expected integer value");
	            $A.test.assertEquals(true, mval["boolean"], "expected boolean value");
	        },function(component){
	        	var mval = $A.expressionService.create(null, {});
	        	mval = mval.unwrap(); //##$$ Remove this line
	            $A.test.assertTrue($A.util.isObject(mval), "expected a empty map");
	            $A.test.assertEquals(0, this.calculateSize(mval), "expected 0 values");
	        }]
    },
    /**
     * Test getting a property reference from a MapValue.
     */
    //##$$ uncomment this line after halo changes are in master. Previouls used to fail because of W-1563175
    _testGetWithPropertyReference:{
        test:function(component){
        	$A.log(component.find('htmlDiv'));
        	var newMap = component.find('htmlDiv').get('v.HTMLAttributes');
            try{
            	$A.test.assertTrue($A.util.isExpression(newMap["disabled"]));
                $A.test.assertEquals(false, newMap["disabled"].evaluate(), "failed to resolve propertyChain");
            }catch(e){
                $A.test.fail("Failed to resolve PropertyChains. Error :" + e);
            }
        }
    },

    /**
     * Setting map value to Map attribute type should use the provided value.
     */
    //W-2310538
    _testSetMapValue: {
    	attributes:{
    		map : "{'do':'something','it':'the','right':'way'}"
    	},
        test: [
            /*W-2251243, can we be intelligent about this
            function(component){ //Set value but new value is same as old value
           	   var mval = component.get("v.map");
           	   component.set("v.map", mval);
               this.assertNoChangeEvent(component);
           },*/
           function(component){ //Add new values to map and set attribute
	        	var mval = component.get("v.map");
	            mval["newKey"] = "newValue";
	            component.set("v.map",mval);
	            this.assertChangeEvent(component, mval);
	            mval = component.get("v.map");
	            $A.test.assertTrue($A.util.isObject(mval), "expected an Map");
	            
	            $A.test.assertEquals(4, this.calculateSize(mval), "expected 4 values");
	            $A.test.assertEquals("something", mval["do"], "wrong first value");
	            $A.test.assertEquals("the", mval["it"], "wrong second value");
	            $A.test.assertEquals("way", mval["right"], "wrong third value");
	            $A.test.assertEquals("newValue", mval["newKey"], "Map attribute not updated");
           }, function(component){ // Update map value - update value of a key
	       	    var mval =  component.get("v.map");
	       	    mval["newKey"] = "updatedValue"
	            component.set("v.map",mval);
	            this.assertChangeEvent(component, mval);
	            mval = component.get("v.map");
	            $A.test.assertEquals(4, this.calculateSize(mval), "expected 4 values");
	            $A.test.assertEquals("updatedValue", mval["newKey"], "wrong map value");
           }, function(component){ //Update map value - remove key
        	    var mval =  component.get("v.map");
	       	    delete mval["newKey"];
	       	    component.set("v.map",mval);
	            this.assertChangeEvent(component, mval);
	            mval = component.get("v.map");
	            $A.test.assertEquals(3, this.calculateSize(mval), "expected 4 values");
	            $A.test.assertUndefined(mval["newKey"]);
           }, function(component){ // Set to new map value
        	    var mval =  $A.expressionService.create(null, {"string":"something"});
        	    mval = mval.unwrap(); //##$$ Remove this line
	            component.set("v.map",mval);
	            this.assertChangeEvent(component, mval);
	            mval = component.get("v.map");
	            $A.test.assertTrue($A.util.isObject(mval), "expected an Map");
	            $A.test.assertEquals(1, this.calculateSize(mval), "expected 1 values");
	            $A.test.assertEquals("something", mval["string"], "wrong map value");
           }]
    },
    
    /**
     * Setting a Map type attribute to a simple value that is not null should fail.
     */
    //W-2251248
    _testSetSimpleValue: {
        test: function(component){
            var sval = $A.expressionService.create(null, "simple string");
            var errMsg = "Expected exception from set(simpleValue)";
            try {
            	component.set("v.map", sval);
                $A.test.fail(errMsg);
            } catch (e) {
            	if(e.message == errMsg){
            		$A.test.fail(errMsg);
            	}
            }
        }
    },

    /**
     * Setting a Map type attribute to a simple value that is null should clear the map.
     */
    testSetSimpleValueNull: {
        test: function(component){
        	var sval = $A.expressionService.create(null, null);
            sval = sval.unwrap(); //##$$ Remove this line
            $A.test.assertNull(sval);
            component.set("v.map", sval);
            var map = component.get("v.map")
            $A.test.assertTrue($A.util.isObject(map)); //##$$ Remove this line
    		$A.test.assertEquals(0, $A.util.keys(map,  !this.isIE7_8()).length); //##$$ Remove this line
            //$A.test.assertNull(component.get("v.map")); ##$$ uncomment this line
        }
    },
    /**
     * Setting a Map type attribute to a simple value that is undefined should clear the map.
     */
    testSetSimpleValueUndefined: {
        test: function(component){
        	var sval = $A.expressionService.create(null);
        	sval = sval.unwrap(); //##$$ Remove this line
        	$A.test.assertUndefined(sval);
            component.set("v.map", sval);
            var map = component.get("v.map")
            $A.test.assertTrue($A.util.isObject(map)); //##$$ Remove this line
    		$A.test.assertEquals(0, $A.util.keys(map, !this.isIE7_8()).length); //##$$ Remove this line
            //$A.test.assertUndefined(component.get("v.map")) ##$$ uncomment this line
        }
    },

    /**
     * Tests what happens when one attribut is assigned to another.
     */
    testMapAssignment: {
        test: function(cmp) {
            cmp.set("v.triggers2", cmp.get("v.triggers"));
            cmp.set("v.triggers.triggerCount", 12);
            cmp.set("v.triggers2.nested.count", 7);
            $A.test.assertEquals(12, cmp.get("v.triggers.triggerCount"));
            $A.test.assertEquals(0, cmp.get("v.triggers.nested.count"));
            $A.test.assertEquals(0, cmp.get("v.triggers2.triggerCount"));
            $A.test.assertEquals(7, cmp.get("v.triggers2.nested.count"));
        }
    },

    /**
     * This checks that handlers on subvalues are preserved across MapValue.set[Value]
     */
    testMapSubkeyHandler: {
    	test: function(component) {
            $A.test.assertEquals(0, component.get("v.triggers.triggerCount"), "initial triggerCount attribute bad");
            $A.test.assertUndefined(component._lastTriggerCount, "initial state bad (has _lastTriggerCount)");
            component.set("v.triggers.trigger", "one");
            $A.test.assertEquals(1, component.get("v.triggers.triggerCount"), "first trigger didn't update attribute");
            $A.test.assertEquals(1, component._lastTriggerCount, "first trigger didn't update _lastTriggerCount");

            // If we replace the whole v.triggers map (which is really our test scenario),
            // we have a "correct" non-deterministic case: we're going to end up adding both
            // keys, including their handlers, so we can't know whether trigger gets added
            // and fired before or after triggerCount.  Fun and useful too, eh?  But that's
            // the spec-by-implementation, and I'm not changing it now....
            component.set("v.triggers", { trigger: "dos", triggerCount: 27 });
            var count = component.get("v.triggers.triggerCount");
            $A.test.assertTrue(27 == count // trigger count wasn't yet set when triggered, but was later
            		|| 28 == count, // or trigger count was set to "new" value
            		"bulk replace triggerCount wasn't either acceptable value (was " + count 
            		+ "), callback may have been lost");
            $A.test.assertEquals(2, component._lastTriggerCount,
            		"bulk replace _lastTriggerCount wasn't right, callback may have been lost");
            
            component.set("v.triggers.triggerCount", 2);  // Let's become sane again
            
            component.set("v.triggers.trigger", "san");
            $A.test.assertEquals(3, component.get("v.triggers.triggerCount"), "last trigger didn't update attribute, callback was lost?");
            $A.test.assertEquals(3, component._lastTriggerCount, "last trigger didn't update _lastTriggerCount, callback was lost?");
        }
    },

    /**
     * This checks that observers and map-level handlers on subvalues are also preserved
     * across MapValue.set[Value]
     */
    testMapSubkeyHandlerWithObserver: {
    	test: function(component) {
    		// Gangs v.observer and v.triggers2.trigger together; ensure that is tracked
    		component.getValue("v.observer").observe(component.getValue("v.triggers2.trigger"));

            $A.test.assertUndefined(component._lastTrigger2Count, "initial state bad (has _lastTrigger2Count)");
            $A.test.assertEquals("zero", component.get("v.observer"), "initial observer attribute bad");
            $A.test.assertUndefined(component._noopCount, "initial state bad (has _noopCount)");

            component.set("v.triggers2.trigger", "one");
            $A.test.assertEquals("one", component.get("v.observer"), "first trigger didn't update observer");
            $A.test.assertEquals(1, component._lastTrigger2Count, "first trigger didn't update _lastTrigger2Count");
            $A.test.assertEquals(1, component._noopCount, "first trigger didn't update _noopCount");

            // If we replace the whole v.triggers map (which is really our test scenario),
            // we have a "correct" non-deterministic case: we're going to end up adding both
            // keys, including their handlers, so we can't know whether trigger gets added
            // and fired before or after triggerCount.  Fun and useful too, eh?  But that's
            // the spec-by-implementation, and I'm not changing it now....
            component.set("v.triggers2", { trigger: "dos", triggerCount: 27 });
            $A.test.assertEquals("dos", component.get("v.observer"), "bulk replace didn't update observer");
            $A.test.assertEquals(2, component._lastTrigger2Count,
            		"bulk replace _lastTrigger2Count wasn't right, callback may have been lost");
            // TODO(fabbott): 5 is a bad number here.  It's right because (a) we still fire on leaf
            // nodes, not the map (2 leaves, 2 calls), and (b) we duplicated the map level handlers
            // when we preserved the leaf-level ones, because we can't tell the difference.  So
            // that's an extra 2 calls, for 4x instead of 1 call.
            $A.test.assertEquals(5, component._noopCount, "bulk replace didn't update _noopCount per leaf");
            
            component.set("v.triggers2.trigger", "san");
            $A.test.assertEquals("san", component.get("v.observer"), "last trigger didn't update observer");
            $A.test.assertEquals(3, component._lastTrigger2Count, "last trigger didn't update _lastTrigger2Count, callback was lost?");
            // TODO(fabbott): Similarly, 7 is bad.  It's purely the duplicated handler.
            $A.test.assertEquals(7, component._noopCount, "last trigger didn't update _noopCount per leaf");
        }
    },

    //
    // Check the map from the model, being absolutely sure to use Object.hasOwnProperty so that
    // we duplicate the JSON serializer behaviour.
    //
    checkMap : function(map, rawCount) {
        var count = 0;
        var k;
        $A.test.assertEquals("apple", map["fruit"], "result[fruit] should be apple");
        $A.test.assertEquals("bear", map["animal"], "result[animal] should be bear");
        for (k in map) {
            if (Object.prototype.hasOwnProperty.call(map, k)) {
                count += 1;
            }
        }
        $A.test.assertEquals(rawCount, count, "must have exactly " + rawCount + " properties");
        $A.test.assertEquals('{"fruit":"apple","animal":"bear"}', $A.util.json.encode(map));
    },

    testMapGet : {
        test: function(component) {
            var map = component.get("m.map");
            var a = component.get("c.echoMap");
            var done = false;
            // this includes the getSource functions.
            this.checkMap(map, 3);
            a.setParams({ "map": map });
            a.setCallback(this, function(a) {
            	// when we check here, the map is a simple map.
                this.checkMap(a.getReturnValue(), 2); done = true;
            });
            $A.run(function() { $A.enqueueAction(a); });
            $A.test.addWaitFor(true, function() { return done; });
        }
    },

    testSetNewSubmap: {
        test: function(component) {
           var leaf = component.get("m.map.was.missing.foo");
           $A.test.assertUndefined(leaf);
           var map = component.get("m.map");
           this.checkMap(map, 3);
           $A.test.assertUndefined(map.was);

           component.set("m.map.was.missing.foo", 17);
           leaf = component.get("m.map.was.missing.foo");
           $A.test.assertEquals(17, leaf);
           var submap = component.get("m.map.was");
           for (var key in submap) {
               if (!(submap[key] instanceof Function)) {
                   $A.test.assertEquals("missing", key);
               }
           }
           for (var key in submap.missing) {
               if (!(submap[key] instanceof Function)) {
                   $A.test.assertEquals("foo", key);
               }
           }
        }
    },
    
    //Fails in Halo due to W-2256415, Setting new Maps as model values doesn't work. At least not similar to attributes
    testMapSetValueRenders: {
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
    }
})
