({
	DOWNARROW_KEY: 40,
	UPARROW_KEY: 38,
	ENTER_KEY: 13,

    /**
     * Test case created for W-2089843. Where anchor tags were not clickable on mobile. Running on all platforms that AutoComplete works on
     */
    testTouchListElm: {
	browsers : ["-IE7", "-IE8"],
	test : [function(cmp){
			this._changeInput(cmp, "h");
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
    },
    
    testTouchListElmWhenUseAutocompletePanelSet: {
    	browsers : ["-IE7", "-IE8"],
    	attributes: {usePanel: true},
        test : [function(cmp){
				this._changeInput(cmp, "h");
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
        },

	testDownArrowSelectsNextItem: {
		test : [function(cmp){
			this._changeInput(cmp, "h");
			var input = this._getInput(cmp,"autoComplete");
            this._fireKeydownEvent(input, this.DOWNARROW_KEY);
			this._fireKeydownEvent(input, this.DOWNARROW_KEY);
			this._fireKeydownEvent(input, this.ENTER_KEY);

		}, function(cmp){
			this._validateItemSelected(cmp,"autoComplete","hello world2");
		}]
	},

	testDownArrowLoopsToFirst: {
		test : [function(cmp){
			this._changeInput(cmp, "h");
			var input = this._getInput(cmp,"autoComplete");
            for (var i=0;i<11;i++) {
				this._fireKeydownEvent(input, this.DOWNARROW_KEY);
			}
			this._fireKeydownEvent(input, this.ENTER_KEY);
		}, function(cmp){
			this._validateItemSelected(cmp,"autoComplete","hello world1");
		}]
	},

	testUpArrowLoopsToLast: {
		test : [function(cmp){
			this._changeInput(cmp, "h");
			var input = this._getInput(cmp,"autoComplete");
            this._fireKeydownEvent(input, this.UPARROW_KEY);
			this._fireKeydownEvent(input, this.ENTER_KEY);
		}, function(cmp){
			this._validateItemSelected(cmp,"autoComplete","hello world10");
		}]
	},

	testUpArrowLoopsToLast: {
		test : [function(cmp){
			this._changeInput(cmp, "h");
			var input = this._getInput(cmp,"autoComplete");
            this._fireKeydownEvent(input, this.UPARROW_KEY);
			this._fireKeydownEvent(input, this.ENTER_KEY);
		}, function(cmp){
			this._validateItemSelected(cmp,"autoComplete","hello world10");
		}]
	},

	testDownArrowSelectsHeader: {
		test : [function(cmp){
			this._changeInputHeaderFooter(cmp, "h");
			var input = this._getInput(cmp,"autoCompleteHeaderFooter");
			this._fireKeydownEvent(input, this.DOWNARROW_KEY);
			this._fireKeydownEvent(input, this.ENTER_KEY);
		}, function(cmp){
			this._validateSelectEventFired(cmp,"header");
		}]
	},

	testUpArrowSelectsFooter: {
		test : [function(cmp){
			this._changeInputHeaderFooter(cmp, "h");
			var input = this._getInput(cmp,"autoCompleteHeaderFooter");
			this._fireKeydownEvent(input, this.UPARROW_KEY);
			this._fireKeydownEvent(input, this.ENTER_KEY);
		}, function(cmp){
			this._validateSelectEventFired(cmp,"footer");
		}]
	},

	_validateItemSelected: function(cmp, id, expectedText) {
		var actual = cmp.find(id).find("input").find("txt").getElement().value;
		$A.test.assertEquals(expectedText, actual, "Expected item not selected");
	},

	_validateSelectEventFired: function(cmp, expectedText) {
		var actual = cmp.find("autoCompleteSelectedEventResult").get("v.value");
		$A.test.assertEquals(expectedText, actual, "Expected item not selected");
	},

	_getInput: function(cmp, id) {
		return cmp.find(id).find("input")
	},

	_changeInput: function(cmp,inputValue) {
		cmp.get('c.handleInputChangeAutoComplete').runDeprecated({"getParam":function(value){return inputValue;}});
	},

	_changeInputHeaderFooter: function(cmp,inputValue) {
		cmp.get('c.handleInputChangeAutoCompleteHeaderFooter').runDeprecated({"getParam":function(value){return inputValue;}});
	},

	_fireKeydownEvent: function(cmp, keycode) {
		cmp.getEvent("keydown").setParams({
			keyCode: keycode,
			domEvent: {
				type: "keydown",
				preventDefault: function(){}
			}
		}).fire();
	}

})
