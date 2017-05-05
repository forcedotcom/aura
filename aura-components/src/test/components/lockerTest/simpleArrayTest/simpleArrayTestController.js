({
    testFilteringOfArrayOfObjects: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var obj1 = {
            arr: [{
                prop: 'abc'
            }]
        };
        component.set("v.wrapUnwrapTestObj", obj1);
        var obj2 = component.get("v.wrapUnwrapTestObj");
        var obj3 = {prop: 'xyz'};

        obj2.arr[0] = obj3;
        testUtils.assertEquals(obj3.prop, obj2.arr[0].prop, "Array entry assignment: properties should be same");

        obj2.arr[0].prop = "jkl"; // This assignment works
        testUtils.assertEquals("jkl", obj2.arr[0].prop, "Object property assignment: properties should be same");

        var obj4 = {
            arr: [{team: 'Giants'}, {team: 'Raiders'}, {team: 'Warriors'}]
        }
        component.set("v.wrapUnwrapTestObj", obj4);
        var obj2 = component.get("v.wrapUnwrapTestObj");
        testUtils.assertEquals('Raiders', obj2.arr[1].team, "Reading array entry value before assignment");
        obj2.arr[1] = {team: 'Athletics'}
        testUtils.assertEquals('Athletics', obj2.arr[1].team, "Failed to reassign value in the middle of array");
        testUtils.assertEquals('Warriors', obj2.arr[2].team, "Rest of the array not intact");

        obj2.arr = [1, 2, 3];
        helper.verifyArrayElements(testUtils, [1, 2, 3], obj2.arr);

        obj2.arr[0] = 0; // Manipulate first element
        helper.verifyArrayElements(testUtils, [0, 2, 3], obj2.arr);

        obj2.arr[6] = 6; // Assign a large index and verify array is padded with undefined
        helper.verifyArrayElements(testUtils, [0, 2, 3, undefined, undefined, undefined, 6], obj2.arr);

        obj2.arr[5] = 5; // assign the newly created index
        helper.verifyArrayElements(testUtils, [0, 2, 3, undefined, undefined, 5, 6], obj2.arr);
    },

    testArrayProperties: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var obj1 = {
            arr: []
        };
        component.set("v.wrapUnwrapTestObj", obj1);
        var testObj = component.get("v.wrapUnwrapTestObj");
        testUtils.assertTrue(Array.isArray(testObj.arr), "Proxy failed to pass Array.isArray() test");
        testUtils.assertEquals(0, testObj.arr.length);

        var obj2 = {
            arr: [11, 12, 13]
        };
        component.set("v.wrapUnwrapTestObj", obj2);
        testObj = component.get("v.wrapUnwrapTestObj");
        testUtils.assertEquals(3, testObj.arr.length);

        testObj.arr = [1, 2, 3];
        helper.verifyArrayElements(testUtils, [1, 2, 3], testObj.arr);

        var properties = [];
        for (var prop in testObj.arr) {
            properties.push(prop);
        }
        helper.verifyArrayElements(testUtils, ["0", "1", "2"], properties);
    },

    testArrayPop: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var expected = [1, 2, 3, 4];
        var obj1 = {
            arr: expected
        };
        component.set("v.wrapUnwrapTestObj", obj1);

        var testObj = component.get("v.wrapUnwrapTestObj");
        testUtils.assertEquals(4, testObj.arr.length);

        var popped = testObj.arr.pop();
        testUtils.assertEquals(4, popped);
        helper.verifyArrayElements(testUtils, [1, 2, 3], testObj.arr);


        component.set("v.wrapUnwrapTestAtt", []);
        testObj = component.get("v.wrapUnwrapTestAtt");
        testUtils.assertUndefined(testObj.pop());
    },

    testArrayPush: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var expected = [1, 2, 3, 4];
        var obj1 = {
            arr: expected
        };
        component.set("v.wrapUnwrapTestObj", obj1);

        // Intentionally copying array into local variable as reference
        var testArr = component.get("v.wrapUnwrapTestObj").arr;

        testUtils.assertEquals(4, testArr.push()); // Verify length did not change
        testUtils.assertEquals(5, testArr.push(undefined)); // Verify length did not change
        testUtils.assertUndefined(testArr[4]);
        testArr.pop(); // get the undefined out of the array

        testUtils.assertEquals(5, testArr.push(41), "Failed to push a single item");
        helper.verifyArrayElements(testUtils, [1, 2, 3, 4, 41], testArr);

        testUtils.assertEquals(7, testArr.push(42, 43), "Failed to push multiple items");
        helper.verifyArrayElements(testUtils, [1, 2, 3, 4, 41, 42, 43], testArr);

        testUtils.assertEquals(9, Array.prototype.push.apply(testArr, [44, 45]), "Failed to merge arrays");
        helper.verifyArrayElements(testUtils, [1, 2, 3, 4, 41, 42, 43, 44, 45], testArr);
    },

    testArrayReverse: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var obj1 = {
            arr: []
        };
        component.set("v.wrapUnwrapTestObj", obj1);

        var testObj = component.get("v.wrapUnwrapTestObj");
        helper.verifyArrayElements(testUtils, [], testObj.arr);
        Array.prototype.push.apply(testObj.arr, [1, 2, 3, 4])
        helper.verifyArrayElements(testUtils, [4, 3, 2, 1], testObj.arr.reverse()); // Verify return value of reverse()
        helper.verifyArrayElements(testUtils, [4, 3, 2, 1], testObj.arr); // Verify the actual array has also been reversed
    },

    testArrayShift: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var expected = [1, 2, 3, 4];
        var obj1 = {
            arr: expected
        };
        component.set("v.wrapUnwrapTestObj", obj1);

        var testObj = component.get("v.wrapUnwrapTestObj");
        var item = testObj.arr.shift();
        testUtils.assertEquals(1, item);
        helper.verifyArrayElements(testUtils, [2, 3, 4], testObj.arr);


        component.set("v.wrapUnwrapTestAtt", []);
        testObj = component.get("v.wrapUnwrapTestAtt");
        testUtils.assertUndefined(testObj.shift());
    },

    testArrayUnshift: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var expected = [1, 2, 3, 4];
        var obj1 = {
            arr: expected
        };
        component.set("v.wrapUnwrapTestObj", obj1);

        var testObj = component.get("v.wrapUnwrapTestObj");
        testUtils.assertEquals(4, testObj.arr.unshift());
        helper.verifyArrayElements(testUtils, [1, 2, 3, 4], testObj.arr);

        testUtils.assertEquals(5, testObj.arr.unshift(0));
        helper.verifyArrayElements(testUtils, [0, 1, 2, 3, 4], testObj.arr);

        testUtils.assertEquals(7, testObj.arr.unshift(-2, -1));
        helper.verifyArrayElements(testUtils, [-2, -1, 0, 1, 2, 3, 4], testObj.arr);
    },

    testArraySort: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var expected = [1, 3, 2, 4];
        var obj1 = {
            arr: expected
        };
        component.set("v.wrapUnwrapTestObj", obj1);

        var testObj = component.get("v.wrapUnwrapTestObj");
        helper.verifyArrayElements(testUtils, [1, 2, 3, 4], testObj.arr.sort());
        helper.verifyArrayElements(testUtils, [1, 2, 3, 4], testObj.arr);
        function descendingSort(a, b) {
            return b - a;
        }

        helper.verifyArrayElements(testUtils, [4, 3, 2, 1], testObj.arr.sort(descendingSort));
        helper.verifyArrayElements(testUtils, [4, 3, 2, 1], testObj.arr);
    },

    testArraySplice: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var expected = ['a', 'b', 'c', 'd'];
        var obj1 = {
            arr: expected
        };

        function resetArray() {
            testObj.arr = ['a', 'b', 'c', 'd'];
        }

        component.set("v.wrapUnwrapTestObj", obj1);

        var testObj = component.get("v.wrapUnwrapTestObj");
        // Inserting elements
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(2, 0, 'z'));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'z', 'c', 'd'], testObj.arr);

        resetArray()
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(0, 0, 'y'));
        helper.verifyArrayElements(testUtils, ['y', 'a', 'b', 'c', 'd'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(4, 0, 'x')); // start = length of array
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c', 'd', 'x'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(5, 0, 'w')); // start = length of array + 1
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c', 'd', 'w'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(10, 0, 'w'));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c', 'd', 'w'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(-10, 0, 'w'));
        helper.verifyArrayElements(testUtils, ['w', 'a', 'b', 'c', 'd'], testObj.arr);

        // Removing elements
        resetArray();
        helper.verifyArrayElements(testUtils, ['c'], testObj.arr.splice(2, 1));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'd'], testObj.arr);

        resetArray()
        helper.verifyArrayElements(testUtils, ['a'], testObj.arr.splice(0, 1));
        helper.verifyArrayElements(testUtils, ['b', 'c', 'd'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(4, 1));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c', 'd'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(5, 1));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c', 'd'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, ['c', 'd'], testObj.arr.splice(2, 2));
        helper.verifyArrayElements(testUtils, ['a', 'b'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c', 'd'], testObj.arr.splice(0, 4));
        helper.verifyArrayElements(testUtils, [], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, ['d'], testObj.arr.splice(-1, 1));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c'], testObj.arr);

        // Removing and adding elements
        resetArray();
        helper.verifyArrayElements(testUtils, ['c'], testObj.arr.splice(2, 1, 'z'));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'z', 'd'], testObj.arr);

        resetArray()
        helper.verifyArrayElements(testUtils, ['a'], testObj.arr.splice(0, 1, 'y'));
        helper.verifyArrayElements(testUtils, ['y', 'b', 'c', 'd'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(4, 1, 'x'));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c', 'd', 'x'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(5, 1, 'w'));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c', 'd', 'w'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, [], testObj.arr.splice(10, 1, 'w'));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c', 'd', 'w'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, ['a'], testObj.arr.splice(-10, 1, 'w'));
        helper.verifyArrayElements(testUtils, ['w', 'b', 'c', 'd'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, ['c', 'd'], testObj.arr.splice(2, 2, 'x', 'y'));
        helper.verifyArrayElements(testUtils, ['a', 'b', 'x', 'y'], testObj.arr);

        resetArray();
        helper.verifyArrayElements(testUtils, ['a', 'b', 'c', 'd'], testObj.arr.splice(0, 4, 'x', 'y'));
        helper.verifyArrayElements(testUtils, ['x', 'y'], testObj.arr);
    },

    testArrayAccessorMethods: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var obj1 = {
            arr: [1, 2, 3, 4]
        };
        component.set("v.wrapUnwrapTestObj", obj1);
        var testObj = component.get("v.wrapUnwrapTestObj");
        helper.verifyArrayElements(testUtils, [1, 2, 3, 4, 11, 12, 13, 14], testObj.arr.concat([11, 12, 13, 14]));

        var obj2 = {
            arr: ['Wind', 'Rain', 'Fire']
        };
        component.set("v.wrapUnwrapTestObj", obj2);
        testObj = component.get("v.wrapUnwrapTestObj");

        testUtils.assertEquals("Wind,Rain,Fire", testObj.arr.join());
        testUtils.assertEquals("Wind, Rain, Fire", testObj.arr.join(', '));
        testUtils.assertEquals("Wind + Rain + Fire", testObj.arr.join(' + '));
        testUtils.assertEquals("WindRainFire", testObj.arr.join(''));
        helper.verifyArrayElements(testUtils, ['Wind', 'Rain', 'Fire'], testObj.arr);

        helper.verifyArrayElements(testUtils, ['Rain', 'Fire'], testObj.arr.slice(1, 3));
        helper.verifyArrayElements(testUtils, ['Wind', 'Rain', 'Fire'], testObj.arr);
    },

    testArrayForEach: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var obj1 = {
            arr: [1, 2, 3, 4]
        };
        component.set("v.wrapUnwrapTestObj", obj1);
        var testObj = component.get("v.wrapUnwrapTestObj");
        var sum = 0;
        testObj.arr.forEach(function (entry) {
            sum += entry;
        });
        testUtils.addWaitForWithFailureMessage(
            10,
            function () {
                return sum;
            },
            "Failed to execute forEach"
        );
        var customThis = {sum: 0};
        testObj.arr.forEach(function (entry) {
            this.sum += entry;
        }, customThis);
        testUtils.addWaitForWithFailureMessage(
            10,
            function () {
                return customThis.sum;
            },
            "Failed to execute forEach with a custom this"
        );
    },

    testArrayForIn: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var obj1 = {
            arr: [1, 2, 3]
        };
        component.set("v.wrapUnwrapTestObj", obj1);
        var testObj = component.get("v.wrapUnwrapTestObj");

        var properties = [];
        for (var prop in testObj.arr) {
            properties.push(prop);
        }
        helper.verifyArrayElements(testUtils, ["0", "1", "2"], properties);
    },

    testArrayAssociativeArray: function (component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var obj1 = {
            arr: [1, 2, 3, 4]
        };
        component.set("v.wrapUnwrapTestObj", obj1);
        var testObj = component.get("v.wrapUnwrapTestObj");
        testObj.arr["foo"] = "bar";
        var objKey = {};
        testObj.arr[objKey] = {"hello": "world"};

        testUtils.assertEquals(4, testObj.arr.length, "Items inserted using non-numeric index should not be included in length calculation");
        testUtils.assertEquals("bar", testObj.arr["foo"]);
        testUtils.assertEquals("world", testObj.arr[objKey]["hello"]);

        testObj.arr[-10] = "bar";
        testUtils.assertEquals(4, testObj.arr.length, "Items inserted using negative numeric index should not be included in length calculation");
        testUtils.assertEquals("bar", testObj.arr[-10]);

        testObj.arr[-10.9] = "bar";
        testUtils.assertEquals(4, testObj.arr.length, "Items inserted using negative decimal index should not be included in length calculation");
        testUtils.assertEquals("bar", testObj.arr[-10.9]);

        testObj.arr[9.1] = "bar";
        testUtils.assertEquals(4, testObj.arr.length, "Items inserted using non integer index should not be included in length calculation");
        testUtils.assertEquals("bar", testObj.arr[9.1]);
    },

    testArrayProxyTraps: function(component, event, helper) {
        var testUtils = component.get("v.testUtils");
        var obj = {
            arr: [1, 2, 3]
        };
        component.set("v.wrapUnwrapTestObj", obj);

        // Test other traps of the array proxy
        var testArray = component.get("v.wrapUnwrapTestObj").arr;
        testUtils.assertEquals(Array.prototype, Object.getPrototypeOf(testArray));

        testUtils.assertTrue(Object.isExtensible(testArray));

        Object.preventExtensions(testArray);
        testUtils.assertFalse(Object.isExtensible(testArray));
        // Verify that values cannot be added once array is marked as not extensible
        testUtils.assertEquals(3, testArray.length);
        // new indexes cannot be added
        try {
            testArray[3] = "4";
            testUtils.fail("new indexes cannot be added");
        } catch(expected) {}

        testUtils.assertEquals(3, testArray.length);
        testUtils.assertUndefined(testArray[3]);
        // Existing indexes can be updated
        testArray[2] = 4;
        helper.verifyArrayElements(testUtils, [1, 2, 4], testArray);

        var descriptor = Object.getOwnPropertyDescriptor(testArray, "1");
        testUtils.assertNotUndefinedOrNull(descriptor, "Failed to get descriptor for array index");
        testUtils.assertEquals(2, descriptor.value);

        component.set("v.wrapUnwrapTestObj", {arr: ['a', 'b', 'c']})
        testArray = component.get("v.wrapUnwrapTestObj").arr;
        Object.defineProperty(
            testArray,
            3,
            {
                enumerable: true,
                configurable: true,
                writable: false,
                value: 'z'
            });
        testUtils.assertEquals('z', testArray[3], "Failed to define new property on array");
        helper.verifyArrayElements(testUtils, ["0", "1", "2", "3"], Object.keys(testArray));

        delete testArray[0];
        helper.verifyArrayElements(testUtils, [undefined, 'b', 'c', 'z'], testArray);
    }
})