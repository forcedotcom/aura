({

    testReturnsPropertyReferenceValueObject: {
        test: function(cmp) {
            var ref = cmp.getReference("v.target");
            $A.test.assertAuraType("PropertyReferenceValue", ref);
        }
    },

    /**
     * Verify that getReference() returns different PropertyReferenceValue object for
     * different accessing component instances.
     */
    testCreateDifferentObjectsForDifferentAccessCmpInstances: {
        test: function(cmp) {
            var targetCmp = cmp.find("target");
            var cmp1;
            var cmp2;

            $A.createComponent("componentTest:getReference", {},
                function(newCmp) {
                    // setting target component
                    newCmp.set("v.target", targetCmp);
                    cmp1 = newCmp;
                });

            $A.createComponent("componentTest:getReference", {},
                function(newCmp) {
                    newCmp.set("v.target", targetCmp);
                    cmp2 = newCmp;
                });

            $A.test.addWaitFor(true, function() { return !!cmp1 && !!cmp2; },
                function () {
                    // calling target component's getReference() in accessing component's
                    // controller.
                    cmp1.setTargetGetReference("v.message");
                    cmp2.setTargetGetReference("v.message");

                    $A.test.assertFalse(cmp1._targetReference === cmp2._targetReference,
                        "Target references should be different objects");
                });
        }
    },

    testReturnSameObjectForSameAccessCmpInstance: {
        test: function(cmp) {
            var targetCmp = cmp.find("target");
            var ref1 = targetCmp.getReference("v.message");
            var ref2 = targetCmp.getReference("v.message");

            $A.test.assertTrue(ref1 === ref2, "Target references should be same object");
        }
    }
})
