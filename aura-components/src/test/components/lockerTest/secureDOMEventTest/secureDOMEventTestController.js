({
    doInit: function(cmp) {
        var accounts = [{ id: 1, Name: "account1" }];
        cmp.set("v.accounts", accounts);
    },

    testClickEvent: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var domEvent;
        var element = cmp.find("title").getElement();
        element.addEventListener("click", function(e) {
        	domEvent = e;
        });
        element.click(); 
        testUtils.assertStartsWith("SecureDOMEvent", domEvent.toString());
        testUtils.assertStartsWith("SecureElement", domEvent.target.toString(), "Expected event.target to return SecureElement");
        testUtils.assertEquals("click", domEvent.type, "Unexpected DOM event type");
        // Verify non-wrapped method is still accessible
        testUtils.assertEquals("number", typeof domEvent.timeStamp);
    },

    testInitEvent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var domEvent;
        var element = document.createElement("input");
        element.addEventListener("change", function(e) {
            domEvent = e;
        });
        var event = document.createEvent("HTMLEvents");
        event.initEvent("change", false, true);
        element.dispatchEvent(event);

        testUtils.assertDefined(domEvent, "Event handler never called after firing event created via document.createEvent");
    },

    testEventView: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var domEvent;
        var element = cmp.find("title").getElement();
        element.addEventListener("click", function(e) {
            domEvent = e;
        });

        element.click(); 

        testUtils.assertTrue(domEvent.view == window);
    },

    testEventTargetOfHtmlElementHandler: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        cmp._event = null;
        var buttonInMarkup = document.getElementById("buttonInMarkup");
        buttonInMarkup.click();
        testUtils.assertStartsWith("SecureElement", cmp._event.target.toString());

        cmp._event = null;
        var buttonInIteration = document.getElementById("buttonInIteration");
        buttonInIteration.click();
        testUtils.assertStartsWith("SecureElement", cmp._event.target.toString());

        cmp._event = null;
        var buttonInIf = document.getElementById("buttonInIf");
        buttonInIf.click();
        testUtils.assertStartsWith("SecureElement", cmp._event.target.toString());

        cmp._event = null;
        var buttonInNestedIteration = document.getElementById("buttonInNestedIteration");
        buttonInNestedIteration.click();
        testUtils.assertStartsWith("SecureElement", cmp._event.target.toString());

        cmp._event = null;
        var buttonInFacet = document.getElementById("buttonInFacet");
        buttonInFacet.click();
        testUtils.assertStartsWith("SecureElement", cmp._event.target.toString());
    },

    handleClick: function(cmp, event) {
        cmp._event = event;
    }
})