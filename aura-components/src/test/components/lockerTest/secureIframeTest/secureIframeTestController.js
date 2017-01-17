({
    testIframeAttributes: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var attributesWhitelist = event.getParam("arguments").attributesWhitelist;
        var attributesBlacklist = event.getParam("arguments").attributesBlacklist;
        var iframe = cmp.find("iframe").getElement();

        attributesWhitelist.forEach(function(name) {
            testUtils.assertTrue(name in iframe);
        });
        
        attributesBlacklist.forEach(function(name) {
            testUtils.assertUndefined(iframe[name], "Expected property '" + name + "' to be undefined on SecureIFrameElement");
        });

        // Update: we don't block invalid attributes anymore, setting an invalid attribute is a no-op, getting will return null
        function verifySrcdocBlocked(frame, attrName, f) {
       		f();
    		// Try to access the attribute via SecureElement.attributes
    		frame.attributes.forEach(function(attr) {
    			testUtils.assertTrue(attr.name.toLowerCase() !== attrName.toLowerCase(), "SecureElement.attributes should not have contained: " + name);
			});
            testUtils.assertNull(frame.getAttribute(attrName), "getAttribute() on an invalid attribute should return null");
        }

        // Check to insure that SecureIFrameElement.setAttribute[NS]("srcdoc", value) is blocked
        ["srcdoc", "SrCdOc"].forEach(function(name) {
        	verifySrcdocBlocked(iframe, name, function() {
        		iframe.setAttribute(name, "foo");
        	})

        	verifySrcdocBlocked(iframe, name, function() {
        		iframe.setAttributeNS("http://www.w3.org/1999/xhtml", name, "foo");
        	})
    	});
    },

    testIframeMethods: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var methodsWhitelist = event.getParam("arguments").methodsWhitelist;
        var iframe = cmp.find("iframe").getElement();

        methodsWhitelist.forEach(function(name) {
            testUtils.assertDefined(iframe[name]);
        });
    },

    testContentWindow: function(cmp, event, handler) {
        var testUtils = cmp.get("v.testUtils");
        var iframeLoaded = false;
        var iframe = cmp.find("iframe").getElement();
        var cw = iframe.contentWindow;

        // setup message handler on main frame
        function iframeHandler(event) {
            cmp.set("v.messageReceived", event.data.msg);
        }
        window.addEventListener("message", iframeHandler, false);

        testUtils.assertStartsWith("SecureIFrameContentWindow", cw.toString(), "iframe.contentWindow expected to be a SecureIFrameContentWindow");
        testUtils.assertDefined(cw.postMessage);

        iframe.addEventListener("load", function() {
            iframeLoaded = true;
          });

        testUtils.addWaitForWithFailureMessage(
                true,
                function() {
                    return iframeLoaded;
                },
                "iFrame component never initialized",
                function() {
                    // iframe will echo back original message with some additional text prepended
                    testUtils.addWaitForWithFailureMessage(
                            "Message from iframe: Message from parent",
                            function() {
                                // timing issues on slower builds so keep re-sending message until we get a response
                                cw.postMessage({ msg: "Message from parent" }, "*");
                                return cmp.get("v.messageReceived");
                            },
                            "Never received message back from iframe");
                });
    },

    testMessageChannel: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var iframeLoaded = false;
        var iframe = cmp.find("iframeMessageChannel").getElement();
        var cw = iframe.contentWindow;
        var messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = handleMessage;
        function handleMessage(e) {
            cmp.set("v.messageReceived", e.data);
        }

        iframe.addEventListener("load", function() {
            iframeLoaded = true;
          });

        testUtils.addWaitForWithFailureMessage(
                true,
                function() {
                    return iframeLoaded;
                },
                "iFrame component never initialized",
                function() {
                    cw.postMessage("Message from parent", "*", [messageChannel.port2]);

                    // iframe will echo back original message with some additional text prepended
                    testUtils.addWaitForWithFailureMessage(
                            "Message from iframe: Message from parent",
                            function() {
                                return cmp.get("v.messageReceived");
                            },
                            "Never received message back from iframe");
                });
    }
})