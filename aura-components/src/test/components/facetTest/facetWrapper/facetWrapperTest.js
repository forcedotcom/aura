({
    testObjectTypeFacet: {
        test: [
            function(cmp) {
                var facet = cmp.find('f3');
                $A.test.assertDefined(facet);

                var facetTitle = facet.get('v.title');
                $A.test.assertDefined(facetTitle);

                var labelCmp = facetTitle[0];
                $A.test.assertDefined(labelCmp);

                $A.test.assertEquals(labelCmp.get('v.label'), cmp.get('v.foo'));
            }
        ]
    },
})