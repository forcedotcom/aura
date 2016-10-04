({
	onpress : function(component, event, helper) {
		var fooEvent = component.getEvent('foo');

		alert("{ component: " + component + ", event: " + event + ", document: " + document + ", window: " + window + ", fooEvent: " + fooEvent + " }");

		function perfTest(doc) {
			var t0 = performance.now();

			var iterations = 100000;
			for (var n = 0; n < iterations; n++) {
				doc.createElement("div");
			}

			var t1 = performance.now();

			console.log("Creation of " + iterations + " <div> elements took " + (t1 - t0) + " milliseconds.")
		}

		perfTest(document);
	}
})
