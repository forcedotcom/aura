({
    testShadowRootContains: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var shadowRootContains = cmp.find('shadowRootContains');
                var element = shadowRootContains.getElement();
                var inShadow = element.shadowRoot.querySelector('.i-am-modules');
                var contains = $A.util.contains(element, inShadow);
                $A.test.assertTrue(contains);
            }
        ]
    }
})
