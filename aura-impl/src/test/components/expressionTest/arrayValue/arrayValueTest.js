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
        $A.test.assertEquals(value !== undefined ? value : component.getValue("v.array"), component._log[0].value, "unexpected value of change");
        component._log = undefined; // reset log
    },

    assertNoChangeEvent: function(component){
        $A.test.assertEquals(undefined, component._log);
    },
    
    testGetValue:{
	test:[function(component){
	    var aval = $A.expressionService.create(null, ["aa","bb", 1, 2]);
	    $A.test.assertEquals("ArrayValue", aval.toString());
	    $A.test.assertEquals(4, aval.getLength(), "expected 4 wrapped values");
	    //Special case for getValue()
	    $A.test.assertEquals(4, aval.getValue("length").getValue(), 
		    "getValue('length') failed to return value object representing length");
	    $A.test.assertEquals("aa", aval.getValue(0).getValue());
	    $A.test.assertEquals("bb", aval.getValue(1).getValue());
	    $A.test.assertEquals(1, aval.getValue(2).getValue());
	    $A.test.assertEquals(2, aval.getValue(3).getValue());
	},function(component){
	    var aval = $A.expressionService.create(null, []);
	    $A.test.assertEquals(0, aval.getLength(), "expected 0 wrapped values");
	    try{
		aval.getValue("");
		$A.test.fail("Array Value should not accept non integer argument in getValue()");
	    }catch(e){/*Expected*/}
	    try{
		aval.getValue({});
		$A.test.fail("Array Value should not accept non integer argument in getValue()");
	    }catch(e){/*Expected*/}
	    try{
		aval.getValue(undefined);
		$A.test.fail("Array Value should not accept non integer argument in getValue()");
	    }catch(e){
		$A.test.assertTrue(e.message.indexOf("A number is required for getValue on ArrayValue")!=-1)
	    }
	    //Index out of bounds
	    $A.test.assertUndefinedOrNull(aval.getValue(99))
	}]
    },
    testGetValueAcrossCommitAndRollback:{
	test:[function(cmp){
	    var aval = $A.expressionService.create(null, ["Banana"]);
	    $A.test.assertEquals("Banana", aval.getValue(0).getValue());
	    
	    //insert push remove
	    aval.insert(0,"Grapes")
	    $A.test.assertTrue(aval.isDirty());
	    $A.test.assertEquals("Grapes", aval.getValue(0).getValue());
	    
	    /*TODO: W-1611582 Insert changes to the actual array, instead it should markDirty() and then start adding the new stuff 
	     * aval.rollback();
	    $A.test.assertFalse(aval.isDirty());
	    $A.test.assertEquals("Banana", aval.getValue(0).getValue());*/
	}, function(cmp){
	    var aval = $A.expressionService.create(null, ["Rock"]);
	    aval.push("Jazz");
	    $A.test.assertTrue(aval.isDirty());
	    $A.test.assertEquals("Jazz", aval.getValue(1).getValue());
	    
	    aval.commit();
	    $A.test.assertFalse(aval.isDirty());
	    $A.test.assertEquals("Jazz", aval.getValue(1).getValue());
	    
	    aval.push("Blues");
	    $A.test.assertTrue(aval.isDirty());
	    $A.test.assertEquals("Blues", aval.getValue(2).getValue());
	    
/*	    TODO: W-1611582 Push to the actual array, instead it should markDirty() and then start adding the new stuff 
 * 	    aval.rollback();
	    $A.test.assertFalse(aval.isDirty());
	    $A.test.assertUndefinedOrNull(aval.getValue(2));
	    $A.test.assertEquals("Jazz", aval.getValue(1).getValue());
*/	    
	}]
    },

    /**
     * Setting array value to ArrayValue should use the provided value.
     */
    testSetValueArrayValue: {
        test: function(component){
            var aval = $A.expressionService.create(null, ["do","it","right"]);
            var setval = $A.expressionService.create(null, []);
            $A.test.assertEquals("ArrayValue", setval.toString());
            $A.test.assertEquals(0, setval.getLength());
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue(aval);
            $A.test.assertEquals("ArrayValue", setval.toString(), "expected an ArrayValue");
            $A.test.assertEquals(true, setval.isDirty(), "wrong dirty flag");
            $A.test.assertEquals(3, setval.getLength(), "expected 3 wrapped values");
            $A.test.assertEquals("do", setval.get(0), "wrong first value");
            $A.test.assertEquals("it", setval.get(1), "wrong second value");
            $A.test.assertEquals("right", setval.get(2), "wrong third value");
        }
    },

    /**
     * Setting array value to SimpleValue should wrap the value in a new ArrayValue.
     */
    testSetValueSimpleValue: {
        test: function(component){
            var sval = $A.expressionService.create(null, "simple string");
            var setval = $A.expressionService.create(null, []);
            $A.test.assertEquals("ArrayValue", setval.toString());
            $A.test.assertEquals(0, setval.getLength());
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue(sval);
            $A.test.assertEquals("ArrayValue", setval.toString(), "expected an ArrayValue");
            $A.test.assertEquals(true, setval.isDirty(), "wrong dirty flag");
            $A.test.assertEquals(1, setval.getLength(), "expected only 1 wrapped value");
            var innerval = setval.getValue(0);
            $A.test.assertEquals("SimpleValue", innerval.toString(), "expected the original SimpleValue");
            $A.test.assertEquals("simple string", innerval.getValue(), "wrong value");
        }
    },

    /**
     * Setting array value to MapValue should wrap the value in a new ArrayValue.
     */
    testSetValueMapValue: {
        test: function(component){
            var mval = $A.expressionService.create(null, {first:"worst",second:"best"});
            var setval = $A.expressionService.create(null, []);
            $A.test.assertEquals("ArrayValue", setval.toString());
            $A.test.assertEquals(0, setval.getLength());
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue(mval);
            $A.test.assertEquals("ArrayValue", setval.toString(), "expected an ArrayValue");
            $A.test.assertEquals(true, setval.isDirty(), "wrong dirty flag");
            $A.test.assertEquals(1, setval.getLength(), "expected only 1 wrapped value");
            var innerval = setval.getValue(0);
            $A.test.assertEquals("MapValue", innerval.toString(), "expected the original MapValue");
            $A.test.assertEquals("worst", innerval.get("first"), "wrong value of first inner mapping");
            $A.test.assertEquals("best", innerval.get("second"), "wrong value of second inner mapping");
        }
    },

    /**
     * Setting array value to a primitive should wrap the value in a new SimpleValue in a new ArrayValue.
     */
    testSetValuePrimitive: {
        test: function(component){
            var setval = $A.expressionService.create(null, []);
            $A.test.assertEquals("ArrayValue", setval.toString());
            $A.test.assertEquals(0, setval.getLength());
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue(6);
            $A.test.assertEquals("ArrayValue", setval.toString(), "expected an ArrayValue");
            $A.test.assertEquals(true, setval.isDirty(), "wrong dirty flag");
            $A.test.assertEquals(1, setval.getLength(), "expected only 1 wrapped value");
            var innerval = setval.getValue(0);
            $A.test.assertEquals("SimpleValue", innerval.toString(), "expected a SimpleValue");
            $A.test.assertEquals(6, innerval.unwrap(), "wrong value of inner");
            $A.test.assertEquals(6, setval.get(0), "wrong value");
        }
    },

    /**
     * Setting array value to a string should wrap the value in a new SimpleValue in a new ArrayValue.
     */
    testSetValueString: {
        test: function(component){
            var setval = $A.expressionService.create(null, []);
            $A.test.assertEquals("ArrayValue", setval.toString());
            $A.test.assertEquals(0, setval.getLength());
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue("goodie bag");
            $A.test.assertEquals("ArrayValue", setval.toString(), "expected an ArrayValue");
            $A.test.assertEquals(true, setval.isDirty(), "wrong dirty flag");
            $A.test.assertEquals(1, setval.getLength(), "expected only 1 wrapped value");
            var innerval = setval.getValue(0);
            $A.test.assertEquals("SimpleValue", innerval.toString(), "expected a SimpleValue");
            $A.test.assertEquals("goodie bag", innerval.unwrap(), "wrong value of inner");
            $A.test.assertEquals("goodie bag", setval.get(0), "wrong value");
        }
    },

    /**
     * Setting array value to an array of Values should return the values in a new ArrayValue.
     */
    testSetValueArrayOfValues: {
        test: function(component){
            var simval = $A.expressionService.create(null,"simplicity");
            var mapval = $A.expressionService.create(null,{go:"there"});
            var arrval = $A.expressionService.create(null,["quickly"]);
            var setval = $A.expressionService.create(null, []);
            $A.test.assertEquals("ArrayValue", setval.toString());
            $A.test.assertEquals(0, setval.getLength());
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue([simval,mapval,arrval]);
            $A.test.assertEquals("ArrayValue", setval.toString(), "expected an ArrayValue");
            $A.test.assertEquals(true, setval.isDirty(), "wrong dirty flag");
            $A.test.assertEquals(3, setval.getLength(), "expected 3 wrapped values");
            var val = setval.getValue(0);
            $A.test.assertEquals("SimpleValue", val.toString(), "first value not wrapped");
            $A.test.assertEquals("simplicity", val.unwrap(), "wrong first wrapped value");
            $A.test.assertEquals("simplicity", setval.get(0), "wrong first value");
            val = setval.getValue(1);
            $A.test.assertEquals("MapValue", val.toString(), "second value not wrapped");
            $A.test.assertEquals("there", val.get("go"), "wrong second value");
            val = setval.getValue(2);
            $A.test.assertEquals("ArrayValue", val.toString(), "third value not wrapped");
            $A.test.assertEquals(1, val.getLength(), "wrong length for third value");
            $A.test.assertEquals("quickly", val.get(0), "wrong value in third value");
        }
    },

    /**
     * Setting array value to an array should wrap the values in new Values in a new ArrayValue.
     */
    testSetValueArray: {
        test: function(component){
            var setval = $A.expressionService.create(null, []);
            $A.test.assertEquals("ArrayValue", setval.toString());
            $A.test.assertEquals(0, setval.getLength());
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue(["x",{y:"just because"},["z","end"]]);
            $A.test.assertEquals("ArrayValue", setval.toString(), "expected an ArrayValue");
            $A.test.assertEquals(true, setval.isDirty(), "wrong dirty flag");
            $A.test.assertEquals(3, setval.getLength(), "expected 3 wrapped values");
            var val = setval.getValue(0);
            $A.test.assertEquals("SimpleValue", val.toString(), "first value not wrapped");
            $A.test.assertEquals("x", val.unwrap(), "wrong first wrapped value");
            $A.test.assertEquals("x", setval.get(0), "wrong first value");
            val = setval.getValue(1);
            $A.test.assertEquals("MapValue", val.toString(), "second value not wrapped");
            $A.test.assertEquals("just because", val.get("y"), "wrong second value");
            val = setval.getValue(2);
            $A.test.assertEquals("ArrayValue", val.toString(), "third value not wrapped");
            $A.test.assertEquals(2, val.getLength(), "wrong length for third value");
            $A.test.assertEquals("z", val.get(0), "wrong first value in wrapped third value");
            $A.test.assertEquals("end", val.get(1), "wrong second value in wrapped third value");
        }
    },

    /**
     * Setting array value to a map should wrap the value in a new MapValue in a new ArrayValue.
     */
    testSetValueMap: {
        test: function(component){
            var setval = $A.expressionService.create(null, []);
            $A.test.assertEquals("ArrayValue", setval.toString());
            $A.test.assertEquals(0, setval.getLength());
            $A.test.assertEquals(false, setval.isDirty());
            setval.setValue({who:"col mustard",where:"study"});
            $A.test.assertEquals("ArrayValue", setval.toString(), "expected an ArrayValue");
            $A.test.assertEquals(true, setval.isDirty(), "wrong dirty flag");
            $A.test.assertEquals(1, setval.getLength(), "expected only 1 wrapped value");
            var innerval = setval.getValue(0);
            $A.test.assertEquals("MapValue", innerval.toString(), "expected the original MapValue");
            $A.test.assertEquals("col mustard", innerval.get("who"), "wrong value of first inner mapping");
            $A.test.assertEquals("study", innerval.get("where"), "wrong value of second inner mapping");
        }
    },

    /**
     * Setting array value to an array of Values should return the values in a new ArrayValue.
     */
    testUnwrap: {
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
     * Creating a Value with array values will wrap them as ArrayValues.
     */
    testCreateNestedArrayValue: {
        test: function(component){
            var root = $A.expressionService.create(null,{primary:[1,2],secondary:{first:["a",{inner:[null]}]}});
            var val = root.getValue("primary");
            $A.test.assertEquals("ArrayValue", val.toString());
            $A.test.assertEquals(2, val.getLength());
            $A.test.assertEquals(1, val.get(0));
            $A.test.assertEquals(2, val.get(1));
            val = root.getValue("secondary").getValue("first");
            $A.test.assertEquals(2, val.getLength());
            $A.test.assertEquals("a", val.get(0));
            val = val.getValue(1).getValue("inner");
            $A.test.assertEquals(1, val.getLength());
            $A.test.assertEquals(null, val.get(0));
        }
    },

    testPush: {
        test: function(component){
            var array = component.getValue("v.array");
            $A.test.assertEquals(0, array.getLength());

            // push onto empty array
            array.push("a simple value");
            $A.test.assertEquals(1, array.getLength());
            var val0 = array.getValue(0);
            $A.test.assertEquals("SimpleValue", val0.toString());
            $A.test.assertEquals("a simple value", val0.unwrap());
            this.assertChangeEvent(component);

            // push onto non-empty array
            array.push({somekey:"some value"});
            $A.test.assertEquals(2, array.getLength());
            $A.test.assertEquals(val0, array.getValue(0));
            var val1 = array.getValue(1);
            $A.test.assertEquals("MapValue", val1.toString());
            $A.test.assertEquals("some value", val1.get("somekey"));
            this.assertChangeEvent(component);

            // push again, why not?
            array.push(["first",true]);
            $A.test.assertEquals(3, array.getLength());
            $A.test.assertEquals(val0, array.getValue(0));
            $A.test.assertEquals(val1, array.getValue(1));
            var val2 = array.getValue(2);
            $A.test.assertEquals("ArrayValue", val2.toString());
            $A.test.assertEquals(2, val2.getLength());
            $A.test.assertEquals("first", val2.get(0));
            $A.test.assertEquals(true, val2.get(1));
            this.assertChangeEvent(component);

            // push a SimpleValue (shouldn't get wrapped)
            array.push(array.getValue(0));
            $A.test.assertEquals(4, array.getLength());
            var val = array.getValue(3);
            $A.test.assertEquals("SimpleValue", val.toString());
            $A.test.assertEquals("a simple value", val.unwrap());
            this.assertChangeEvent(component);

            // push null
            array.push(null);
            $A.test.assertEquals(5, array.getLength());
            val = array.getValue(4);
            $A.test.assertEquals("SimpleValue", val.toString());
            $A.test.assertEquals(null, val.unwrap());
            this.assertChangeEvent(component);

            // push undefined
            array.push(undefined);
            $A.test.assertEquals(6, array.getLength());
            val = array.getValue(5);
            $A.test.assertEquals("SimpleValue", val.toString());
            $A.test.assertEquals(undefined, val.unwrap());
            this.assertChangeEvent(component);

            array.push();
            $A.test.assertEquals(7, array.getLength());
            val = array.getValue(6);
            $A.test.assertEquals("SimpleValue", val.toString());
            $A.test.assertEquals(undefined, val.unwrap());
            this.assertChangeEvent(component);
        }
    },

    testInsert: {
        test: function(component){
            var array = component.getValue("v.array");
            $A.test.assertEquals(0, array.getLength());

            // insert below start of array (abs(neg index) > array.length)
            array.insert(-5, "a simple value");
            $A.test.assertEquals(0, array.getLength());
            this.assertNoChangeEvent(component);

            // insert above end of array
            array.insert(7, {somekey:"some value"});
            $A.test.assertEquals(1, array.getLength());
            var val1 = array.getValue(0);
            $A.test.assertEquals("MapValue", val1.toString());
            $A.test.assertEquals("some value", val1.get("somekey"));
            this.assertChangeEvent(component);

            // insert at head of array
            array.insert(0, ["first",true]);
            $A.test.assertEquals(2, array.getLength());
            var val2 = array.getValue(0);
            $A.test.assertEquals("ArrayValue", val2.toString());
            $A.test.assertEquals(2, val2.getLength());
            $A.test.assertEquals("first", val2.get(0));
            $A.test.assertEquals(true, val2.get(1));
            $A.test.assertEquals(val1, array.getValue(1));
            this.assertChangeEvent(component);

            // insert at end of array
            array.insert(array.getLength(), 4400);
            $A.test.assertEquals(3, array.getLength());
            $A.test.assertEquals(val2, array.getValue(0));
            $A.test.assertEquals(val1, array.getValue(1));
            var val3 = array.getValue(2);
            $A.test.assertEquals("SimpleValue", val3.toString());
            $A.test.assertEquals(4400, val3.unwrap());
            this.assertChangeEvent(component);

            // insert in middle of array
            array.insert(1, array.getValue(2));
            $A.test.assertEquals(4, array.getLength());
            $A.test.assertEquals(val2, array.getValue(0));
            var val4 = array.getValue(1);
            $A.test.assertEquals("SimpleValue", val4.toString());
            $A.test.assertEquals(4400, val4.unwrap());
            $A.test.assertEquals(val3, val4);
            $A.test.assertEquals(val1, array.getValue(2));
            $A.test.assertEquals(val3, array.getValue(3));
            this.assertChangeEvent(component);

            array.clear();
            component._log = undefined;

            // insert at string index
            array.insert("0", 0.0);
            $A.test.assertEquals(0, array.getLength());
            this.assertNoChangeEvent(component);

            // insert at boolean index
            array.insert(true, "boolean");
            $A.test.assertEquals(0, array.getLength());
            this.assertNoChangeEvent(component);

            // insert at array index
            array.insert([0,0], "array");
            $A.test.assertEquals(0, array.getLength());
            this.assertNoChangeEvent(component);

            // insert at map index
            array.insert({0:undefined}, "map");
            $A.test.assertEquals(0, array.getLength());
            this.assertNoChangeEvent(component);

            // insert at alpha index
            array.insert("apex", "string");
            $A.test.assertEquals(0, array.getLength());
            this.assertNoChangeEvent(component);

            // insert at null index
            array.insert(null, "null");
            $A.test.assertEquals(0, array.getLength());
            this.assertNoChangeEvent(component);

            // insert at undefined index
            array.insert(undefined, "undefined");
            $A.test.assertEquals(0, array.getLength());
            this.assertNoChangeEvent(component);

            // insert nothing (undefined)
            array.insert();
            $A.test.assertEquals(0, array.getLength());
            this.assertNoChangeEvent(component);

            // insert with negative index
            array.insert(-3, "negative");
            $A.test.assertEquals(0, array.getLength());
            this.assertNoChangeEvent(component);
        }
    },

    testRemove: {
        attributes : { array : "q,w,e,r" },
        test: function(component){
            var array = component.getValue("v.array");
            $A.test.assertEquals(4, array.getLength());
            $A.test.assertEquals("q", array.get(0));
            $A.test.assertEquals("w", array.get(1));
            $A.test.assertEquals("e", array.get(2));
            $A.test.assertEquals("r", array.get(3));

            // remove inner
            array.remove(2);
            $A.test.assertEquals(3, array.getLength());
            $A.test.assertEquals("q", array.get(0));
            $A.test.assertEquals("w", array.get(1));
            $A.test.assertEquals("r", array.get(2));
            this.assertChangeEvent(component);

            // remove head
            array.remove(0);
            $A.test.assertEquals(2, array.getLength());
            $A.test.assertEquals("w", array.get(0));
            $A.test.assertEquals("r", array.get(1));
            this.assertChangeEvent(component);

            // remove tail
            array.remove(1);
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals("w", array.get(0));
            this.assertChangeEvent(component);

            // remove last
            array.remove(0);
            $A.test.assertEquals(0, array.getLength());
            this.assertChangeEvent(component);

            array.push("something");
            $A.test.assertEquals(1, array.getLength());
            var val = array.getValue(0);
            component._log = undefined;

            // remove string index
            array.remove("0");
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals(val, array.getValue(0));
            this.assertNoChangeEvent(component);

            // remove boolean index
            array.remove(true);
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals(val, array.getValue(0));
            this.assertNoChangeEvent(component);

            // remove array index
            array.remove([0,0]);
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals(val, array.getValue(0));
            this.assertNoChangeEvent(component);

            // remove map index
            array.remove({0:undefined});
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals(val, array.getValue(0));
            this.assertNoChangeEvent(component);

            // remove negative index
            array.remove(-1);
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals(val, array.getValue(0));
            this.assertNoChangeEvent(component);

            // remove too large index
            array.remove(1);
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals(val, array.getValue(0));
            this.assertNoChangeEvent(component);

            // remove alpha index
            array.remove("apex");
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals(val, array.getValue(0));
            this.assertNoChangeEvent(component);

            // remove null index
            array.remove(null);
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals(val, array.getValue(0));
            this.assertNoChangeEvent(component);

            // remove undefined index
            array.remove(undefined);
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals(val, array.getValue(0));
            this.assertNoChangeEvent(component);

            // remove nothing (undefined)
            array.remove();
            $A.test.assertEquals(1, array.getLength());
            $A.test.assertEquals(val, array.getValue(0));
            this.assertNoChangeEvent(component);
        }
    },

    testOnChange: {
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
