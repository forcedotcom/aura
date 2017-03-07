({
    testScriptSrcExposed: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var script =  document.createElement("script");

        script.src = "foo.js";
        testUtils.assertEquals("foo.js", script.src, "Unexpected script source");
        testUtils.assertEquals("foo.js", script.getAttribute("src"), "Unexpected script source");

        script.setAttribute("src", "foo2.js");
        testUtils.assertEquals("foo2.js", script.src, "Unexpected script source");
        testUtils.assertEquals("foo2.js", script.getAttribute("src"), "Unexpected script source");
    },

    testGetSetAttribute: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        var script = document.createElement("script");

        testUtils.assertEquals(null, script.getAttribute("data-foo"), "Unexpected unset attribute value");

        script.setAttribute("data-foo", "bar");
        testUtils.assertEquals("bar", script.getAttribute("data-foo"), "Unexpected attribute value");
        testUtils.assertEquals("bar", script.dataset.foo, "Unexpected attribute value");

        script.setAttribute("data-foo", "");
        testUtils.assertEquals("", script.getAttribute("data-foo"), "Unexpected attribute value, should be null");


        script.removeAttribute("data-foo");
        testUtils.assertEquals(null, script.getAttribute("data-foo"), "Unexpected attribute value, should be undefined");
    },

    testGetSetAttributeNode: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var script = document.createElement("script");
        var attrName = "data-src",
        attrValue = "/foo/bar.js",
        attrNewValue = "/monkey/hanging.js";

        testUtils.assertEquals(null, script.getAttributeNode(attrName), "Unexpected unset attribute node value");

        script.setAttribute(attrName, attrValue);
        var attrNode = script.getAttributeNode(attrName);
        testUtils.assertEquals(attrValue, attrNode.value, "Unexpected attribute node value");

        attrNode.value = attrNewValue;
        script.setAttributeNode(attrNode);
        testUtils.assertEquals(attrNewValue, script.getAttributeNode(attrName).value, "Unexpected attribute node value");

        script.removeAttributeNode(attrNode);
        testUtils.assertNull(script.getAttribute(attrName), "Unexpected attribute value, should be null after removing attribute node")
    },

    testLoadScript: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var script = document.createElement("script");
        script.src = "/auraFW/resources/qa/testScript.js";

        var listenerCalled, eventThrown, eventThrownTarget;
        var eventListener = function(event){
            listenerCalled= true;
            eventThrown = event;
            eventThrownTarget = event.target;
        };
        script.addEventListener("load", eventListener);

        document.body.appendChild(script);
        testUtils.addWaitForWithFailureMessage(
                true,
                function() {
                    return listenerCalled;
                },
                "onload event listner not invoked",
                function(){
                    testUtils.assertEquals("load", eventThrown.type, "Type of the event thrown dispatched not as expected");
                    testUtils.assertEquals(true, window.testScript, "Global variable set by loaded script not showing up");
                    testUtils.assertEquals(script, eventThrownTarget, "window.top expected be a SecureIFrameContentWindow");
                });
    }
})
