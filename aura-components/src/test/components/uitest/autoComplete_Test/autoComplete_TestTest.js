({
    /**
     * Test case created for W-2089843. Where anchor tags were not clickable on mobile. Running on all platforms that AutoComplete works on
     */
    testTouchListElm: {
	browsers : ["-IE7", "-IE8"],
	test : [function(cmp){	    
	        //Fire change event for autocomplete
	        cmp.get('c.handleInputChangeAutoComplete').runDeprecated({"getParam":function(value){return "h";}});
	    }, function(cmp){
	    	//Grab Autocomplete List
		    var autoList = cmp.find("autoComplete").find("list");
		    
	        //Get the anchor in the list to click as the user would
	        var ul = autoList.getElement().getElementsByTagName("ul")[0];
	        //Test case for W-2428589
	        $A.test.assertTrue($A.util.hasClass(ul,"visible"), "Class name should contain visible");
        	var listAnchors = ul.getElementsByTagName("a");
	        $A.test.clickOrTouch(listAnchors[1]);
	    }, function(cmp){
	        //assert
	        var actual = cmp.find("autoComplete").find("input").find("txt").getElement().value;
	        var expected = "hello world2"
	        $A.test.assertEquals(expected, actual, "List element in autocompleteList is not clickable!");
	    }]
    }
})
