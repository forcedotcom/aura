({
    runTestRoutine: function (cmp, facetId, errorMessage) {
        var testUtils = cmp.get("v.testUtils");

        var facet = cmp.find(facetId);
        cmp.set("v.strAttr", "callingIntoMethod");
        cmp.set("v.listAttr", [1, 2, 3, ["foo", "bar"], cmp]); // Insert a wrapped object in the array and verify it on the other side
        cmp.set("v.ObjAttr", {"stringLiteral" : "Giants", "arrayEntry" : ["2014", "2016", cmp]});
        facet.inspectMethodParams(
            cmp,
            cmp.get("v.strAttr"),
            cmp.get("v.listAttr"),
            cmp.get("v.ObjAttr"),
            cmp.get("v.testUtils"),
            cmp.find("resultHolder").getElement()
        );

        testUtils.addWaitForWithFailureMessage(
            true,
            function() { return facet.get("v.methodCalled"); },
            errorMessage
        );
    }
})