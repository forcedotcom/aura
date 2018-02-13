({
    testPublicApiPropertiesAreSetAsModuleDefAttributeDefs: {
        test: function(cmp) {
            $A.test.addWaitFor(
                true, 
                function() {
                    return cmp.get('v.attributeList').length > 0;
                },
                function() {
                    var expected = [
                        'date',
                        'unbound',
                        'expression',
                        'bound',
                        'callbackaction',
                        'nested',
                        'nullValueTest',
                        'literal',
                    ];
                    $A.test.assertEquals(expected.sort().join(' '), cmp.get('v.attributeList').sort().join(' '));
                });
        }
    }
})