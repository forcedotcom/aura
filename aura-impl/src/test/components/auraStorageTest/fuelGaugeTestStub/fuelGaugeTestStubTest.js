({
    testFuelGauges:{
	test:function(cmp){
	    var actionsGauge = cmp.find("actionsGauge");
	    var savingsGauge = cmp.find("savingsGauge");
	    $A.test.assertTruthy(actionsGauge);
	    $A.test.assertTruthy(savingsGauge);
	}
    },
    testDuplicateGauge:{
	test:function(cmp){
	    var checkingGauge1 = cmp.find("checkingGauge1");
	    var checkingGauge2 = cmp.find("checkingGauge2");
	    $A.test.assertTruthy(checkingGauge1);
	    $A.test.assertTruthy(checkingGauge2);
	    $A.test.assertTrue(checkingGauge1.getGlobalId() !== checkingGauge2.getGlobalId(), 
		    "Duplicate fuel gauge for same storage object should be allowed.");
	}
    },
    /**
     * W-1560159: We don't complain about invalid storage names, keep quite or flag an error?
     */
    testInvalidStorageNames:{
	test:function(cmp){
	    var bogusGauge = cmp.find("bogusGauge");
	    $A.test.assertTruthy(bogusGauge);
	    $A.test.assertFalse(bogusGauge.get('v.enabled'))
	    $A.test.assertFalsy(bogusGauge.find('stamp'));
	    
	    var noName = cmp.find("noName");
	    $A.test.assertTruthy(noName);
	    $A.test.assertFalse(noName.get('v.enabled'))
	    $A.test.assertFalsy(noName.find('stamp'));
	}
    }

})