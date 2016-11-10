({  
    testSecureMutationObserver: function(cmp, event, helper) {
		var testUtils = cmp.get("v.testUtils");
		var actual;
		
		var observer = new MutationObserver(function(mutations) {
			actual = mutations;		
		});
		
		var el = cmp.find("content").getElement();
		
		var config = { attributes: true, childList: true, characterData: true };
		observer.observe(el, config);
		
		el.classList.toggle("foo");
		
        testUtils.addWaitFor(true, 
        	function() { return actual !== undefined; },
        	function() {
        		testUtils.assertTrue(actual.length === 1);
        		
        		var record = actual[0];
        		var attributeName = record.attributeName;
        		var target = record.target;

	       		testUtils.assertStartsWith("SecureElement", target.toString(), "MutationRecord.target element should be SecureElement");
        		
        		testUtils.assertEquals("attributes", record.type);
        		testUtils.assertEquals("class", attributeName);
        		testUtils.assertEquals("foo", target.getAttribute(attributeName));
        		
	       		// Now test synchronous MutationObserver.takeRecord() method
	       		el.textContent = "bar";
	       		var records = observer.takeRecords();
        		testUtils.assertTrue(records.length === 1);

        		var target = records[0].target;
	       		testUtils.assertStartsWith("SecureElement", target.toString(), "MutationRecord.target element should be SecureElement");
        		testUtils.assertEquals("bar", target.textContent);
        		
				observer.disconnect();
        	}
        );
    },

    testSecureMutationObserverFiltersRecords: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var actual = [];
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                actual.push(mutation);
            });
        });

        var el = document.getElementById("facetContainer");
        var config = { attributes: true, childList: true, characterData: true, subtree: true };
        observer.observe(el, config);

        var facet = cmp.find("facet");
        facet.updateDom();
        // also update a DOM element we have access to so the test knows not to wait any longer
        document.getElementById("insideContainer").classList.toggle("shouldObserve");

        testUtils.addWaitForWithFailureMessage(true,
            function() { return actual !== undefined },
            "MutationObserver callback not called after DOM change",
            function() {
                testUtils.assertEquals(1, actual.length, "MutationObserver should only observer change to DOM element it has access to");
                testUtils.assertEquals("shouldObserve", actual[0].target.className, "Unexpected DOM change observed");
            })
        ;
    }
})
