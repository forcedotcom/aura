({
	helperMethod : function() {
		alert("{ document: " + document.toString() + " }");
	},

	log : function(component, message) {
		var content = component.find("content");
		var messageDiv = document.createElement("div");
		messageDiv.appendChild(document.createTextNode(message));
		content.getElement().appendChild(messageDiv);
	},

	testSymbol : function(symbol) {
		// Test out eval, self, and Function tricks
		try {
			var result = eval(symbol);
			this.helper.log(this.component, "Global window via " + symbol + ": " + result);
		} catch (x) {
			var error = x.toString();
			if (error.indexOf("TypeError") < 0 && error.indexOf("ReferenceError") < 0 && error.indexOf("Security violation: use of __pro" + "to__") < 0) {
				throw new Error("Unexpected exception: " + x.toString());
			}

			this.helper.log(this.component, "Blocked: " + symbol);
		}
	},

	// DCHASMAN TODO Move this POC/spike code to LockerService once things are ready to go

	indexOfLeftMatchingBracket : function(text) {
		var i = text.length - 1;
		var rightBracket = text.charAt(i);
		var leftBracket = rightBracket === ")" ? "(" : "[";

		i--;

		var nesting = 1;
		while (nesting > 0) {
			if (i < 0) {
				throw new Error("Unable to find left match for '" + text + "'");
			}

			var c = text.charAt(i);

			if (c === rightBracket) {
				nesting++;
			} else if (c === leftBracket) {
				nesting--;
			}

			i--;
		}

		return i;
	},

	findBoundsOfExpression : function(text) {
		var end = text.length;

		var left = text.charAt(end - 1);
		var i = end - 1;
		if (left === ")") {
			i = this.indexOfLeftMatchingBracket(text.substring(0, end)) + 1;
		} else if (left === "]") {
			// Match to left square bracket and then recurse
			i = this.indexOfLeftMatchingBracket(text.substring(0, end));

			i = this.findBoundsOfExpression(text.substring(0, i + 1)).begin;
		} else {
			var validSymbolNameRegEx = /[a-z0-9$_]/i;

			// Find first left that is not alphanumeric
			while (i >= 0 && validSymbolNameRegEx.test(text.charAt(i))) {
				i--;
			}

			i++;
		}

		return {
			begin : i,
			end : end
		};
	},

	createSafeCtorExpression : function(text) {
		var search = ".constructor";
		var end = text.indexOf(search);

		var constructorExpression = text.substring(0, end);

		var bounds = this.findBoundsOfExpression(constructorExpression);

		var result = text.substring(0, bounds.begin) + "safeCtor(" + text.substring(bounds.begin, bounds.end) + ").ctor" + text.substring(end + search.length);

		return result.replace(/.constructor/, ".ctor");
	}
})