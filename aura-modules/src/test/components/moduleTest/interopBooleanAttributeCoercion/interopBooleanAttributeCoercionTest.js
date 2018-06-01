({
    testHardcodedStringFalse: {
        test: [
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-false').get('v.foo');
                var message = '[Aura Attribute Assertion] Hardcoded string attribute value "false" should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-false').getElement().foo;
                var message = '[DOM Assertion] Hardcoded string attribute value "false" should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-false').get('v.booleanAttribute');
                var actual = cmp.find('string-false').get('v.foo');
                var message = '[Sanity Check] Interop coerces "false" strings the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testHardcodedStringTrue: {
        test: [
            function(cmp) {
                var expected = true;
                var actual = cmp.find('string-true').get('v.foo');
                var message = '[Aura Attribute Assertion] Hardcoded string attribute value "true" should be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = true;
                var actual = cmp.find('string-true').getElement().foo;
                var message = '[DOM Assertion] Hardcoded string attribute value "true" should be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-true').get('v.booleanAttribute');
                var actual = cmp.find('string-true').get('v.foo');
                var message = '[Sanity Check] Interop coerces "true" strings the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testExpressionStringFalse: {
        test: [
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('expression-string-false').get('v.foo');
                var message = '[Aura Attribute Assertion] An expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('expression-string-false').getElement().foo;
                var message = '[DOM Assertion] An expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-expression-string-false').get('v.booleanAttribute');
                var actual = cmp.find('expression-string-false').get('v.foo');
                var message = '[Sanity Check] Interop coerces expressions evaluating to the "false" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testExpressionStringTrue: {
        test: [
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('expression-string-true').get('v.foo');
                var message = '[Aura Attribute Assertion] An expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('expression-string-true').getElement().foo;
                var message = '[DOM Assertion] An expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-expression-string-true').get('v.booleanAttribute');
                var actual = cmp.find('expression-string-true').get('v.foo');
                var message = '[Sanity Check] Interop coerces expressions evaluating to the "true" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testUnboundExpressionStringFalse: {
        test: [
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('unbound-expression-string-false').get('v.foo');
                var message = '[Aura Attribute Assertion] An unbound expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('unbound-expression-string-false').getElement().foo;
                var message = '[DOM Assertion] An unbound expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-unbound-expression-string-false').get('v.booleanAttribute');
                var actual = cmp.find('unbound-expression-string-false').get('v.foo');
                var message = '[Sanity Check] Interop coerces unbound expressions evaluating to the "false" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testUnboundExpressionStringTrue: {
        test: [
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('unbound-expression-string-true').get('v.foo');
                var message = '[Aura Attribute Assertion] An unbound expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('unbound-expression-string-true').getElement().foo;
                var message = '[DOM Assertion] An unbound expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-unbound-expression-string-true').get('v.booleanAttribute');
                var actual = cmp.find('unbound-expression-string-true').get('v.foo');
                var message = '[Sanity Check] Interop coerces unbound expressions evaluating to the "true" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testUnboundAttributeExpressionStringFalse: {
        test: [
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('unbound-attribute-expression-string-false').get('v.foo');
                var message = '[Aura Attribute Assertion] An unbound expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('unbound-attribute-expression-string-false').getElement().foo;
                var message = '[DOM Assertion] An unbound expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-unbound-attribute-expression-string-false').get('v.booleanAttribute');
                var actual = cmp.find('unbound-attribute-expression-string-false').get('v.foo');
                var message = '[Sanity Check] Interop coerces unbound expressions evaluating to the "false" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testUnboundAttributeExpressionStringTrue: {
        test: [
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('unbound-attribute-expression-string-true').get('v.foo');
                var message = '[Aura Attribute Assertion] An unbound expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('unbound-attribute-expression-string-true').getElement().foo;
                var message = '[DOM Assertion] An unbound expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-unbound-attribute-expression-string-true').get('v.booleanAttribute');
                var actual = cmp.find('unbound-attribute-expression-string-true').get('v.foo');
                var message = '[Sanity Check] Interop coerces unbound expressions evaluating to the "true" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    /*
    Once we have attribute types in LWC, we will be able to use that metadata
    to exactly emulate Aura. When that day comes, the following four tests
    should pass. They basically account for the fact that Aura, when dealing
    with string values being assigned to attributes with the boolean type,
    will coerce 'true' to `true` and all other strings to `false` ¯\_(ツ)_/¯

    testHardcodedStringRandom: {
        test: [
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-random').get('v.foo');
                var message = '[Aura Attribute Assertion] Hardcoded random string attribute value (ie, not "true" and not "false") should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-random').getElement().foo;
                var message = '[DOM Assertion] Hardcoded random string attribute value (ie, not "true" and not "false") should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-random').get('v.booleanAttribute');
                var actual = cmp.find('string-random').get('v.foo');
                var message = '[Sanity Check] Interop coerces random (ie, not "true" and not "false") strings the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testHardcodedStringEmpty: {
        test: [
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-empty').get('v.foo');
                var message = '[Aura Attribute Assertion] Hardcoded empty string attribute value should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-empty').getElement().foo;
                var message = '[DOM Assertion] Hardcoded empty string attribute value should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-empty').get('v.booleanAttribute');
                var actual = cmp.find('string-empty').get('v.foo');
                var message = '[Sanity Check] Interop coerces empty strings the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testHardcodedStringNull: {
        test: [
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-null').get('v.foo');
                var message = '[Aura Attribute Assertion] Hardcoded "null" string attribute value should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-null').getElement().foo;
                var message = '[DOM Assertion] Hardcoded "null" string attribute value should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-null').get('v.booleanAttribute');
                var actual = cmp.find('string-null').get('v.foo');
                var message = '[Sanity Check] Interop coerces "null" strings the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testHardcodedStringUndefined: {
        test: [
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-undefined').get('v.foo');
                var message = '[Aura Attribute Assertion] Hardcoded "undefined" string attribute value should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-undefined').getElement().foo;
                var message = '[DOM Assertion] Hardcoded "undefined" string attribute value should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-undefined').get('v.booleanAttribute');
                var actual = cmp.find('string-undefined').get('v.foo');
                var message = '[Sanity Check] Interop coerces "undefined" strings the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    }
    */
})
