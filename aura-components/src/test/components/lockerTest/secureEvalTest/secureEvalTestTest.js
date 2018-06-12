({
    browsers: ['-IE8', '-IE9', '-IE10', '-IE11', '-SAFARI', '-IPHONE', '-IPAD'],

    setUp: function(cmp) {
        cmp.set('v.testUtils', $A.test);
    },

    testSecureEvalIsLockerized: {
      test: function(component) {
          component.testSecureEvalIsLockerized(component);
      }
    },

    testFrozenIntrinsics: {
        test: function(component) {
            component.testFrozenIntrinsics(component);
        }
    },

    _testHiddenIntrinsics: {
        test: function(component) {
            component.testHiddenIntrinsics(component);
        }
    }
})