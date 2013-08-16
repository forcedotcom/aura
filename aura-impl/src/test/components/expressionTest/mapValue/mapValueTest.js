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
    assertChangeEvent: function(component, index, value){
        $A.test.assertTrue(undefined !== component._log, "change handler not invoked");
        $A.test.assertEquals(1, component._log.length, "unexpected number of change events recorded");
        $A.test.assertEquals(index, component._log[0].index, "unexpected index of change");
        $A.test.assertEquals(value, component._log[0].value.unwrap(), "unexpected value of change");
        component._log = undefined; // reset log
    },

    assertNoChangeEvent: function(component){
        $A.test.assertEquals(undefined, component._log);
    },

    calculateSize: function(map) {
        var count = 0;

        map.each(function (k,v) {
            count += 1;
        })
        return count;
    },
    /**
     * Verify getVaue of map values.
     */
    testGetValue:{
	test: [function(component){
            var mval = $A.expressionService.create(null, {"string":"something","integer":23,"boolean":true});
            $A.test.assertEquals("MapValue", mval.toString(), "expected an MapValue");
            $A.test.assertEquals(3, this.calculateSize(mval), "expected 3 wrapped values");
            $A.test.assertEquals("SimpleValue", mval.getValue("string").toString(), "expected value object");
            $A.test.assertEquals("something", mval.getValue("string").getValue(), "expected string value");
            $A.test.assertEquals(23, mval.getValue("integer").getValue(), "expected integer value");
            $A.test.assertEquals(true, mval.getValue("boolean").getValue(), "expected boolean value");
        },function(component){
            var mval = $A.expressionService.create(null, {});
            $A.test.assertEquals("MapValue", mval.toString(), "expected an MapValue");
            $A.test.assertEquals(0, this.calculateSize(mval), "expected 0 wrapped values");
            //Non-existing key, will create a new key with an undefined value
            var temp = mval.getValue("foo");
            $A.test.assertDefined(temp);
            $A.test.assertUndefinedOrNull(temp.getValue(), "expected undefined when a non-existing key is used");
            //No Key
            try{
        	mval.getValue();
        	$A.test.fail("getValue cannot be called without a key")
            }catch(e){/*Expected*/}
            //Non string key TODO: W-1611590
            /*mval = $A.expressionService.create(null, {23:"bar"});
            var key = 23;
            $A.test.assertEquals("bar", mval.getValue(key).getValue(), "expected string value");*/
            try{mval.getValue(undefined); $A.test.fail("getValue cannot be called with an undefined key");}catch(e){}
            try{mval.getValue(""); $A.test.fail("getValue cannot be called with an empty key");}catch(e){}
        }
        ]
    },
    /**
     * Test getting a property reference from a MapValue.
     */
    // FIXME: W-1563175
    _testGetWithPropertyReference:{
        test:function(component){
            var newMap = component.find('htmlDiv').getAttributes().getValue('htmlattributes');
            $A.test.assertEquals("MapValue", newMap.toString());
            try{
                $A.test.assertEquals("false", newMap.get("disabled"), "failed to resolve propertyReferenceValue");
            }catch(e){
                $A.test.fail("Failed to resolve PropertyReferenceValues before setValue(). Error :" + e);
            }
        }
    },

    /**
     * Setting map value to MapValue should use the provided value.
     */
    testSetValueMapValue: {
        test: function(component){
            var mval = $A.expressionService.create(null, {"do":"something","it":"the","right":"way"});
            var setval = $A.expressionService.create(null, {});
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(0, this.calculateSize(setval));
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue(mval);
            $A.test.assertEquals("MapValue", setval.toString(), "expected an MapValue");
            $A.test.assertEquals(true, setval.isDirty(), "wrong dirty flag");
            $A.test.assertEquals(3, this.calculateSize(setval), "expected 3 wrapped values");
            $A.test.assertEquals("something", setval.get("do"), "wrong first value");
            $A.test.assertEquals("the", setval.get("it"), "wrong second value");
            $A.test.assertEquals("way", setval.get("right"), "wrong third value");
        }
    },
    /**
     * Setting a MapValue to a MapValue where the new map has some values which are PropertyReferenceValues.
     */
    testSetValueMapValueWithPropertyReferences:{
        test:function(component){
            var newMap = component.find('htmlDiv').getAttributes().getValue('htmlattributes');
            $A.test.assertEquals("MapValue", newMap.toString());
            var setval = $A.expressionService.create(component.find('htmlDiv'), {});
            try{
                setval.setValue(newMap);
            }catch(e){
                $A.test.fail("Failed to copy PropertyReferenceValues using setValue(). Error :" + e);
            }
            $A.test.assertEquals("MapValue", setval.toString(), "expected an MapValue");
            $A.test.assertEquals("true", setval.get("readonly"), "wrong first value");
            $A.test.assertEquals("PropertyReferenceValue", setval.getValue("disabled").toString(),
                "failed to copy propertyReferenceValue");
            //FIXME: W-1563175
            //try{
            //    $A.test.assertEquals("false", setval.get("disabled"), "failed to resolve propertyReferenceValue");
            //}catch(e){
            //  $A.test.fail("Failed to resolve PropertyReferenceValues after setValue(). Error :" + e);
            //}
        }
    },
    /**
     * Setting a MapValue to a simple value that is not null should fail.
     */
    testSetValueSimpleValue: {
        test: function(component){
            var sval = $A.expressionService.create(null, "simple string");
            var setval = $A.expressionService.create(null, {});
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(0, this.calculateSize(setval));
            $A.test.assertEquals(false, setval.isDirty());
            try {
                setval.setValue(sval);
                $A.test.fail("Expected exception from setValue(simpleValue)");
            } catch (e) {
            }
        }
    },

    /**
     * Setting a MapValue to a simple value that is null should clear the map.
     */
    testSetValueSimpleValueNull: {
        test: function(component){
            var sval = $A.expressionService.create(null, null);
            var setval = $A.expressionService.create(null, {"a":"b"});
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(1, this.calculateSize(setval));
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue(sval);
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(0, this.calculateSize(setval));
            $A.test.assertEquals(true, setval.isDirty());
        }
    },

    /**
     * Setting a MapValue to a simple value that is undefined should clear the map.
     */
    testSetValueSimpleValueUndefined: {
        test: function(component){
            var sval = $A.expressionService.create(null);
            $A.test.assertEquals(false, sval.isDefined(), "need an undefined simple value");
            var setval = $A.expressionService.create(null, {"a":"b"});
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(1, this.calculateSize(setval));
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue(sval);
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(0, this.calculateSize(setval));
            $A.test.assertEquals(true, setval.isDirty());
        }
    },

    /**
     * Setting a MapValue to an ArrayValue is not supported.
     */
    testSetValueArrayValue: {
        test: function(component){
            var aval = $A.expressionService.create(null, ["worst","best"]);
            var setval = $A.expressionService.create(null, {});
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(0, this.calculateSize(setval));
            $A.test.assertEquals(false, setval.isDirty());
            try {
                setval.setValue(aval);
                $A.test.fail("Expected exception from setValue(ArrayValue)");
            } catch (e) {
            }
        }
    },



    /**
     * Setting map value to a primitive null should reset the map.
     */
    testSetValuePrimitiveNull: {
        test: function(component){
            var setval = $A.expressionService.create(null, {"a":"b"});
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(1, this.calculateSize(setval));
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue(null);

            $A.test.assertEquals(undefined, setval.get("a"));
            $A.test.assertEquals(0, this.calculateSize(setval));
            $A.test.assertEquals(true, setval.isDirty());
        }
    },

    /**
     * Setting map value to a primitive undefined should reset the map.
     */
    testSetValuePrimitiveUndefined: {
        test: function(component){
            var setval = $A.expressionService.create(null, {"a":"b"});
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(1, this.calculateSize(setval));
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue();

            $A.test.assertEquals(undefined, setval.get("a"));
            $A.test.assertEquals(0, this.calculateSize(setval));
            $A.test.assertEquals(true, setval.isDirty());
        }
    },

    /**
     * Setting map value to a primitive map should wrap the values.
     *
     * This test tests a variety of nested objects. Note that behavior with a mix of
     * Values and unwrapped values is undefined. Don't do that.
     */
    testSetValuePrimitiveMap: {
        test: function(component){
            var setval = $A.expressionService.create(null, {});
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(0, this.calculateSize(setval));
            $A.test.assertEquals(false, setval.isDirty());

            setval.setValue({y:"just because","z":{"end":"now"}, "never":["a","b"]});
            $A.test.assertEquals("MapValue", setval.toString(), "expected a MapValue");
            $A.test.assertEquals(true, setval.isDirty(), "wrong dirty flag");
            $A.test.assertEquals(3, this.calculateSize(setval), "expected 2 wrapped values");

            var val = setval.getValue("y");
            $A.test.assertEquals("SimpleValue", val.toString(), "first value not wrapped");
            $A.test.assertEquals("just because", val.unwrap(), "wrong first wrapped value");
            $A.test.assertEquals("just because", setval.get("y"), "wrong first value");

            val = setval.getValue("z");
            $A.test.assertEquals("MapValue", val.toString(), "second value not wrapped");
            $A.test.assertEquals("now", val.get("end"), "wrong second value");

            val = setval.getValue("never");
            $A.test.assertEquals("ArrayValue", val.toString(), "third value not wrapped");
            $A.test.assertEquals(2, this.calculateSize(val), "wrong length for third value");
            $A.test.assertEquals("a", val.get(0), "wrong first value in wrapped third value");
            $A.test.assertEquals("b", val.get(1), "wrong second value in wrapped third value");
        }
    },

    testSetValueLiteral:{
        test:function(cmp){
            var setval = $A.expressionService.create(null, {});
            $A.test.assertEquals("MapValue", setval.toString());
            $A.test.assertEquals(0, this.calculateSize(setval));
            $A.test.assertEquals(false, setval.isDirty());
            try{
                setval.setValue("foo");
                $A.test.fail("Expected exception from setValue(String literals)");
            }catch(e){
                
            }
        }
    },
    /**
     * Unwrapping a map should give a primitive object
     *
     */
    testUnwrap: {
        test: function(component){
            var simval = $A.expressionService.create(null,"simplicity");
            var mapval = $A.expressionService.create(null,{go:"there"});
            var arrval = $A.expressionService.create(null,["quickly"]);
            var setval = $A.expressionService.create(null,{"simpleValue":simval,"mapValue":mapval,"arrayValue":arrval});
            var val = setval.unwrap();
            $A.test.assertEquals(true, $A.util.isObject(val), "expected a map");
            $A.test.assertEquals(3, $A.test.objectKeys(val).length, "expected 3 values");
            $A.test.assertEquals("string", typeof val["simpleValue"], "wrong first value type");
            $A.test.assertEquals("simplicity", val["simpleValue"], "wrong first value");
            $A.test.assertEquals("object", typeof val["mapValue"], "wrong second value type");
            $A.test.assertEquals("there", val["mapValue"].go, "wrong second value");
            $A.test.assertEquals(true, $A.util.isArray(val["arrayValue"]), "expected an array value");
            $A.test.assertEquals(1, val["arrayValue"].length, "wrong length for third value");
            $A.test.assertEquals("quickly", val["arrayValue"][0], "wrong value in third value");
        }
    },

    /**
     * Test the on-change event.
     *
     * This test is from ArrayValue, and needs to be rewritten.
     */
    testOnChange: {
        test: [function(component){
            var map = component.getValue("m.map");
            component._log = undefined;
        },function(component){
            var map = component.getValue("m.map");
            $A.log("for setValue");
            map.setValue({"juice":"jamba"});
            this.assertChangeEvent(component, "juice", "jamba");

            $A.log("for item setValue");
            var val = map.getValue("juice");
            val.setValue("something");
            this.assertChangeEvent(component, "juice", "something");

            $A.log("for put");
            map.put("bagel", "noah");
            this.assertChangeEvent(component, "bagel", "noah");
            
            // TODO(W-1322739): change event not firing when map entry is destroyed
//            $A.log("for destroy");
//            val.destroy();
//            this.assertChangeEvent(component, 1, val);

            $A.log("for updating value object of existing key")
            val = $A.expressionService.create(null, "costco");
            val.setValue("kirkland");
            this.assertNoChangeEvent(component);

            $A.log("for updating existing key with a new value object");
            map.put("bagel", val);
            this.assertChangeEvent(component, "bagel", val);
            
            $A.log("for updating existing simple value of a key");
            val.setValue("Sarah Lee");
            this.assertNoChangeEvent(component);

            // MapValue
            //var newMap = $A.expressionService.create(null, {"Banana":"Del Monte"});
            //$A.log("for merging new map");
            //map.merge(newMap);
            //TODO W-1562377 - No Change event for merging new map
            //this.assertChangeEvent(component);

            //$A.log("for updating new map value with setValue");
            //newMap.setValue({"Oranges":"Florida"});
            //TODO W-1562377: Doesn't really update the original map, since merge() does a copy
            //this.assertChangeEvent(component, "Orange", "Florida");
        }]
    },

    testMapSetValueRenders: {
        test: [ function(component) {
            var map = component.getValue("m.map");
            map.put("subkey", "put");
            // Insert a pause for re-rendering.  Put of a "new" key is CLEAN,
            // perhaps oddly, so it doesn't re-render:
            $A.test.addWaitFor("", function() {
                var output = component.find("outputText");
                return $A.test.getText(output.getElement());
            });
        }, function(component) {
           var map = component.getValue("m.map");
            map.put("subkey", "put2");
            // Insert a pause for re-rendering.  Put of a "old" key is DIRTY,
            // in the usual "I've been changed" way, so it does re-render:
            $A.test.addWaitFor("put2", function() {
                var output = component.find("outputText");
                return $A.test.getText(output.getElement());
            });
        }, function(component) {
            var map = component.getValue("m.map");
            map.setValue({"subkey": "set"});
            // Insert a pause for re-rendering.  SetValue leaves DIRTY child
            // objecst (W-1678810), so it does re-render:
            $A.test.addWaitFor("set", function() {
                var output = component.find("outputText");
                return $A.test.getText(output.getElement());
            });
        }
        ]
    },

    /**
     * Tests that values cross-propagate "as expected."  Note that I'm not
     * convinced this is good, but it tests our actual behavior as of 25jul2013.
     */
    testCrossPropagation: {
        test: function(component){
            var mockGlobalId = 0;
            var leafCounts = { 'simple': 0, 'map': 0, 'array': 0 };

            var simval = $A.expressionService.create(null, 180);
            simval.addHandler({'eventName': 'change',
                    'method': function(e) { leafCounts['simple']++; },
                    'globalId': mockGlobalId++,
                });

            var submap = $A.expressionService.create(null, {"magnitude": 10, "units": "mph"});
            // TODO(fabbott): I'd like to add handlers on all the collections (leaf, mapval, copymap),
            // but they want not a "method" function but an "actionExpression," which is proving hard
            // to formulate.  Probably just because I need sleep, but for now I'm punting.

            var subarray = $A.expressionService.create(component, ['amy', 'bob']);

            var mapval = $A.expressionService.create(component,{"heading": simval, "speed": submap,
                "passengers": subarray});

            // Subvalues should be shared (which implies their handlers, etc. are shared!).
            $A.test.assertEquals(simval, mapval.getValue('heading'));
            $A.test.assertEquals(submap, mapval.getValue('speed'));
            $A.test.assertEquals(subarray, mapval.getValue('passengers'));

            var copymap = $A.expressionService.create(component, {'heading': 'north',
                'speed': { 'magnitude': 5, 'precision': 2}, passengers: []});
            // Ditto the mapval handler comment here: can't get actionExpression to cooperate.
            copymap.setValue(mapval);

            // These subvalues are also shared.
            $A.test.assertEquals(simval, copymap.getValue('heading'));
            $A.test.assertEquals(submap, copymap.getValue('speed'));
            $A.test.assertEquals(subarray, copymap.getValue('passengers'));

            // Changehandlers should chain, as should value changes (since the object is identical).
            mapval.getValue('heading').setValue('south');
            $A.test.assertEquals('south', simval.getValue());
            $A.test.assertEquals('south', mapval.get('heading'));
            $A.test.assertEquals('south', copymap.get('heading'));
            $A.test.assertEquals(1, leafCounts['simple']);

            mapval.getValue('speed').put('units', 'kph');
            $A.test.assertEquals('kph', submap.get('units'));
            // and new members of a shared thing are shared:
            submap.put('precision', 20);
            $A.test.assertEquals(20, mapval.getValue('speed').get('precision'));
            $A.test.assertEquals(20, copymap.getValue('speed').get('precision'));

            mapval.getValue('passengers').getValue(1).setValue('bill');
            $A.test.assertEquals('bill', subarray.get(1));
            $A.test.assertEquals('bill', mapval.get('passengers')[1]);
            $A.test.assertEquals('bill', copymap.get('passengers')[1]);
            // And, again, for new items:
            subarray.push('cathy');
            $A.test.assertEquals('cathy', subarray.get(2));
            $A.test.assertEquals('cathy', mapval.get('passengers')[2]);
            $A.test.assertEquals('cathy', copymap.get('passengers')[2]);

            // But new keys in the two top maps are NOT shared:
            mapval.put("extra", 4);
            $A.test.assertEquals(undefined, copymap.get('extra'));
        }
    },


})
