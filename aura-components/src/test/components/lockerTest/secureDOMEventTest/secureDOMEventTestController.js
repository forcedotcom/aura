({
    onclick: function(cmp) {
        cmp.set("v.buttonClickedFlag", true);
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
        var element = document.createElement("div");
        element.addEventListener("click", function(e) {
            domEvent = e;
        });
        var event = document.createEvent("MouseEvents");
        event.initEvent("click");
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

    testMarkupDefinedClickHandler: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var button = cmp.find("button");
        button.getElement().click();
        testUtils.assertTrue(cmp.get("v.buttonClickedFlag"), "Click handler never called after clicking button");
    }
})