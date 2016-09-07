({
    init: function(cmp, event, helper) {
        helper.utils.tester.initTests(helper.testName, helper.testPlan);

        var locker = $A.lockerService.create(null, "the secret is silence");
        var secureWindow = locker["$envRec"];

        helper.tagNames.forEach(function(tagName) {
            helper.utils.tester.testSystem(window.document.createElement(tagName));
            
            var se = secureWindow.document.createElement(tagName);
            
            // We need to insure that iframe is added to the document because contentWindow is null for iframe elements not in a live document
            if (tagName === "IFRAME") {
	            se.style.display = "none";
	            secureWindow.document.body.appendChild(se);
            }
            
            helper.utils.tester.testSecure(se);
        });

        helper.utils.tester.showResults(cmp);
    }
})