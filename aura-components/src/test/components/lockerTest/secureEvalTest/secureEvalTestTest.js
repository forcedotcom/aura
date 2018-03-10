({
    browsers: ['-IE8', '-IE9', '-IE10', '-IE11', '-FIREFOX', '-SAFARI', '-IPHONE', '-IPAD'],

    setUp: function(cmp) {
        cmp.set('v.testUtils', $A.test);
    },
    
    testSecureEvalIsLockerized: {
      test: function(component) {
          component.testSecureEvalIsLockerized(component);
      }
    },
    
    testGlobalIntrinsics: {
        test: function(component) {
            component.testGlobalIntrinsics(component);
        }
    },
    
    testHiddenIntrinsics: {
        test: function(component) {
            component.testHiddenIntrinsics(component);
        }
    }
})