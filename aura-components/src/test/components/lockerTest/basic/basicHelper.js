({
	helperMethod : function() {
		alert("{ document: " + document.toString() + " }");
	},
	
	log : function(component, message, blockedExploit) {
		var content = component.find("content");
		var messageDiv = document.createElement("div");
        if (blockedExploit) {
            messageDiv.style.color = "white";
            messageDiv.style.backgroundColor = "green";
            messageDiv.style.opacity = "0.4";
        }
        
		messageDiv.appendChild(document.createTextNode(message));
		content.getElement().appendChild(messageDiv);
	},

	testSymbol : function(testCase) {
		var symbol = testCase.toString();
		
		// Test out eval, self, and Function tricks
		try {
			var result = testCase();
			this.helper.log(this.component, "Global window via " + symbol + ": " + result, !result);
		} catch (x) {
			var error = x.toString();
			if (error.indexOf("TypeError") < 0 && error.indexOf("ReferenceError") < 0 && error.indexOf("Security violation: use of __pro" + "to__") < 0
					&& error.indexOf("EvalError: Refused to evaluate a string as JavaScript because 'unsafe-ev" + "al' is not an allowed source of script") < 0
					&& error.indexOf("Error: call to eval() blocked by CSP") < 0 && error.indexOf("Error: call to Function() blocked by CSP") < 0
					&& error.indexOf("SecurityError") < 0) {
				throw new Error("Unexpected exception: " + x.toString());
			}
			
			this.helper.log(this.component, "Blocked: " + symbol, true);
		}
	},

	verifyElementCount: function(className, expected) {
		var els = document.getElementsByClassName(className);
		if (els.length !== expected) {
			throw new Error("Wrong number of <" + tagName + "> returned from SecureDocument.getElementsByClassName('" + className + "'): " + els.length);
		}
	}
})