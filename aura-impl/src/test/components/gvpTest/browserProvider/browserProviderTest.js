({
    testDesktopBrowser:{
	browsers: [ 'GOOGLECHROME', 'IE11', 'IE10', 'IE9', 'IE8', 'IE7', 'FIREFOX', 'SAFARI'],
    	test:function(cmp){
	    $A.test.assertEquals("DESKTOP", $A.get("$Browser.formfactor"));
	}
    },
    testIOSBrowser: {
	browsers: [ 'IPAD', 'IPHONE'],
	test:function(cmp){
	    $A.test.assertTrue($A.get("$Browser.isios"));
	}
    },
    testIsPhone: {
	browsers: [ 'IPHONE', 'ANDROID_PHONE'],
	test:function(cmp){
	    $A.test.assertTrue($A.get("$Browser.isphone"));
	    $A.test.assertFalse($A.get("$Browser.istablet"));
	    $A.test.assertEquals("PHONE", $A.get("$Browser.formfactor"));
	}
    },
    testIsAndroid: {
	browsers: [ 'ANDROID_TABLET', 'ANDROID_PHONE'],
	test:function(cmp){
	    $A.test.assertTrue($A.get("$Browser.isandroid"));
	}
    },
    testIsTablet: {
	browsers: [ 'ANDROID_TABLET', 'IPAD'],
	test:function(cmp){
	    $A.test.assertTrue($A.get("$Browser.istablet"));
	    $A.test.assertFalse($A.get("$Browser.isphone"));
	    $A.test.assertEquals("TABLET", $A.get("$Browser.formfactor"));
	}
    },
    //Verify that expression to get non existing browser info doesn't cause server action unlike labelvalueprovider
    testNonExistingBrowserInfo:{
	browsers: [ 'GOOGLECHROME'],
    	test:function(cmp){
	    $A.test.assertUndefinedOrNull($A.get("$Browser.FooBared"));
	    $A.test.assertFalse($A.test.isActionPending(),
            	"Requesting a non existing property on $Browser should not cause any server actions");
	}
    }
})