({
	failOnWarning : true,
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
