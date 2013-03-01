({
    testDefaultStorageForActions:{
	test:function(cmp){
	    var action = $A.get("c.aura://ComponentController.getComponent");
	    $A.test.assertFalsy(action.getStorage());
	}
    },
    testActionWithStorageService:{
	attributes:{actionsStorageOn:true},
	test:function(cmp){
	    var action = $A.get("c.aura://ComponentController.getComponent");
	    $A.test.assertTruthy(action.getStorage());
	    $A.test.assertEquals("memory", action.getStorage().getName());
	}
    }
})