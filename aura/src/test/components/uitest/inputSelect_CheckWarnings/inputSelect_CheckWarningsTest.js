({
	failOnWarning : true,
	/**
	 * Making sure the the warning for this component is caught and fires when iteration is used. The body of the 
	 * test is used only to have something there. I have noticed that some tests can sometimes fail without it,
	 * so I added it in to be safe
	 */
	testInputSelect_WarningForIteration : {	
		auraWarningsExpectedDuringInit: ["<aura:iteration> is currently not supported inside <ui:inputSelect> since it does not properly attach the options to the component. This will lead to undefined behavior. Please use 'v.options' to insert your option objects instead."],
		attributes : { "case" : "iteration"},
		test : function(cmp) {
			this.dummyFunc();
		}
	},
    
	/**
	 * Check to make sure that when the user puts in invalid options (i.e. an option missing the value element)
	 */
	testInputSelect_WarningForInvalidOption : {	
		auraWarningsExpectedDuringInit: ["Option at index 1 in select component"],
		attributes : { "case" : "badsel"},
		test : function(cmp) {
			this.dummyFunc();
		}
	},
	/**
	 * Verify that correct usage of InputSelect does not throw warnings
	 */
	testInputSelect_WarningDoesNotShowUp : {	
		test : function(cmp) {
			this.dummyFunc();
		}
	},
	
	/**
	 * Dummy function that will return true in all cases
	 */
	dummyFunc : function(){
		return true;
	}

})
