({
    testDesktopBrowser:{
	browsers: [ 'GOOGLECHROME', 'IE11', 'IE10', 'IE9', 'IE8', 'IE7', 'FIREFOX', 'SAFARI'],
    	test:function(cmp){
		    $A.test.assertEquals("DESKTOP", $A.get("$Browser.formFactor"));
		}
    },
    testIOSBrowser: {
	browsers: [ 'IPAD', 'IPHONE'],
	test:function(cmp){
	    $A.test.assertTrue($A.get("$Browser.isIOS"));
	}
    },
    testIsPhone: {
	browsers: [ 'IPHONE', 'ANDROID_PHONE'],
	test:function(cmp){
	    $A.test.assertTrue($A.get("$Browser.isPhone"));
	    $A.test.assertFalse($A.get("$Browser.isTablet"));
	    $A.test.assertEquals("PHONE", $A.get("$Browser.formFactor"));
	}
    },
    testIsAndroid: {
	browsers: [ 'ANDROID_TABLET', 'ANDROID_PHONE'],
	test:function(cmp){
	    $A.test.assertTrue($A.get("$Browser.isAndroid"));
	}
    },
    testIsTablet: {
	browsers: [ 'ANDROID_TABLET', 'IPAD'],
	test:function(cmp){
	    $A.test.assertTrue($A.get("$Browser.isTablet"));
	    $A.test.assertFalse($A.get("$Browser.isPhone"));
	    $A.test.assertEquals("TABLET", $A.get("$Browser.formFactor"));
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