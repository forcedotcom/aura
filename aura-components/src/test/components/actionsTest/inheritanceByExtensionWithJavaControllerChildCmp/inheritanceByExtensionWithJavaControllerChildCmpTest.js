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
    },
    
    /**
     * Error Case:
     * When trying to get a non-existent action, we should fail fast by displaying an error to the user (via $A.error),
     * and throwing a Javascript exception, since $A.error will only display a message and does not stop execution.
     */
    testGetNonExistentAction : {
        test : function(cmp) {
            var errorMsg = "Unable to find 'notHereCaptain' on 'compound://actionsTest.inheritanceByExtensionWithJavaControllerChildCmp'.";
            try {
                var action = cmp.get("c.notHereCaptain");
                $A.test.fail("Attemping to get a non-existent controller action should have thrown error.");
            } catch (e) {
                $A.test.assertEquals(errorMsg, e.message);
            }
        }
    },
    
    /**
    * Error Case: our parent component doesn't have server controller at all. 
    * when getting a server action from parent component, it should error out with readable message
    */
    testGetNonExistentParentServerAction : {
    	test : function(cmp) {
    		var errorMsg = "Unknown controller action 'serverSideActionInChildOnly'";
    		try {
                var action = cmp.getSuper().get("c.serverSideActionInChildOnly");
                $A.test.fail("Attemping to get a non-existent controller action should have thrown error.");
            } catch (e) {
                $A.test.assertEquals(errorMsg, e.message);
            } 
    	}
    }
})