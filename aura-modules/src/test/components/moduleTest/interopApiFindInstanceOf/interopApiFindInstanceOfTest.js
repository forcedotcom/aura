({
    testFindInstanceOf: {
        test: [
            function(cmp) {
                var target = cmp.find('target');
                var results = cmp.find('wrapper').find({instancesOf: 'moduleTest:simpleCmp'});
                $A.test.assertEquals(results.length, 1);
                $A.test.assertEquals(results[0], target);
            }
        ]
    },

    testInstanceOfAtComponentRootShouldNotProduceResults: {
        test: [
            function(cmp) {
                var results = cmp.find({instancesOf: 'moduleTest:simpleCmp'});
                $A.test.assertEquals(results.length, 0);
            }
        ]
    },

    testInstanceOfForNonExistingTypeShouldNotProduceResults: {
        test: [
            function(cmp) {
                var results = cmp.find({instancesOf: 'moduleTest:none'});
                $A.test.assertEquals(results.length, 0);
            }
        ]
    },
})