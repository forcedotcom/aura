({
    testGetSameComponentViaGlobalId: {
        test: function(cmp) {
            var globalId = cmp.getGlobalId();
            $A.test.assertEquals(cmp, $A.componentService.get(globalId), "Component not retrieved via get() using globalId");
        }
    },

    testGetFacetViaGlobalId: {
        test: function(cmp) {
            var facet = cmp.find("facet");
            var globalId = facet.getGlobalId();
            $A.test.assertEquals(facet, $A.componentService.get(globalId), "Component not retrieved via get() using globalId");
        }
    }
})