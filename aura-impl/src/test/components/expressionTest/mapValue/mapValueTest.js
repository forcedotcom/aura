/*
 * Copyright (C) 2012 salesforce.com, inc.
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
        $A.test.assertEquals(value !== undefined ? value : component.getValue("v.map"), component._log[0].value, "unexpected value of change");
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


    /**
     * Unwrapping a map should give a primitive object
     *
     * This is from ArrayValue, and needs to be rewritten.
     */
    _testUnwrap: {
        test: function(component){
            var simval = $A.expressionService.create(null,"simplicity");
            var mapval = $A.expressionService.create(null,{go:"there"});
            var arrval = $A.expressionService.create(null,["quickly"]);
            var setval = $A.expressionService.create(null,[simval,mapval,arrval]);
            var val = setval.unwrap();
            $A.test.assertEquals(true, $A.util.isArray(val), "expected an array");
            $A.test.assertEquals(3, val.length, "expected 3 values");
            $A.test.assertEquals("string", typeof val[0], "wrong first value type");
            $A.test.assertEquals("simplicity", val[0], "wrong first value");
            $A.test.assertEquals("object", typeof val[1], "wrong second value type");
            $A.test.assertEquals("there", val[1].go, "wrong second value");
            $A.test.assertEquals(true, $A.util.isArray(val[2]), "expected an array value");
            $A.test.assertEquals(1, val[2].length, "wrong length for third value");
            $A.test.assertEquals("quickly", val[2][0], "wrong value in third value");
        }
    },

    /**
     * Test the on-change event.
     *
     * This test is from ArrayValue, and needs to be rewritten.
     */
    _testOnChange: {
        test: function(component){
            var array = component.getValue("v.array");

            $A.log("for setValue");
            array.setValue("anything");
            this.assertChangeEvent(component);

            $A.log("for item setValue");
            var val = array.getValue(0);
            val.setValue("something");
            this.assertChangeEvent(component, 0, val);

            $A.log("for insert");
            array.insert(0, "squeeze");
            this.assertChangeEvent(component);

              // TODO(W-1322739): change event not firing when array item is destroyed
//            $A.log("for destroy");
//            val.destroy();
//            this.assertChangeEvent(component, 1, val);

            $A.log("for clear");
            array.clear();
            this.assertChangeEvent(component);

            // SimpleValue
            val = $A.expressionService.create(null, "ooh");
            val.setValue("ahh");
            this.assertNoChangeEvent(component);

            $A.log("for pushing existing simple value");
            array.push(val);
            this.assertChangeEvent(component);

            $A.log("for updating existing simple value");
            val.setValue("wow");
            this.assertChangeEvent(component, 0, val);

            $A.log("for removing existing simple value");
            array.remove(0);
            this.assertChangeEvent(component);

            $A.log("for updating former simple value item");
            val.setValue("hmm");
            this.assertNoChangeEvent(component);

//            $A.log("for destroying existing simple value");
//            array.push(val);
//            this.assertChangeEvent(component);
//            val.destroy();
//            this.assertChangeEvent(component, 0, val);
//            array.clear();
//            this.assertChangeEvent(component);

            // ArrayValue
            val = $A.expressionService.create(null, ["circle"]);

            $A.log("for pushing existing array value");
            array.push(val);
            this.assertChangeEvent(component);

            $A.log("for updating existing array value with push");
            val.push("oval");
            this.assertChangeEvent(component, 0, val);

            $A.log("for updating existing array value with insert");
            val.insert(0, "ellipse");
            this.assertChangeEvent(component, 0, val);

            $A.log("for updating existing array value with remove");
            val.remove(1);
            this.assertChangeEvent(component, 0, val);

            $A.log("for updating existing array value with clear");
            val.clear();
            this.assertChangeEvent(component, 0, val);

            $A.log("for removing existing array value");
            array.remove(0);
            this.assertChangeEvent(component);

//            $A.log("for updating former array value item");
//            val.push("ellipse");
//            this.assertNoChangeEvent(component);

//            $A.log("for destroying existing array value");
//            array.push(val);
//            this.assertChangeEvent(component);
//            val.destroy();
//            this.assertChangeEvent(component, 0, val);

            // MapValue
            val = $A.expressionService.create(null, {"direction":"north"});
            val.put("distance","5km");
            this.assertNoChangeEvent(component);

            $A.log("for pushing existing map value");
            array.push(val);
            this.assertChangeEvent(component);

            $A.log("for updating existing map value with put");
            val.put("speed","20 kmph");
            this.assertChangeEvent(component, "speed", val.getValue("speed"));

            // TODO: update map with merge should fire change event

            $A.log("for removing existing map value");
            array.remove(0);
            this.assertChangeEvent(component);

            $A.log("for updating former map value item");
            val.put("load","2 tons");
            this.assertNoChangeEvent(component);

//            $A.log("for destroying existing map value");
//            array.push(val);
//            this.assertChangeEvent(component);
//            val.destroy();
//            this.assertChangeEvent(component, 0, val);

            $A.log("for clearing empty");
            array.clear();
            this.assertChangeEvent(component);
            array.clear();
            this.assertChangeEvent(component);
        }
    }

})
