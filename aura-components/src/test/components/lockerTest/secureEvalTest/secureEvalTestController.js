({
    /**
     * Tests that eval is executing in the correct context.
     * eval() should be in a secureWindow and not in global window.
     */
    testSecureEvalIsLockerized: function(component) {
      var testUtils = component.get('v.testUtils');
      var evalWindow = eval("window + ''");
      testUtils.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"lockerTest"} }', evalWindow,
                             'SecureEval is not operating within a secureWindow!');
    },

    /**
     * Goes through all of the intrinsic properties present on the browser
     * and confirms they are all frozen by deepFreeze() inside of secureEval().
     *
     * Fails if any intrinsic is not frozen and than prints the un-frozen intrinsic in
     * the error.
     */
    testFrozenIntrinsics: function(component, event, helper) {
      var testUtils = component.get('v.testUtils');

      /**
       * This is the list of all global intrinsics we expect to be present on the browser.
       * See: https://tc39.github.io/ecma262/#sec-well-known-intrinsic-objects (table #7)
       */
      var expectedIntrinsics = [
        'Array',
        'ArrayBuffer',
        'ArrayBuffer.prototype',
        'Array.prototype',
        'Array.prototype.entries',
        'Array.prototype.forEach',
        'Array.prototype.keys',
        'Array.prototype.values',
        'Atomics', // removed on jan 5, 2018 to prevent side channel attacks
        'Boolean',
        'Boolean.prototype',
        'DataView',
        'DataView.prototype',
        'Date',
        'Date.prototype',
        'DecodeURI',
        'DecodeURIComponent',
        'EncodeURI',
        'EncodeURIComponent',
        'Error',
        'Error.prototype',
        'eval', // eval is not defined on evaluatorFactorySource
        'EvalError',
        'EvalError.prototype',
        'Float32Array',
        'Float32Array.prototype',
        'Float64Array',
        'Float64Array.prototype',
        'Function',
        'Function.prototype',
        'Int8Array',
        'Int8Array.prototype',
        'Int16Array',
        'Int16Array.prototype',
        'Int32Array',
        'Int32Array.prototype',
        'isFinite',
        'isNaN',
        'JSON',
        'JSON.parse',
        'Map',
        'Map.prototype',
        'Math',
        'Number',
        'Number.prototype',
        'Object',
        'Object.prototype',
        'Object.prototype.toString',
        'Object.prototype.valueOf',
        'parseFloat',
        'parseInt',
        'Promise',
        'Promise.prototype',
        'Promise.prototype.then',
        'Promise.all',
        'Promise.reject',
        'Promise.resolve',
        'Proxy',
        'RangeError',
        'RangeError.prototype',
        'ReferenceError',
        'ReferenceError.prototype',
        'Reflect',
        'RegExp',
        'RegExp.prototype',
        'Set',
        'Set.prototype',
        'SharedArrayBuffer',
        'SharedArrayBuffer.prototype',
        'String',
        'String.prototype',
        'Symbol',
        'Symbol.prototype',
        'SyntaxError',
        'SyntaxError.prototype',
        'TypeError',
        'TypeError.prototype',
        'Uint8Array',
        'Uint8Array.prototype',
        'Uint8ClampedArray',
        'Uint8ClampedArray.prototype',
        'Uint16Array',
        'Uint16Array.prototype',
        'Uint32Array',
        'Uint32Array.prototype',
        'URIError',
        'URIError.prototype',
        'WeakMap',
        'WeakMap.prototype',
        'WeakSet',
        'WeakSet.prototype'
      ];

      var expectedNotFrozenIntrinsics = [
        // These intrinsics do not need to be frozen (instance specific)
        "Function",
        "eval",
        // These are not frozen in Aura test mode
        "Date",
        "Date.prototype",
        "Promise",
        "Promise.prototype",
        "JSON"
      ];

      /**
       * Iterates through all expected intrinsics and determines which ones are visible on the
       * current browser. These are added to actualGlobalIntrinsics.
       */
      expectedIntrinsics.forEach(function(name) {
        var intrinsic = helper.getNestedObject(window, name);
        if (intrinsic !== 'undefined') {
          var isFrozen = Object.isFrozen(intrinsic);
          if (expectedNotFrozenIntrinsics.includes(name)) {
            testUtils.assertFalse(isFrozen, name + ' was frozen.');
          } else {
            testUtils.assertTrue(isFrozen, name + ' was not frozen.');
          }
        }
      });
    },

    /**
     * Tests the intrinsics that are not present in global or window scope to ensure they too are frozen.
     */
    testHiddenIntrinsics: function(component) {
      var testUtils = component.get('v.testUtils');

      /**
       * The hidden intrinsics expected to be present on the browser.
       * This is a 2d array of ['name', 'expression'] where expression is a valid JS
       * expression which can coerce the hidden intrinsic into scope to test if it was frozen correctly.
       */
      var expectedHiddenIntrinsics = [
        // TODO W-4717775 add AsyncFromSyncIteratorPrototype
        ['ArrayIteratorPrototype', "Object.getPrototypeOf(new window.Array()[(typeof window.Symbol && window.Symbol.iterator) || '@@iterator']())"],
        ['IteratorPrototype', "Object.getPrototypeOf(Object.getPrototypeOf(new window.Array()[(typeof window.Symbol && window.Symbol.iterator) || '@@iterator']()))"],
        ['AsyncFunction', "(async function(){}).constructor"],
        ['AsyncFunctionPrototype', "(async function(){}).constructor.prototype"],
        ['GeneratorFunction', "(function*(){}).constructor"],
        ['Generator', "(function*(){}).constructor.prototype"],
        ['GeneratorPrototype', "(function*(){}).constructor.prototype.prototype"],
        ['AsyncGeneratorFunction', "(typeof window.Symbol.asyncIterator !== 'undefined') && window.eval('(async function*(){})').constructor"],
        ['AsyncGenerator', "(typeof window.Symbol.asyncIterator !== 'undefined') && window.eval('(async function*(){})').constructor.prototype"],
        ['AsyncGeneratorPrototype', "(typeof window.Symbol.asyncIterator !== 'undefined') && window.eval('(async function*(){})').constructor.prototype.prototype"],
        ['AsyncIteratorPrototype', "(typeof window.Symbol.asyncIterator !== 'undefined') && Object.getPrototypeOf((function*(){}).constructor.prototype.prototype)"],
        ['MapIteratorPrototype', "Object.getPrototypeOf(new window.Map()[(typeof window.Symbol && window.Symbol.iterator) || '@@iterator']())"],
        ['SetIteratorPrototype', "Object.getPrototypeOf(new window.Set()[(typeof window.Symbol && window.Symbol.iterator) || '@@iterator']())"],
        ['StringIteratorPrototype', "Object.getPrototypeOf(new window.String()[(typeof window.Symbol && window.Symbol.iterator) || '@@iterator']())"],
        ['ThrowTypeError', '(function () { "use strict"; return Object.getOwnPropertyDescriptor(arguments, "callee").get; })()'],
        ['TypedArray', "Object.getPrototypeOf(Int8Array)"],
        ['TypedArrayPrototype', "Object.getPrototypeOf(Int8Array).prototype"]
      ];
      /**
       * A list of actual hidden intrinsics, after attempting to collect all of the actualHiddenIntrinsics.
       */
      var actualHiddenIntrinsics = [];

      /**
       * Look through each expected hidden intrinsic, attempting to obtain an instance of it
       * through the use of an eval() call. If we cannot obtain the hidden intrinsic, or the eval crashes
       * we log an error. This usually indicates the particular browser does not suppor this intrinsic which is fine.
       */
      expectedHiddenIntrinsics.forEach(function(intrinsic) {
        try {
          var foundIntrinsic = eval(intrinsic[1]);
          actualHiddenIntrinsics.push([intrinsic[0], foundIntrinsic]);
        } catch (e) {
          console.error('could not not find ' + intrinsic[0]);
        }
      });

      /**
       * Iterate through the actual hidden intrinsics list and assert that the intriniscs
       * are all correctly frozen - else throw an error and halt the test.
       */
      actualHiddenIntrinsics.forEach(function(intrinsic) {
        var isFrozen = Object.isFrozen(intrinsic[1]);
        testUtils.assertTrue(isFrozen, intrinsic[0] + ' was not frozen.');
      });
    }
})
