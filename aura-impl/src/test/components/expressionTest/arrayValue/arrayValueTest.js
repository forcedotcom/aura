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
        this.assertEquivalent(value !== undefined ? value : component.get("v.first"), component._log[0].value, "unexpected value of change");
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
    
    testCreateArrayValue:{
        test:[function(component){
            var aval = $A.expressionService.create(null, ["aa","bb", 1, 2]);
            aval = aval.unwrap(); //##$$ Remove this line
            $A.test.assertTrue($A.util.isArray(aval));
            $A.test.assertEquals(4, aval.length, "expected 4 values");
            $A.test.assertEquals("aa", aval[0]);
            $A.test.assertEquals("bb", aval[1]);
            $A.test.assertEquals(1, aval[2]);
            $A.test.assertEquals(2, aval[3]);
        },function(component){
            var aval = $A.expressionService.create(null, []);
            aval = aval.unwrap(); //##$$ Remove this line
            $A.test.assertEquals(0, aval.length, "expected 0 values");
        }]
    },
    /**
     * Creating a Value with array values will wrap them as ArrayValues.
     */
    testCreateNestedArrayValue: {
        test: [function(component){
            var root = $A.expressionService.create(null, {primary:[1,2], secondary:{ first: ["a",{inner:[null]}] } } );
            root = root.unwrap(); //##$$ Remove this line
            var val = root["primary"];
            $A.test.assertTrue($A.util.isArray(val));
            $A.test.assertEquals(2, val.length);
            $A.test.assertEquals(1, val[0]);
            $A.test.assertEquals(2, val[1]);
            val = root["secondary"]["first"];
            $A.test.assertEquals(2, val.length);
            $A.test.assertEquals("a", val[0]);
            val = val[1]["inner"];
            $A.test.assertEquals(1, val.length);
            $A.test.assertEquals(null, val[0]);
        },function(component){
            var root = $A.expressionService.create(null, [[1,2,3], ["a","b","c","d"]]);
            root = root.unwrap(); //##$$ Remove this line
            $A.test.assertTrue($A.util.isArray(root));
            $A.test.assertEquals(2, root.length);
            var numbers = root[0];
            $A.test.assertTrue($A.util.isArray(numbers));
            $A.test.assertEquals(3, numbers.length);
            $A.test.assertEquals(1, numbers[0]);
            $A.test.assertEquals(2, numbers[1]);
            $A.test.assertEquals(3, numbers[2]);
            var alpha = root[1]
            $A.test.assertTrue($A.util.isArray(alpha));
            $A.test.assertEquals(4, alpha.length);
            $A.test.assertEquals("a", alpha[0]);
            $A.test.assertEquals("b", alpha[1]);
            $A.test.assertEquals("c", alpha[2]);
            $A.test.assertEquals("d", alpha[3]);
        }
        ]
    },
    /**
     * Setting array value to ArrayValue should use the provided value.
     */
    //TODO ##$$: RJ Refactor this test case after halo work, the "halo" branch has the correct code
    testSetArrayValue: {
        attributes : { first : "do,it,right" },
        test: [
        /* W-2251243, can we be intelligent about this
         * function(component){ //Set value but new value is same as old value
            var aval = component.get("v.first");
            component.set("v.first", aval);
            this.assertNoChangeEvent(component);
        },*/
         function(component){ //Set value but new value's content is same as old value
            var aval = component.get("v.first");
            var setval = $A.expressionService.create(null, []);
            setval = setval.unwrap(); //##$$ Remove this line
            $A.test.assertTrue($A.util.isArray(setval));
            $A.test.assertEquals(0, setval.length);
            setval = setval.concat(aval);
            component.set("v.first", setval);
            this.assertChangeEvent(component);
            var newValue = component.get("v.first"); 
            $A.test.assertEquals(3, newValue.length, "expected 3 values");
            $A.test.assertEquals("do", newValue[0], "wrong first value");
            $A.test.assertEquals("it", newValue[1], "wrong second value");
            $A.test.assertEquals("right", newValue[2], "wrong third value");
        },function(component){ //Set value and test
            var aval = component.get("v.first");
            var setval = $A.expressionService.create(null, ["first"]);
            setval = setval.unwrap(); //##$$ Remove this line
            setval = aval.concat(setval);
            component.set("v.first", setval);
            this.assertChangeEvent(component);
            var newValue = component.get("v.first"); 
            $A.test.assertEquals(4, newValue.length, "expected 4 values");
            $A.test.assertEquals("do", newValue[0], "wrong first value");
            $A.test.assertEquals("it", newValue[1], "wrong second value");
            $A.test.assertEquals("right", newValue[2], "wrong third value");
            $A.test.assertEquals("first", newValue[3], "wrong fourth value");
        },function(component){ //Set value in a event life cycle
            var aval = component.get("v.first");
            var setval = $A.expressionService.create(null, ["Panda"]);
            setval = setval.unwrap(); //##$$ Remove this line
            $A.run(function(){
                component.set("v.first", setval);
            });
            this.assertChangeEvent(component);
            var newValue = component.get("v.first"); 
            $A.test.assertEquals(1, newValue.length, "expected 1 values");
            $A.test.assertEquals("Panda", newValue[0], "wrong first value");
        },function(component){
            var setval = $A.expressionService.create(null, [{"key": "value"}, ["a", "b", "c"], {"nums":[1,2,3]}]);
            setval = setval.unwrap(); //##$$ Remove this line
            $A.run(function(){
                component.set("v.first", setval);
            })
            this.assertChangeEvent(component);
            var newValue = component.get("v.first"); 
            $A.test.assertEquals(3, newValue.length, "expected 3 values");
            $A.test.assertTrue($A.util.isObject(newValue[0]))
            $A.test.assertEquals("value", newValue[0]["key"], "wrong first value");
            
            $A.test.assertTrue($A.util.isArray(newValue[1]));
            $A.test.assertTrue((newValue[1][0] == "a")&&(newValue[1][1] == "b")&&(newValue[1][2] == "c") , "wrong second value");
            
            $A.test.assertTrue($A.util.isObject(newValue[2]));
            var innerArray = newValue[2]["nums"];
            $A.test.assertTrue($A.util.isArray(innerArray));
            $A.test.assertTrue((innerArray[0] == 1)&&(innerArray[1] == 2)&&(innerArray[2] == 3) , "wrong third value");
        },function(component){
            component.set("v.first", null);
            this.assertChangeEvent(component);
            var newValue = component.get("v.first"); 
            //$A.test.assertNull(newValue); ##$$ uncomment this line
            $A.test.assertTrue($A.util.isEmpty(newValue)); //##$$ Remove this line
        },function(component){
            component.set("v.first", undefined);
            this.assertChangeEvent(component);
            var newValue = component.get("v.first"); 
            //$A.test.assertUndefined(newValue); ##$$ uncomment this line
            $A.test.assertTrue($A.util.isEmpty(newValue)); //##$$ Remove this line
        }
        ]
    },

    /**
     * Setting array type attribute to simple data type.
     */
    //W-2251248, no validation for set()
    _testSetSimpleValue: {
        test: function(component){
            var sval = $A.expressionService.create(null, "simple string");
            component.set("v.first",sval);
            this.assertChangeEvent(component);
            
            var value = component.get("v.first");
            $A.test.assertTrue($A.util.isArray(value), "expected an ArrayValue");
            $A.test.assertEquals(1, value.length, "expected only 1 value");
            $A.test.assertEquals("simple string", value[0], "expected a string value");
        }
    },

    /**
     * Setting array value to MapValue should wrap the value in a new ArrayValue.
     */
    //W-2251248
    _testSetMapValue: {
        test: function(component){
            var mval = $A.expressionService.create(null, {first:"worst",second:"best"});
            component.set("v.first", mval);
            //Should fail
        }
    },
    testInsert: {
        attributes : { first : "1,2,3" },
        test: function(component){
            var array = component.get("v.first");
            $A.test.assertEquals(3, array.length);

            array.splice(2, 0, "A");
            component.set("v.first", array)
            this.assertChangeEvent(component);
            array = component.get("v.first");
            $A.test.assertEquals(4, array.length);
            $A.test.assertEquals("A", array[2]);
        }
    },

    testRemove: {
        attributes : { first : "q,w,e,r" },
        test: function(component){
            var array = component.get("v.first");
            $A.test.assertEquals(4, array.length);

            array.splice(2, 1);
            component.set("v.first", array)
            this.assertChangeEvent(component);
            array = component.get("v.first");
            $A.test.assertEquals(3, array.length);
            $A.test.assertEquals("r", array[2]);
        }
    },
    
    /*
     * test array length value change handler, 
     * also check assign one array attribute from value of another array attribute
     */
    testLength: {
        attributes: { first : "q, w",
                      second: "q2, w2" },
        test: [ function(cmp) {
                var newarray = ["q", "w", {"list": [1, 2, 3] }];
                cmp.set("v.first", newarray);

                var array = cmp.get("v.first");
                array[2].list[3] = 4;

                cmp.set("v.first", array);
                /* TODO: once wrapper is removed, get() will return the exact same object we set it to,
                 * so we can replace getValue() down there with get(), and things should work fine
                 * but now, get() returns a new array, which cannot be used for comparing
                var wrapper = cmp.getValue("v.first");
                // This should use the same wrapper object
                cmp.set("v.first", array);
                $A.test.assertEquals(wrapper, cmp.getValue("v.first"));
                */
                
                // This should NOT use the same wrapper, so later mutations
                // don't propagate here.
                cmp.set("v.second", array);
                array[2].list.push("last");
                array.push("tail");
                cmp.set("v.first",array);

                // Test those happened one place, but not the other
                $A.test.assertEquals("tail", cmp.get("v.first")[3], "expect v.first[3] to be tail");
                $A.test.assertEquals(3, cmp.get("v.second.length"), "expect v.second.length to be 3");
                $A.test.assertEquals("last", cmp.get("v.first")[2].list[4], "expect v.first[2].list[4] to be last");
                $A.test.assertEquals(5, cmp.get("v.first")[2].list.length, "expect v.first[2].list has length 5");
                $A.test.assertEquals(4, cmp.get("v.second")[2].list.length, "expect v.second[2].list has length 4");
            },
            function(cmp) {
                // Length handler fired (after commit)
                $A.test.assertEquals(4, cmp.get("v.firstArrayLen"), "expect v.firstArrayLen to be 4");

                // Length expressions rerendered
                var div = cmp.getElement();
                var actualText = $A.util.getText(div);
                $A.test.assertEquals("array.length=4, second.length=3.",
                    $A.util.trim(actualText), "unexpected text");
            }
        ]
    },
    
    
    /*
     * this is not working: W-2351693 
     * like first, second has array length value change handler, but it has NO array value change handlers.
     * also: if we do cmp.get("v.secondArrayLen.length") , the handler is called
     */
    _testLengthChangeHandlerSecond : {
    	test: function(cmp) {
    		cmp.set("v.second",[1,1,1,1]);
    		$A.test.assertEquals(cmp.get("v.secondArrayLen"), 4, "expect secondArrayLen to be 4")
    	}
    },
    
    /*
     *  Test nested component with array being passed in as attribute.
     *  we only check array length value change handler here, array content check is covered by 
     *  passByReferenceTest.testPassingListToFacet_ModifyOuter
     */
    testLengthInnerCmp: {
        attributes: { first : "1,2,3,4,5" },
        test: function(cmp) {
            var arrayInner = cmp.find("innerCmp").get("v.passedInArray");
            /* TODO: once wrapper is removed, get() will return the exact same object we set it to,
             * so we can replace getValue() down there with get(), and things should work fine
             * but now, get() returns a new array, which cannot be used for comparing
            var arrayInnerWrapped = cmp.find("innerCmp").getValue("v.passedInArray");
            */
            //sanity check
            $A.test.assertEquals(arrayInner.length, 5, "expect arrayInner has length 3 to start with");
            //TODO:$A.test.assertEquals(arrayInnerWrapped, cmp.getValue("v.first"),"expect arrayInner and v.first share the same wrapper");
            //change array
            var oldarr = cmp.get("v.first");
            var newNestedArr = ['a','b','c'];
            oldarr.push(newNestedArr);
            cmp.set("v.first",oldarr);
            arrayInner = cmp.find("innerCmp").get("v.passedInArray");
            $A.test.assertEquals(arrayInner.length, 6, "expect arrayInner has length 6");
            $A.test.assertEquals(cmp.find("innerCmp").get("v.passedInArrayLength"), 6,
                    "expect v.passedInArrayLength to be 6");
            $A.test.assertEquals(arrayInner[5].length, 3, "expect arrayInner[5] has length 3");
            /*TODO: arrayInnerWrapped = cmp.find("innerCmp").getValue("v.passedInArray");
            $A.test.assertEquals(arrayInnerWrapped,cmp.getValue("v.first"),
                    "again, expect arrayInner and v.first share same wrapper");*/
        }
    },

    /*
     * test set array value with value from model. this is not working because: W-2351693
     */
    testLengthArrayFromModel : {
        test: function(cmp) {
            //sanity check
            $A.test.assertEquals(cmp.get("v.firstArrayLen"), 0,
                    "expect v.firstArrayLen to be 0 to start with");
            $A.test.assertEquals(cmp.get("v.firstArrayLen.length"), 0,
                    "expect v.firstArrayLen.length to be 0 to start with");
            //fill in array from model : ["one","two","three"]
            cmp.set("v.first",cmp.get("m.StringList"));
            
            
            $A.test.assertEquals(cmp.get("v.firstArrayLen"), 3, "expect v.firstArrayLen to be updated to 3");
            
            var array = cmp.get("v.first");
            $A.test.assertEquals(array.length, 3);
            $A.test.assertEquals(array[2], "three", "expect array[2] to be \"three\"");
            $A.test.assertEquals(cmp.get("v.first.length"), 3, "expect v.first.length to be 3");
            
        }
    }

})
