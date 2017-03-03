({
	DOWNARROW_KEY: 40,
	UPARROW_KEY: 38,
	ENTER_KEY: 13,
	TAB_KEY: 9,

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
        
        /*
         * Test case to avoid infinite loop when there are 0 items and no header/footer
         * Bug: W-2800886
         */
        testFocusOnEmptyListDoesNotTriggerInfinteloop: {
    		test : [function(cmp){
    			autoComplete = cmp.find("autoCompleteNoData");
    			autoList = autoComplete.find("list");
    			$A.test.assertFalse(autoList.get("v.visible"), "Autocomplete list should not be visible");
    			autoList.set("v.visible",true);
            }, function(cmp){
            	$A.test.assertTrue($A.util.hasClass(autoList.getElement(), "loading"), 
    				"Loading indicator should be present");
            	var input = this._getInput(cmp,"autoCompleteNoData");
                try{
                	this._fireKeydownEvent(input, this.DOWNARROW_KEY);
                } catch (e) {
                	$A.test.fail(e.message);
                }
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

	testDownArrowSelectsHeader: {
		test : [function(cmp){
			this._changeInputHeaderFooter(cmp, "h");
			this._goToHeaderOrFooter(cmp, "header", this.ENTER_KEY);
		}, function(cmp){
			this._validateSelectEventFired(cmp,"header");
		}]
	},

	testUpArrowSelectsFooter: {
		test : [function(cmp){
			this._changeInputHeaderFooter(cmp, "h");
			this._goToHeaderOrFooter(cmp, "footer", this.ENTER_KEY);
		}, function(cmp){
			this._validateSelectEventFired(cmp,"footer");
		}]
	},

	testDownArrowToFooter : {
		test : [function (cmp) {
					this._changeInputHeaderFooter(cmp, "h");
					this._goToHeaderOrFooterFullList(cmp, "footer", this.ENTER_KEY);
				}, function (cmp) {
					this._validateSelectEventFired(cmp,"footer");
				}]
	},
	
	testUpArrowToHeader : {
		test : [function (cmp) {
					this._changeInputHeaderFooter(cmp, "h");
					this._goToHeaderOrFooterFullList(cmp, "header", this.ENTER_KEY);
				}, function (cmp) {
					this._validateSelectEventFired(cmp,"header");
				}]
	},
	
	testDownArrowLoopsFromFooterToHeader : {
		test : [function (cmp) {
					this._changeInputHeaderFooter(cmp, "h");
					this._goToHeaderOrFooter(cmp, "footer", this.ENTER_KEY);
				}, function (cmp) {
					this._validateSelectEventFired(cmp,"footer");
				}, function (cmp) {
					this._goToHeaderOrFooter(cmp, "header", this.ENTER_KEY);
				}, function (cmp) {
					this._validateSelectEventFired(cmp,"header");
				}]
	},
	
	testUpArrowLoopsFromHeaderToFooter : {
		test : [function (cmp) {
					this._changeInputHeaderFooter(cmp, "h");
					this._goToHeaderOrFooter(cmp, "header", this.ENTER_KEY);
				}, function (cmp) {
					this._validateSelectEventFired(cmp,"header");
				}, function (cmp) {
					this._goToHeaderOrFooter(cmp, "footer", this.ENTER_KEY);
				}, function (cmp) {
					this._validateSelectEventFired(cmp,"footer");
				}]
	},
	
	testTabAfterInput : {
		test : [function (cmp) {
		        	this._changeInputHeaderFooter(cmp, "h");
					var input = this._getInput(cmp,"autoCompleteHeaderFooter");
					this._fireKeydownEvent(input, this.TAB_KEY);
		        }, function (cmp) {
					this._validateSelectEventFired(cmp,"");
				}]
	},
	
	testTabAfterHighlightingHeader : {
		test : [function (cmp) {
		        	this._changeInputHeaderFooter(cmp, "h");
		        	this._goToHeaderOrFooter(cmp, "header", this.TAB_KEY);
		        }, function (cmp) {
					this._validateSelectEventFired(cmp,"header");
				}]
	},
	
	testTabAfterHighlightingFooter : {
		test : [function (cmp) {
		        	this._changeInputHeaderFooter(cmp, "h");
		        	this._goToHeaderOrFooter(cmp, "footer", this.TAB_KEY);
		        }, function (cmp) {
					this._validateSelectEventFired(cmp,"footer");
				}]
	},
	
	/**
     * Test if autocomplete matches special characters like '$', '#' etc
     */
    testMatchSpecialCharacters: {
        browsers : ["-IE7", "-IE8"],
        test : [function(cmp){
                this._changeInputSplChar(cmp, "$");
            }, function(cmp){
                // check that matching is done correctly and click on option
                var autoList = cmp.find("autoCompleteSplChar").find("list");
                var ul = autoList.getElement().getElementsByTagName("ul")[0];
                $A.test.assertTrue($A.util.hasClass(ul,"visible"), "Class name should contain visible");
                var listAnchors = ul.getElementsByTagName("a");
                $A.test.clickOrTouch(listAnchors[0]);
            }, function(cmp) {
                $A.test.addWaitForWithFailureMessage(true, function(){
                    var actual = cmp.find("autoCompleteSplChar").find("input").find("txt").getElement().value;
                    return actual === "!@#$%^*()";
                }, "The expected option was not selected");
            }]
        },
        
        /**
         * Test Case:
         * 1. Enter a character to make autocomplete match options
         * 2. Hover over a random option to highlight it
         * 3. Move to next option using the down arrow
         * 4. Check that this next option is highlighted
         */
        testHoverAndKeyboardHighlight : {
            browsers : ["-IE7", "-IE8"],
            RANDOM_OPTION : 3,
            test : [function(cmp){
                this._changeInput(cmp, "h");
            }, function(cmp){
                var randomOption = this.testHoverAndKeyboardHighlight.RANDOM_OPTION;
                var autoList = cmp.find("autoComplete").find("list");
                var ul = autoList.getElement().getElementsByTagName("ul")[0];
                $A.test.assertTrue($A.util.hasClass(ul, "visible"), "Class name should contain visible");
                var listOption = ul.getElementsByTagName("a")[randomOption];
                $A.test.fireDomEvent(listOption, "mouseover");
            }, function(cmp){
                var self = this;
                $A.test.addWaitForWithFailureMessage(true, function(){
                    var expectedOption = self.testHoverAndKeyboardHighlight.RANDOM_OPTION;
                    return self._validateItemHighlighted(cmp, expectedOption, "autoComplete");
                }, "The expected option was not highlighted");
            }, function(cmp){
                var input = this._getInput(cmp, "autoComplete");
                this._fireKeydownEvent(input, this.DOWNARROW_KEY);
            }, function(cmp){
                var self = this;
                $A.test.addWaitForWithFailureMessage(true, function(){
                    var expectedOption = self.testHoverAndKeyboardHighlight.RANDOM_OPTION + 1;
                    return self._validateItemHighlighted(cmp, expectedOption, "autoComplete");
                }, "The expected option was not highlighted");
            }]
        },
        
        testListClosedWhenInputCleared: {
	        browsers : ["-IE7", "-IE8"],
	        test : [function(cmp){
	                this._changeInput(cmp, "h");
	            }, function(cmp){
					this._validateAutocompleteListVisiblity(cmp, "autoComplete", true);
	            }, function(cmp) {
					this._changeInput(cmp, "");
	            }, function(cmp) {
	            	this._validateAutocompleteListVisiblity(cmp, "autoComplete", false);
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
	
	_validateItemHighlighted: function(cmp, option, autocompleteCmp) {
        var autoList = cmp.find(autocompleteCmp).find("list");
        var ul = autoList.getElement().getElementsByTagName("ul")[0];
        var expectedListElement = ul.getElementsByTagName("li")[option];
        return $A.util.hasClass(expectedListElement,"highlighted");
	},
	
	_validateAutocompleteListVisiblity: function(cmp, input, visibility) {
		var autoList = cmp.find(input).find("list");
		var ul = autoList.getElement().getElementsByTagName("ul")[0];
		$A.test.addWaitForWithFailureMessage(visibility, function(){
        	return $A.util.hasClass(ul,"visible");
		}, "Class name should contain visible");
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
	
	_changeInputSplChar: function(cmp,inputValue) {
        cmp.get('c.handleInputChangeAutoCompleteSplChar').runDeprecated({"getParam":function(value){return inputValue;}});
    },

	_fireKeydownEvent: function(cmp, keycode) {
		cmp.getEvent("keydown").setParams({
			keyCode: keycode,
			domEvent: {
				type: "keydown",
				preventDefault: function(){}
			}
		}).fire();
	},
	
	/**
	 * Navigates to Header or Footer and performs a keydown with the specified key
	 * To Header: Down Arrow from Footer or from default inital state
	 * To Footer: Up Arrow from Header or from default initial state
	 */
	_goToHeaderOrFooter : function (cmp, option, key) {

		var input = this._getInput(cmp,"autoCompleteHeaderFooter");
		
		if(option === "header") {
			this._fireKeydownEvent(input, this.DOWNARROW_KEY);
		}
		else if(option === "footer") {
			this._fireKeydownEvent(input, this.UPARROW_KEY);
		}
		
		this._fireKeydownEvent(input, key);
	},
	
	/**
	 * Traverses the entire list to reach the Header or Footer and
	 * performs a keydown with the specified key
	 */
	_goToHeaderOrFooterFullList : function (cmp, option, key) {
		var arrowKey = null;
		var input = this._getInput(cmp,"autoCompleteHeaderFooter");
		
		if(option === "header") {
			arrowKey = this.UPARROW_KEY;
		}
		else if(option === "footer") {
			arrowKey = this.DOWNARROW_KEY;
		}
		
		for (var i=0;i<12;i++) {
			this._fireKeydownEvent(input, arrowKey);
		}
		this._fireKeydownEvent(input, key);
		
	}

})
