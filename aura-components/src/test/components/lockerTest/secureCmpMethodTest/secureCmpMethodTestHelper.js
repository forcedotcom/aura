({
    runTestRoutine: function (cmp, facetId, errorMessage) {
        var testUtils = cmp.get("v.testUtils");
        var facet = cmp.find(facetId);
        
        cmp.set("v.booleanAttr", true);
        cmp.set("v.dateAttr", "1888-08-08");
        cmp.set("v.dateTimeAttr", "1888-08-08T08:08:08.888Z");
        cmp.set("v.decimalAttr", 88.88);
        cmp.set("v.doubleAttr", 5/7);
        cmp.set("v.integerAttr", 8888);
        cmp.set("v.longAttr", Infinity);
        cmp.set("v.stringAttr", "GoldenState");
        cmp.set("v.stringArrayAttr", ["\"ONE\"", "!@#$%^&*()", "Äéįœû"]);
        cmp.set("v.objectAttr", {"GoldenState" : "Warriors", "arrayEntry" : ["2015", "2017", cmp]});
        cmp.set("v.listAttr", [1, 2, 3, ["foo", "bar"], cmp]);
        cmp.set("v.mapAttr", {a : ["foo", "bar"], b: 88, c: cmp});
        cmp.set("v.setAttr", ['red', 'green', 'blue','red', 'green', 'blue', cmp]);

        facet.inspectMethodParams(
            cmp, 
            cmp.get("v.testUtils"),
            cmp.get("v.booleanAttr"),
            cmp.get("v.dateAttr"),
            cmp.get("v.dateTimeAttr"),
            cmp.get("v.decimalAttr"),
            cmp.get("v.doubleAttr"),
            cmp.get("v.integerAttr"),
            cmp.get("v.longAttr"),
            cmp.get("v.stringAttr"),
            cmp.get("v.stringArrayAttr"),
            cmp.get("v.objectAttr"),
            cmp.get("v.listAttr"),
            cmp.get("v.mapAttr"),
            cmp.get("v.setAttr"),
            cmp.find("resultHolder").getElement()
        );

        testUtils.addWaitForWithFailureMessage(
            true,
            function() { return facet.get("v.methodCalled"); },
            errorMessage
        );
    }
})