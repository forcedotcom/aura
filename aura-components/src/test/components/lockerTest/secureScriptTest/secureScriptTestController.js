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
    },

    testScriptURL: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var scriptURL = "/auraFW/resources/qa/testScript.js"
        var hackFn = "(function(){arguments[0].testScript=true;arguments[0].testHack=window+'';})()";
        var hackChars = ["?\n", "#\u2028", "#\u2029"];
        
        try {
            hackChars.forEach(function(char) {
                var script = document.createElement("script");
                script.src = scriptURL + char + hackFn;
                document.body.appendChild(script);
                testUtils.assertUndefined(window.testHack, "Sandbox breakout via sourceURL");
                testUtils.assertEquals(window.testScript, true, "SecureScript did not load the associated resource");    
            });            
        } catch(e) {
            testUtils.fail("Sandbox breakout via sourceURL");    
        }
    },

    testSetAttributeNodeSrcAttribute: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        var src = document.createAttribute("src");
        src.value = "/auraFW/resources/qa/testScript.js";

        var script = document.createElement("script");
        script.setAttributeNode(src);
        document.body.appendChild(script);

        testUtils.addWaitForWithFailureMessage(
            true,
            function () {
                return window.testScript;
            },
            "Setting the 'src' attribute on a SecureScriptElement should load and evaluate in SecureWindow"
        );        
    },

    testSVGScriptLoadHref: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var script = document.createElementNS("http://www.w3.org/2000/svg","script");
        script.setAttribute("href", "/auraFW/resources/qa/testScript.js");
        document.body.appendChild(script);

        testUtils.addWaitForWithFailureMessage(
            true,
            function() {
                return window.testScript;
            },
            "SVGScriptElement was not loaded"
        );
    },

    testSVGScriptLoadHrefOnlySVG: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var script = document.createElement("script");
        script.setAttribute("href", "/auraFW/resources/qa/testScript.js");
        var testComplete = false;
        document.body.appendChild(script);

        setTimeout(function() {
            testComplete = true;            
        }, 2000);

        testUtils.addWaitFor(
            true,
            function() {
                return testComplete;
            },
            function() {
                testUtils.assertEquals(window.loadCount, undefined, "HTMLScriptElement loaded from href attribute");
            }
        );
    },

    testSVGScriptAttributesList: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var script = document.createElementNS("http://www.w3.org/2000/svg","script");
        script.setAttribute("href", "/auraFW/resources/qa/testScript.js");

        var attributeList = script.attributes;
        testUtils.assertEquals(attributeList.length, 1, "Incorrect number of attributes");
        testUtils.assertEquals(attributeList[0].name, "href", "href is not listed in the `Element.attributes`");
        testUtils.assertEquals(attributeList[0].value, "/auraFW/resources/qa/testScript.js", "href value mismatched");
    },

    testSVGScriptSetAttributeNode: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var script = document.createElementNS("http://www.w3.org/2000/svg","script");
        var hrefAttr = document.createAttribute('href');
        hrefAttr.value = "/auraFW/resources/qa/testScript.js";
        script.setAttributeNode(hrefAttr);
        document.body.appendChild(script);

        testUtils.addWaitForWithFailureMessage(
            true,
            function() {
                return window.testScript;
            },
            "Setting the attributeNode 'href' on a SVGScriptElement should load and evaluate in SecureWindow"
        );
    },

    testScriptDisableXlinkHref: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        
        var script = document.createElementNS("script");
        script.setAttribute("xlink:href", "/auraFW/resources/qa/testScript.js");
        testUtils.assertEquals(script.attributes.length, 0, "setAttribute xlink:href should be disabled on SecureScriptElement");

        script.setAttributeNS("http://www.w3.org/2000/svg", "xlink:href", "/auraFW/resources/qa/testScript.js");
        testUtils.assertEquals(script.attributes.length, 0, "setAttributeNS xlink:href should be disabled on SecureScriptElement");

        var attr = document.createAttribute("xlink:href");
        attr.value = "/auraFW/resources/qa/testScript.js";

        script.setAttributeNode(attr);
        testUtils.assertEquals(script.attributes.length, 0, "setAttributeNode xlink:href should be disabled on SecureScriptElement");
    }
})
