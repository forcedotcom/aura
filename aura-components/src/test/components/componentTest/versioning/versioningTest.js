({
    /**
     * Verify version value provider can be used in equals comparison with number expression,
     * e.g {!version=='2.0'}
     */
    testVersionInExpressionWithEqualsComparison: {
        test: function(cmp) {
            var targetComponent = cmp.find("auratestCmp");
            targetComponent.updateWithEqualsComponentExist();

            $A.test.assertTrue(targetComponent.get("v.cmpExist"));
        }
    },

    /**
     * Verify version value provider can be used in inequality comparsion expression,
     * e.g. {!version>1}.
     *
     * Disable the test for now, althought the test is passing by coincidence.
     * Currently getVersion() returns a string to support minor version like
     * '1.0.0' or '4.*'. Because aura doesn't check type in inequality comparison,
     * JS convert the string into number to compare. But aura does check type in
     * equalty comparison, so we need come up with a solution to make the version
     * comparison more consistent, like util function.
     * The test may need to be updated if we use util function to compare.
     * The comparison expression is declared in auratest:require.cmp
     */
    _testVersionInExpressionWithInequalityComparison: {
        test: function(cmp) {
            var targetComponent = cmp.find("auratestCmp");
            targetComponent.updateWithInequalityComparisonComponentExist();

            $A.test.assertTrue(targetComponent.get("v.cmpExist"),
                    "Component should exist.");
        }
    },

    /**
     * Verify version in bound expression
     */
    testVersionInBoundExpression: {
        test: function(cmp) {
            var targetComponent = cmp.find("auratestCmp");
            targetComponent.udpateWithBoundVersionExpression();

            var actual = targetComponent.get("v.version");
            $A.test.assertEquals("2.0", actual);
        }
    },

    /**
     * Verify version in unbound expression
     */
    testVersionInUnboundExpression: {
        test: function(cmp) {
            var targetComponent = cmp.find("auratestCmp");
            targetComponent.udpateWithUnboundVersionExpression();

            var actual = targetComponent.get("v.version");
            $A.test.assertEquals("2.0", actual);
        }
    },

    testVersionInInitHandler: {
        test: function(cmp) {
            $A.test.assertEquals("2.0", cmp.find("auratestCmp").get("v.version"));
        }
    },

    testVersionInRender: {
        test: function(cmp) {
            // render(), afterRender(), rerender() get called before
            // running test case.
            var targetComponent = cmp.find("auratestCmp");
            targetComponent.udpateWithUnboundVersionExpression();

            var actual = targetComponent.get("v.versionInRender");
            $A.test.assertEquals("2.0", actual);
        }
    },

    testVersionInRerender: {
        test: function(cmp) {
            // render(), afterRender(), rerender() get called before
            // running test case.
            var targetComponent = cmp.find("auratestCmp");
            var actual = targetComponent.get("v.versionInRerender");

            $A.test.assertEquals("2.0", actual);
        }
    },

    testVersionInAfterRender: {
        test: function(cmp) {
            var targetComponent = cmp.find("auratestCmp");
            var actual = targetComponent.get("v.versionInAfterRender");

            $A.test.assertEquals("2.0", actual);
        }
    },

    testVersionInUnrender: {
        test: [
            function(cmp) {
                var action = cmp.get("c.updateWithVersionInAuraTestCmpUnrender");
                $A.enqueueAction(action);
            },
            function(cmp) {
                $A.test.assertEquals("2.0", cmp.get("v.version"));
            }
        ]
    },

   /**
     * Verify getting version by getVersion method in client controller
     */
    testVersionFromGetVersionMethod: {
        test: [
            function(cmp) {
                var action = cmp.get("c.updateWithVersionInAuraTestCmpController");
                $A.enqueueAction(action);
            },
            function(cmp) {
                $A.test.assertEquals("2.0", cmp.get("v.version"));
            }
        ]
    },

    /**
     * Verify the version returned from getVersion() can do logic comparison
     * in client side controller.
     */
    testVersionComparisonInController: {
        test: [
            function(cmp) {
                var action = cmp.get("c.updateWithVersionFromVersionComparisonInAuraTestCmp");
                $A.enqueueAction(action);
            },
            function(cmp) {
                $A.test.assertEquals("2.0", cmp.get("v.version"));
            }
        ]
    },

   /**
     * Verify getting version by getVersion method in client controller
     */
    testVersionFromGetVersionMethod: {
        test: [
            function(cmp) {
                var action = cmp.get("c.updateWithVersionInAuraTestCmpController");
                $A.enqueueAction(action);
            },
            function(cmp) {
                $A.test.assertEquals("2.0", cmp.get("v.version"));
            }
        ]
    },

    /**
     * Verify the version returned from getVersion() can do logic comparison
     * in client side controller.
     */
    testVersionComparisonInController: {
        test: [
            function(cmp) {
                var action = cmp.get("c.updateWithVersionFromVersionComparisonInAuraTestCmp");
                $A.enqueueAction(action);
            },
            function(cmp) {
                $A.test.assertEquals("2.0", cmp.get("v.version"));
            }
        ]
    },

    /**
     * verify required version can be retrieved by version value provider
     */
    testVersionInControllerByVersionValueProvier: {
        test: function(cmp) {
            var targetComponent = cmp.find("auratestCmp");
            targetComponent.updateVersionByComponentValueProvider();

            var actual = targetComponent.get("v.version");
            this.updateVersion(cmp, actual);
            $A.test.assertEquals("2.0", actual);
        }
    },

    /**
     * Verify getting component required version from samespace component.
     * Since it's not allowed to require version for same namespace, this
     * should always act same as no required version declared.
     */
    testVersionInSameNamespaceComponent: {
        test: function(cmp) {
            var targetComponent = cmp.find("sameNamespaceCmp");
            targetComponent.updateVersion();

            var actual = targetComponent.get("v.version");
            this.updateVersion(cmp, actual);
            $A.test.assertUndefinedOrNull(actual);
        }
    },

    /**
     * verify getting version from no required version namespace component
     */
    testVersionFromNoRequiredVersionComponent: {
        test: function(cmp) {
            var targetComponent = cmp.find("noVersionRequiredCmp");
            targetComponent.updateVersion();

            var actual = targetComponent.get("v.version");
            this.updateVersion(cmp, actual);
            $A.test.assertUndefinedOrNull(actual);
        }
    },

    /**
     * Verify getting required version in super component
     */
    testVersionInSuperComponent: {
        test: [
            function(cmp) {
                var action = cmp.get("c.updateWithVersionInSuperComponent");
                $A.enqueueAction(action);
            },
            function(cmp) {
                $A.test.assertUndefinedOrNull(cmp.get("v.versionInSuperCmp"));
            }
        ]
    },

    /**
     * Verify grandchild component's version depends on its parent required version
     */
    testVersionInGrandchildComponent: {
        test: function(cmp) {
            var component = cmp.find("requireConsumerInAuraTest");
            component.updateWithVersionInConsumedComponentInTest();
            this.updateVersion(cmp, component.get("v.versionInConsumedCmp"))

            var actual = cmp.get("v.version");
            $A.test.assertEquals("123456.0", actual);
        }
    },

    /**
     * Verify version in client controller is same as its containing component's
     * version when they are in same namespace.
     *
     * Describe: the testing component contains auratest:requireConsumer which contains
     * auratest:require. In auratest:require, checking if getVersion() returns
     * required version declared in testing component.
     */
    testVersionSameAsContainingCmpVersionWhenInSamenamespace: {
        test: function(cmp) {
            var component = cmp.find("requireConsumerInAuraTest");
            component.updateWithVersionInConsumedComponentInSamenamespace();
            this.updateVersion(cmp, component.get("v.versionInConsumedCmp"))

            var actual = cmp.get("v.version");
            $A.test.assertEquals("2.0", actual);
        }
    },

    /**
     * Verify getVersion() returns its caller's request version when a component as attribute
     * in different namespace components.
     */
    testVersionInMultiHostedComponent: {
        test: [
            function(cmp) {
                var action = cmp.get("c.updateWithVersionInMultiHostedComponent");
                $A.enqueueAction(action);

                $A.test.addWaitForWithFailureMessage(true,
                        function() {
                            return cmp.get("v.actionDone");
                        },
                        "Failed to get requested version from created component."
                );
            },
            function(cmp) {
                var versionConsumedInAuraTest = cmp.find("requireConsumerInAuraTest").get("v.versionInConsumedCmp");
                var versionConsumedInTest = cmp.find("requireConsumerInTest").get("v.versionInConsumedCmp");

                this.updateVersion(cmp, versionConsumedInAuraTest + ", " + versionConsumedInTest);
                $A.test.assertEquals("3.0", versionConsumedInAuraTest,
                        "Incorrect requested version when host component under 'auratest' namespace: " +
                        versionConsumedInAuraTest);
                $A.test.assertEquals("1.5", versionConsumedInTest,
                        "Incorrect requested version when host component under 'test' namespace: " +
                        versionConsumedInTest);
            }
        ]
    },

    testVersionInDynamicallyCreatedComponent: {
        test: [
            function(cmp) {
                var action = cmp.get("c.updateWithVersionInCreatedComponent");
                $A.enqueueAction(action);

                $A.test.addWaitForWithFailureMessage(true,
                        function() {
                            return cmp.get("v.actionDone");
                        },
                        "Failed to get requested version from created component."
                );
            },
            function(cmp) {
                $A.test.assertEquals("2.0", cmp.get("v.version"));
            }
        ]
    },

    updateVersion: function(cmp, version) {
        cmp.set("v.version", version);
    }
})

