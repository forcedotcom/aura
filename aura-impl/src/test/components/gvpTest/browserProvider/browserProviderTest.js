({
    testChromeBrowser:{
	browsers: [ 'GOOGLECHROME', 'IE10', 'IE9', 'IE8', 'IE7', 'FIREFOX', 'SAFARI'],
    	test:function(cmp){
	    var gvp = $A.getGlobalValueProviders();
	    $A.test.assertEquals("DESKTOP", gvp.get("$Browser.formfactor"));
	}
    },
    testIOSBrowser: {
	browsers: [ 'IPAD', 'IPHONE'],
	test:function(cmp){
	    var gvp = $A.getGlobalValueProviders();
	    $A.test.assertTrue(gvp.get("$Browser.isios"));
	}
    },
    testIsPhone: {
	browsers: [ 'IPHONE', 'ANDROID_PHONE'],
	test:function(cmp){
	    var gvp = $A.getGlobalValueProviders();
	    $A.test.assertTrue(gvp.get("$Browser.isphone"));
	    $A.test.assertFalse(gvp.get("$Browser.istablet"));
	    $A.test.assertEquals("PHONE", gvp.get("$Browser.formfactor"));
	}
    },
    testIsAndroid: {
	browsers: [ 'ANDROID_TABLET', 'ANDROID_PHONE'],
	test:function(cmp){
	    var gvp = $A.getGlobalValueProviders();
	    $A.test.assertTrue(gvp.get("$Browser.isandroid"));
	}
    },
    testIsTablet: {
	browsers: [ 'ANDROID_TABLET', 'IPAD'],
	test:function(cmp){
	    var gvp = $A.getGlobalValueProviders();
	    $A.test.assertTrue(gvp.get("$Browser.istablet"));
	    $A.test.assertFalse(gvp.get("$Browser.isphone"));
	    $A.test.assertEquals("TABLET", gvp.get("$Browser.formfactor"));
	}
    },
    //Verify that expression to get non existing browser info doesn't cause server action unlike labelvalueprovider
    testNonExistingBrowserInfo:{
	browsers: [ 'GOOGLECHROME'],
    	test:function(cmp){
	    var gvp = $A.getGlobalValueProviders();
	    $A.test.assertUndefinedOrNull(gvp.get("$Browser.FooBared"));
	    $A.test.assertFalse($A.test.isActionPending(), 
            	"Requesting a non existing property on $Browser should not cause any server actions");
	}
    }
})