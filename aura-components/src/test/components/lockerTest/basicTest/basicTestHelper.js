({
	getWrappersFromHelper : function() {
		var log = {
			'document' : document,
			'window' : window,
			'$A' : $A
		};
		return log;
	},

	accessDocumentBody : function(cmp) {
		// This line should throw an Exception to be caught by the test. Log the return if we happen to get one for
		// easier debugging
		var body = document.body;
		cmp.set("v.log", body);
	},

	testFunction : function() {
		var f = new Function("x", "y", "return x + y");
		if (f(1, 2) !== 3) {
			throw new Error("Unable to use new Function()");
		}
	},

	getSecureElementDynamically : function(cmp) {
		var div = document.createElement("div");
		cmp.set("v.log", div);
	},

	getSecureElementFromMarkup : function(cmp) {
		var div = cmp.find("content").getElement();
		cmp.set("v.log", div);
	},

	doTestEvalForUndefined : function(cmp, testCase, testUtils) {
		testUtils.assertStartsWith("Global window via " + testCase.toString() + ": undefined", this.testExpression(testCase));
	},

	doTestEvalForSecureWindow : function(cmp, testCase, testUtils) {
		testUtils.assertStartsWith("Global window via " + testCase.toString() + ": SecureWindow", this.testExpression(testCase));
	},

	testExpression : function(testCase) {
		var result = testCase();
		return "Global window via " + testCase.toString() + ": " + result;
	}
})
