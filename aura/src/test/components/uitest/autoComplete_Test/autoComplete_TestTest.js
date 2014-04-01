({
    /**
     * Test case created for W-2089843. Where anchor tags were not clickable on mobile. Running on all platforms that AutoComplete works on
     */
    testTouchListElm: {
	browsers : ["-IE7", "-IE8"],
	test : function(cmp){
	    //Grab Autocomplete
	    var autoCmp = cmp.find("autoComplete");
	    var autoList = autoCmp.find("list");
	    
	    //Fire change event for autocomplete
	    cmp.get('c.handleInputChangeAutoComplete').runDeprecated({"getParam":function(value){return "h";}});
	    
	    //Get the anchor in the list to click as the user would
	    var ul = autoList.getElement().getElementsByTagName("ul")[0];
	    var listAnchors = ul.getElementsByTagName("a");
	    $A.test.clickOrTouch(listAnchors[1]);
	    
	    //assert
	    var actual = autoCmp.find("input").find("txt").getElement().value;
	    var expected = "hello world2"
	    $A.test.assertEquals(expected, actual, "List element in autocompleteList is not clickable!");
	}
    }
})
