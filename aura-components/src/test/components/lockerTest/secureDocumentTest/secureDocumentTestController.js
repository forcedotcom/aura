({
    testCreateDocumentFragmentReturnsSecureElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var documentFragment = document.createDocumentFragment();
        testUtils.assertStartsWith("SecureElement", documentFragment.toString(), "Expected document.createDocumentFragment()"
                + " to return a SecureElement");
    },

    testCreateDocumentFragmentAndVerifyShape: function(cmp){
        var testUtils = cmp.get("v.testUtils");
        var documentFragment = document.createDocumentFragment();
        var nodeList = documentFragment.querySelectorAll("*");
        testUtils.assertEquals("[object NodeList]", nodeList.toString() , "querySelectorAll() method"+
            " expected to return a NodeList");
        testUtils.assertEquals(0, nodeList.length);
        var children = documentFragment.children;
        testUtils.assertEquals("[object HTMLCollection]", children.toString(), "documentFragment.children property"+
            " expected to return a HTMLCollection");
        testUtils.assertEquals(0, children.length);
    },

    testCreateScriptElementReturnsSecureElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var scriptElement = document.createElement("script");
        testUtils.assertStartsWith("SecureElement", scriptElement.toString(), "Expected document.createElement(script)"
                + " to return a SecureElement");
    },

    testCreateTextNodeReturnsSecureElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var textNode = document.createTextNode();
        testUtils.assertStartsWith("SecureElement", textNode.toString(), "Expected document.createTextNode()"
                + " to return a SecureElement");
    },

    testCreateElementsAndPushToMarkup: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var docFragment = document.createDocumentFragment();
        var span = document.createElement("span");
        span.setAttribute("data-lockerAttr", "hello from the locker");
        docFragment.appendChild(span);
        var content = cmp.find("content").getElement();
        content.appendChild(docFragment);
        var actual = content.childNodes[0].getAttribute("data-lockerAttr");
        testUtils.assertEquals("hello from the locker",  actual, "Unexpected attribute on document"
                + " elements created in controller");
    },

    testGetElementByIdReturnsSecureElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var titleElement = document.getElementById("title");
        testUtils.assertStartsWith("SecureElement", titleElement.toString(), "Expected document.getElementById()"
                + " to return a SecureElement");
    },

    testQuerySelectorReturnsSecureElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var newDiv = document.createElement("div");
        newDiv.id = "foo";
        var markupDiv = cmp.find("content").getElement();
        markupDiv.appendChild(newDiv);
        var querySelectorRet = document.querySelector("#foo");
        testUtils.assertStartsWith("SecureElement", querySelectorRet.toString(), "Expected document.querySelector()"
                + " to return a SecureElement");
    },

    testSecureDocumentCookieFiltersSystemMode: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var systemModeCookie = event.getParam("arguments").cookie;
        var userModeCookie = document.cookie;
        testUtils.assertNotEquals(systemModeCookie, userModeCookie, "System mode cookie should be filtered out in user mode");
    },

    testCookiesIsolatedToNamespace: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var otherNs = cmp.find("otherNs");
        var newKey = "keyChild";

        document.cookie = "key1=value1";
        testUtils.assertTrue(document.cookie.indexOf("key1=value1") !== -1);
        otherNs.addCookie(newKey);
        testUtils.assertTrue(document.cookie.indexOf(newKey) === -1);
    },

    testCookiesAddRemove: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var otherNs = cmp.find("otherNs");

        document.cookie = "key1=value1";
        testUtils.assertTrue(document.cookie.indexOf("key1=value1") !== -1);
        document.cookie = "key2=value2";
        testUtils.assertTrue(document.cookie.indexOf("key2=value2") !== -1);
        document.cookie = "key1=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        testUtils.assertTrue(document.cookie.indexOf("key1=value1") === -1);
        testUtils.assertTrue(document.cookie.indexOf("key2=value2") !== -1);
    },

    testDocumentTitle: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        document.title = "secureDocumentTest";
        testUtils.assertEquals("secureDocumentTest", document.title);
    },

    testQuerySelectorAllReturnsSecureNodeList: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var result = document.querySelectorAll('*');

        var i = 0;
        ["HTML", "HEAD", "BODY", "DIV", "DIV"].forEach(function(tagName) {
	        testUtils.assertEquals(tagName, result[i++].nodeName, "Expected document.querySelectorAll('*') to return " + tagName + " element");
        });
    },

    testDocumentBodyConstructorNotInvocable: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var bodyConstructor = document.body.constructor;
        try {
            new bodyConstructor();
            testUtils.fail("document.body.constructor should not be usable like a constructor in Locker");
        } catch (e) {
            testUtils.assertEquals("Illegal constructor", e.message, "Unexpected error message when using document.body.constructor like a constructor");
        }
        try {
            bodyConstructor();
            testUtils.fail("document.body.constructor should not be usable like a function in Locker");
        } catch (e) {
            testUtils.assertEquals("Illegal constructor", e.message, "Unexpected error message when using document.body.constructor like a function");
        }
    },

    testCreateElementCoersionExploit: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var el = document.createElement({
            toLowerCase: function() { return 'a' },
            toString: function() { return 'script' }
        });
        testUtils.assertStartsWith("SecureElement", el.toString(), "createElement string coersion exploit should be blocked" +
                " and a SecureElement should be returned, but got " + el.toString());
    },

    testCreateElementNSForSVGElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var element = document.createElementNS('http://www.w3.org/2000/svg', 'SVG');

        var tagName = element.tagName.toLowerCase();
        testUtils.assertEquals("svg", tagName, "Expecting a SVG Element");
    },

    testGetElementsByTagNameForScriptTag: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var expectedSrc = '/test/src/url';
        var scriptElement = document.createElement("script");
        scriptElement.setAttribute('src', expectedSrc);
        document.head.appendChild(scriptElement);

        var elements = document.getElementsByTagName('script');
        testUtils.assertEquals(1, elements.length, "Expecting 1 script element");
        testUtils.assertEquals(expectedSrc, elements[0].src,
                "getElementsByTagName failed to return expected script elements");
    },

    testCreateEvent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var event = document.createEvent("MouseEvents");
        testUtils.assertStartsWith("SecureDOMEvent", event.toString(), "Unexpected object type from document.createEvent");
    },

    testDefaultView: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var actual = document.defaultView;
        testUtils.assertTrue(actual === window,
            "defaultView should return the SecureWindow: " + actual);
    },

    testDocumentElementHasNonZeroPropertyValues: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var documentElement = document.documentElement;
        testUtils.assertStartsWith("SecureElement", documentElement.toString(), "Unexpected object type from document.documentElement");
        testUtils.assertTrue(documentElement.clientHeight > 0, "Expected non-zero value for documentElement.clientHeight");
    },

    testDocumentConstructorPassesInstanceOf: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertTrue(document instanceof document.constructor, "document instanceof document.constructor should be true");
    },

    testBlockedApis: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var blacklist = ["write", "writeln"];

        blacklist.forEach(function(item){
            testUtils.assertUndefined(document[item], "Access to document." + item +" should be blocked!");
        });
    },

    /**
     * Attempts to use location.assign() to execute a block of Javascript using the javascript: scheme.
     * This attempt should raise an exception from within lockerservice SecureLocation.js
     */
    testJavascriptPseudoScheme: function(component, event, helper) {
        var testUtils = component.get('v.testUtils');
        var errorMessage = '';

        // attempt an invalid window.location.assign() call - it SHOULD be sanitized
        try {
          document.location.assign('javascript:console.log(new XMLHttpRequest())');
        } catch (error) {
          errorMessage = error.message;
        }

        testUtils.assertEquals(errorMessage, 'SecureLocation.assign only supports http://, https:// schemes.', 'a javascript: pseudo scheme was not correctly sanitized');
    },

    /**
     * Attempts to use location.assign() to modify the current URL.
     * This should be permitted and whitelisted by locker since the URL is valid.
     */
    testLocationAssign: function(component, event, helper) {
        var testUtils = component.get('v.testUtils');
        document.location.assign('#success');
        testUtils.assertEquals('#success', document.location.hash, 'Failed to assign a new hash using location.assign()');
    },

    testCreateHTMLStyleTag: function(cmp) {
       var testUtils = cmp.get("v.testUtils");
       testUtils.expectAuraWarning('Creation of style tags is not allowed! Created style-disabled tag instead.');
           
       var el = document.createElement("style");
       testUtils.assertTrue(el instanceof HTMLElement, "Expected element to be an HTMLElement instance.");
       testUtils.assertFalse(el instanceof HTMLStyleElement, "Expected element to NOT be an HTMLStyleElement instance.");
    },

    testCreateSVGStyleTag: function(cmp) {
       var testUtils = cmp.get("v.testUtils");
       testUtils.expectAuraWarning('Creation of style tags is not allowed! Created style-disabled tag instead.');
           
       var el = document.createElementNS("http://www.w3.org/2000/svg", "style");
       testUtils.assertTrue(el instanceof SVGElement, "Expected element to be an SVGElement instance.");
       testUtils.assertFalse(el instanceof SVGStyleElement, "Expected element to NOT be an SVGStyleElement instance.");
    }
})
