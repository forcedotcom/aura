({
    /**
     * verify client action exist in Solid only get called.
     */
    testClientSideActionInSolidOnly : {
        test : [function(component) {
        	var clientAction = component.get("c.clientSideActionInSolidOnly");
            $A.enqueueAction(clientAction);
            
            $A.test.addWaitFor(true, function() { 
        		return (component.get("v.WhichControllerWasCalledSolid") === "clientSideActionInSolidOnly")
        	});
        }]
    },
    
    /**
     * both Solid and Abstract has client action: clientSideActionInBoth
     * This verify the one in Solid get called.
     */
    testClientSideActionInBoth : {
    	test : function(component) {
        	var clientAction = component.get("c.clientSideActionInBoth");
            $A.enqueueAction(clientAction);
            
            $A.test.addWaitFor(true, function() { 
        		return (component.get("v.WhichControllerWasCalledSolid") === "clientSideActionInBoth from Solid")
        	});
    	}
    },
    
    /**
     * both Solid and Abstract has server controller: JavaTestController.java
     * This verify when Solid call its server action, it go through the correct one
     */
    testServerSideActionInBoth : {
    	test : function(component) {
        	var clientAction = component.get("c.serverSideActionInBoth");
            $A.enqueueAction(clientAction);
            
            $A.test.addWaitFor(true, function() { 
        		return (component.get("v.WhichControllerWasCalledSolid") === "getString called from Solid's serverSideActionInBoth")
        	});
    	}
    },
    
    /**
     * Abstract has attribute of type Aura.Action, Solid set that attribute to its client
     * action: setAttributeAuraActionSolid. 
     * This verify when client get the action through that attribute, it go through what
     * we set it to : setAttributeAuraActionSolid
     */
    testAttributeAuraAction : {
    	test : function(component) {
        	var clientAction = component.get("c.fireAttributeAuraAction");
            $A.enqueueAction(clientAction);
            
            $A.test.addWaitFor(true, function() { 
        		return (component.get("v.WhichControllerWasCalledSolid") === "setAttributeAuraAction in Solid")
        	});
    	}
    },
    
    /**
     * Abstract has attribute of type Aura.Action
     * by default it's set to its client action: setAttributeAuraAction
     * Solid set that attribute to its client action: setAttributeAuraActionSolid
     * This verify when client get the action through Abstract's attribute, it still go through Solid's client action
     */
    testAttributeAuraActionInAbstractCmp : {
    	test : [function(component) {
        	var clientAction = component.getSuper().get("c.fireAttributeAuraAction");
            $A.enqueueAction(clientAction);
            //verify Solid's client controller was called.
            $A.test.addWaitFor(true, function() { 
        		return (component.get("v.WhichControllerWasCalledSolid") === "setAttributeAuraAction in Solid");
        	});
    	}, function(component) {
    		//verify we didn't call Abstract's client controller
    		$A.test.assertEquals("no one", component.getSuper().get("v.WhichControllerWasCalledAbstract"));
    	}]
    }
})