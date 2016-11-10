({
    init: function(cmp, event, helper) {
        helper.utils.tester.initTests(helper.testName, helper.testPlan);

        var locker = $A.lockerService.create(null, "the secret is silence");
        var secureWindow = locker["$envRec"];
        var sdoc = secureWindow.document;

        function test(tagName) {
        	var ns = this && this.namespace;
        	var raw = ns ? document.createElementNS(ns, tagName) : document.createElement(tagName);
            helper.utils.tester.testSystem(raw);
            
            var se = ns ? sdoc.createElementNS(ns, tagName) : sdoc.createElement(tagName);
            
            // We need to insure that iframe is added to the document because contentWindow is null for iframe elements not in a live document
            if (tagName === "IFRAME") {
	            se.style.display = "none";
	            secureWindow.document.body.appendChild(se);
            }
            
            helper.utils.tester.testSecure(se, raw);
        }
        
        helper.tagNames.forEach(test);
        helper.svgTagNames.forEach(test, { namespace: "http://www.w3.org/2000/svg" });
        
        // Test text node
        var text = document.createTextNode("TEST");
        helper.utils.tester.testSystem(text);
        helper.utils.tester.testSecure(sdoc.createTextNode("TEST"), text);
    
        helper.utils.tester.showResults(cmp);
    }
})