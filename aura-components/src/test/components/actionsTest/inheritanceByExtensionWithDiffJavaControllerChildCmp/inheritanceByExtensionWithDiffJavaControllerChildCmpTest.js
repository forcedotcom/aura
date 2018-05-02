({
    /**
     * verify client action exist in Child only get called.
     */
    testClientSideActionInChildOnly : {
        test : [function(component) {
            var clientAction = component.get("c.clientSideActionInChildOnly");
            $A.enqueueAction(clientAction);

            $A.test.addWaitFor(true, function() {
                return (component.get("v.WhichControllerWasCalledChild") === "clientSideActionInChildOnly")
            });
        }]
    },

    /**
     * both Child and Parent has client action: clientSideActionInBoth
     * This verify the one in Child get called.
     */
    testClientSideActionInBoth : {
        test : function(component) {
            var clientAction = component.get("c.clientSideActionInBoth");
            $A.enqueueAction(clientAction);

            $A.test.addWaitFor(true, function() {
                return (component.get("v.WhichControllerWasCalledChild") === "clientSideActionInBoth from Child")
            });
        }
    },

    /**
     * Parent has server controller: JavaTestController, Child has a different one: TestControllerWithParameters
     * This verify when client call its server action, it go through the correct one
     */
    testServerSideActionInChildOnly : {
        test : function(component) {
            var clientAction = component.get("c.serverSideActionInChildOnly");
            $A.enqueueAction(clientAction);

            $A.test.addWaitFor(true, function() {
                return (component.get("v.WhichControllerWasCalledChild") === "appendStrings called from Child's serverSideActionInChildOnly")
            });
        }
    },

    /**
     * Parent has server controller: JavaTestController, Child has a different one: TestControllerWithParameters
     * This verify when Child can call parent's server action directly, and it go through the correct one
     */
    testServerSideActionInParentOnly : {
        test : function(component) {
            var clientAction = component.get("c.serverSideActionInParentOnly");
            $A.enqueueAction(clientAction);

            $A.test.addWaitFor(true, function() {
                return (component.get("v.WhichControllerWasCalledChild") === "getString called from Child's serverSideActionInParentOnly")
            });
        }
    },

    /**
     * Parent has attribute of type Aura.Action, Child set that attribute to its client
     * action: setAttributeAuraActionChild.
     * This verify when client get the action through that attribute, it go through what
     * we set it to : setAttributeAuraActionChild
     */
    testAttributeAuraAction : {
        test : function(component) {
            var clientAction = component.get("c.fireAttributeAuraAction");
            $A.enqueueAction(clientAction);

            $A.test.addWaitFor(true, function() {
                return (component.get("v.WhichControllerWasCalledChild") === "setAttributeAuraAction in Child")
            });
        }
    },

    /**
     * Parent has attribute of type Aura.Action
     * by default it's set to its client action: setAttributeAuraAction
     * Child set that attribute to its client action: setAttributeAuraActionChild
     * This verify when client get the action through Parent's attribute, it still go through Child's client action
     */
    testAttributeAuraActionInParentCmp : {
        test : [function(component) {
            var clientAction = component.getSuper().get("c.fireAttributeAuraAction");
            $A.enqueueAction(clientAction);
            //verify Child's client controller was called.
            $A.test.addWaitFor(true, function() {
                return (component.get("v.WhichControllerWasCalledChild") === "setAttributeAuraAction in Child");
            });
        }, function(component) {
            //verify we didn't call Parent's client controller
            $A.test.assertEquals("no one", component.getSuper().get("v.WhichControllerWasCalledParent"));
        }]
    }

})
