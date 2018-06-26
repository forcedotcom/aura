({
    testHardcodedStringFalse: {
        test: [
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-false').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] Hardcoded string attribute value "false" should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-false').getElement().booleanAttribute;
                var message = '[DOM Assertion] Hardcoded string attribute value "false" should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-false').get('v.booleanAttribute');
                var actual = cmp.find('string-false').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces "false" strings the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testHardcodedStringTrue: {
        test: [
            function(cmp) {
                var expected = true;
                var actual = cmp.find('string-true').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] Hardcoded string attribute value "true" should be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = true;
                var actual = cmp.find('string-true').getElement().booleanAttribute;
                var message = '[DOM Assertion] Hardcoded string attribute value "true" should be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-true').get('v.booleanAttribute');
                var actual = cmp.find('string-true').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces "true" strings the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testExpressionStringFalse: {
        test: [
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('expression-string-false').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] An expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('expression-string-false').getElement().booleanAttribute;
                var message = '[DOM Assertion] An expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-expression-string-false').get('v.booleanAttribute');
                var actual = cmp.find('expression-string-false').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces expressions evaluating to the "false" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testExpressionStringTrue: {
        test: [
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('expression-string-true').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] An expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('expression-string-true').getElement().booleanAttribute;
                var message = '[DOM Assertion] An expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-expression-string-true').get('v.booleanAttribute');
                var actual = cmp.find('expression-string-true').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces expressions evaluating to the "true" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testUnboundExpressionStringFalse: {
        test: [
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('unbound-expression-string-false').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] An unbound expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('unbound-expression-string-false').getElement().booleanAttribute;
                var message = '[DOM Assertion] An unbound expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-unbound-expression-string-false').get('v.booleanAttribute');
                var actual = cmp.find('unbound-expression-string-false').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces unbound expressions evaluating to the "false" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testUnboundExpressionStringTrue: {
        test: [
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('unbound-expression-string-true').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] An unbound expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('unbound-expression-string-true').getElement().booleanAttribute;
                var message = '[DOM Assertion] An unbound expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-unbound-expression-string-true').get('v.booleanAttribute');
                var actual = cmp.find('unbound-expression-string-true').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces unbound expressions evaluating to the "true" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testUnboundAttributeExpressionStringFalse: {
        test: [
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('unbound-attribute-expression-string-false').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] An unbound expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('unbound-attribute-expression-string-false').getElement().booleanAttribute;
                var message = '[DOM Assertion] An unbound expression evaluating to string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-unbound-attribute-expression-string-false').get('v.booleanAttribute');
                var actual = cmp.find('unbound-attribute-expression-string-false').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces unbound expressions evaluating to the "false" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testUnboundAttributeExpressionStringTrue: {
        test: [
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('unbound-attribute-expression-string-true').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] An unbound expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('unbound-attribute-expression-string-true').getElement().booleanAttribute;
                var message = '[DOM Assertion] An unbound expression evaluating to string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-unbound-attribute-expression-string-true').get('v.booleanAttribute');
                var actual = cmp.find('unbound-attribute-expression-string-true').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces unbound expressions evaluating to the "true" string in the same way that Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testHardcodedStringRandom: {
        test: [
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-random').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] Hardcoded random string attribute value should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-random').getElement().booleanAttribute;
                var message = '[DOM Assertion] Hardcoded random string attribute value should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-random').get('v.booleanAttribute');
                var actual = cmp.find('string-random').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces random strings the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testHardcodedStringEmpty: {
        test: [
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-empty').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] Hardcoded empty string attribute value "" should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-empty').getElement().booleanAttribute;
                var message = '[DOM Assertion] Hardcoded empty string attribute value "" should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-empty').get('v.booleanAttribute');
                var actual = cmp.find('string-empty').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces the empty string value "" the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testHardcodedStringNull: {
        test: [
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-null').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] Hardcoded string attribute value "null" should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-null').getElement().booleanAttribute;
                var message = '[DOM Assertion] Hardcoded string attribute value "null" should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-null').get('v.booleanAttribute');
                var actual = cmp.find('string-null').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces the string value "null" the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testHardcodedStringUndefined: {
        test: [
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-undefined').get('v.booleanAttribute');
                var message = '[Aura Attribute Assertion] Hardcoded string attribute value "undefined" should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = false;
                var actual = cmp.find('string-undefined').getElement().booleanAttribute;
                var message = '[DOM Assertion] Hardcoded string attribute value "undefined" should be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-string-undefined').get('v.booleanAttribute');
                var actual = cmp.find('string-undefined').get('v.booleanAttribute');
                var message = '[Sanity Check] Interop coerces the string "undefined" the same way Aura does.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testNonBooleanAttributeStringFalse: {
        test: [
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('non-boolean-attribute-string-false').get('v.nonBooleanAttribute');
                var message = '[Aura Attribute Assertion] Hardcoded string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'false';
                var actual = cmp.find('non-boolean-attribute-string-false').getElement().nonBooleanAttribute;
                var message = '[DOM Assertion] Hardcoded string attribute value "false" should not be coerced to boolean false';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-non-boolean-attribute-string-false').get('v.stringAttribute');
                var actual = cmp.find('non-boolean-attribute-string-false').get('v.nonBooleanAttribute');
                var message = '[Sanity Check] Interop does not coerce the string "undefined" for non-boolean attributes and neither does Aura.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testNonBooleanAttributeStringTrue: {
        test: [
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('non-boolean-attribute-string-true').get('v.nonBooleanAttribute');
                var message = '[Aura Attribute Assertion] Hardcoded string attribute value "true" should not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = 'true';
                var actual = cmp.find('non-boolean-attribute-string-true').getElement().nonBooleanAttribute;
                var message = '[DOM Assertion] Hardcoded string attribute value "true" should be not be coerced to boolean true';
                $A.test.assertEquals(expected, actual, message);
            },
            function(cmp) {
                var expected = cmp.find('sanity-non-boolean-attribute-string-true').get('v.stringAttribute');
                var actual = cmp.find('non-boolean-attribute-string-true').get('v.nonBooleanAttribute');
                var message = '[Sanity Check] Interop does not coerce the string "undefined" for non-boolean attributes and neither does Aura.';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    /** 
     * Attribute must be set during init handler so we dynamically create the component and verify there were no errors
     * thrown during the render.
     * 
     * See W-5096195 for more details.
     */
    testSetBooleanAttributeOnInit: {
        test: [
            function(cmp) {
                var done = false;
                $A.createComponent('moduletest:interopBooleanAttributeCoercionInit', {}, function(newCmp) {
                    cmp.find('container').set('v.body', newCmp);
                    done = true;
                });

                // error is likely to happen on re-render rather than cmp creation so do verification in next test stage
                $A.test.addWaitFor(true, function() { return done; });
            },
            function(cmp) {
                var errorMessageReceived = cmp.get('v.errorMessageReceived');
                $A.test.assertUndefined(errorMessageReceived, "Should not have receieved error creating component, but got <" + errorMessageReceived + ">.");
            }
        ]
    }
})
