({
    testStaticImportCustomSchema: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var schemaCmp = cmp.find("custom-schema");
                var expected = 'testImage#resolved';
                var actual = schemaCmp.getSchemaTestResource();
                $A.test.assertEquals(actual, expected, 'Unable to statically import the label');
            }
        ]
    }
})