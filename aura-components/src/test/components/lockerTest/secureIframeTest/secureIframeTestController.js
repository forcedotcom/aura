({
    init: function(cmp) {
        function iframeHandler(event) {
            cmp.set("v.messageReceived", event.data.msg);
        }
        window.addEventListener("message", iframeHandler, false);
    },

    testIframeAttributes: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var attributesWhitelist = event.getParam("arguments").attributesWhitelist;
        var attributesBlacklist = event.getParam("arguments").attributesBlacklist;
        var iframe = cmp.find("iframe").getElement();

        attributesWhitelist.forEach(function(name) {
            testUtils.assertTrue(name in iframe);
        });
        
        attributesBlacklist.forEach(function(name) {
            testUtils.assertFalse(name in iframe);
        });

        function verifySrcdocBlocked(iframe, name, f) {
        	try {
        		f();
        		testUtils.fail("SecureIFrameElement should have blocked setting of src doc attribute");
    		} catch (e) {
    			testUtils.assertEquals("SecureElement: [object HTMLIFrameElement]{ key: {\"namespace\":\"lockerTest\"} } does not permit setting the srcdoc attribute!", e.toString());
    		} 	
    		
    		// Try to access the attribute via SecureElement.attributes
    		iframe.attributes.forEach(function(attr) {
    			testUtils.assertTrue(attr.name.toLowerCase() !== name.toLowerCase(), "SecureElement.attributes should not have contained: " + name);
			});
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
                    cw.postMessage({ msg: "Message from parent" }, "*");
                    testUtils.addWaitForWithFailureMessage(
                            "Message from iframe: Message from parent",
                            function() {
                                return cmp.get("v.messageReceived");
                            },
                            "Never received message back from iframe");
                });
    }
})