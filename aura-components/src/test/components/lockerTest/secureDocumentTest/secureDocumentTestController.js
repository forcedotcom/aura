({
    testCreateDocumentFragmentReturnsSecureElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var documentFragment = document.createDocumentFragment();
        testUtils.assertStartsWith("SecureElement", documentFragment.toString(), "Expected document.createDocumentFragment()"
                + " to return a SecureElement"); 
    },
    
    testCreateScriptElementReturnsSecureScript: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var scriptElement = document.createElement("script");
        testUtils.assertStartsWith("SecureScript", scriptElement.toString(), "Expected document.createElement(script)"
                + " to return a SecureScript");
    },
    
    testCreateIframeElementReturnsSecureIframeElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var iframeElement = document.createElement("iframe");
        testUtils.assertStartsWith("SecureIFrameElement", iframeElement.toString(), "Expected document.createElement('iframe')"
                + " to return a SecureIFrameElement");
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
        span.setAttribute("lockerAttr", "hello from the locker");
        docFragment.appendChild(span);
        var content = cmp.find("content").getElement();
        content.appendChild(docFragment);
        testUtils.assertEquals("hello from the locker",  content.childNodes[0].getAttribute("lockerAttr"), "Unexpected attribute on document"
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
    
    testSecureDocumentCookie: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var systemModeCookie = event.getParam("arguments").cookie;
        var userModeCookie = document.cookie;
        testUtils.assertEquals(systemModeCookie, userModeCookie);
    },
    
    testDocumentTitle: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        document.title = "secureDocumentTest";
        testUtils.assertEquals("secureDocumentTest", document.title);
    },
    
    testQuerySelectorAllReturnsSecureNodeList: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var result = document.querySelectorAll('*');
        //testUtils.assertTrue($A.util.isArray(result), "Expected document.querySelectorAll('*') to return an Array");
        testUtils.assertStartsWith("SecureObject", result[0].toString(), "Expected document.querySelectorAll('*') to" +
                " return SecureObject elements");
    },
    
    testDocumentBodyConstructorNotExposed: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertUndefined(document.body.constructor, "document.body.constructor should not be defined in Locker");
    },
    
    testCreateElementCoersionExploit: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var el = document.createElement({ 
            toLowerCase: function() { return 'a' }, 
            toString: function() { return 'script' } 
        }); 
        testUtils.assertStartsWith("SecureScriptElement", el.toString(), "createElement string coersion exploit should be blocked" +
                " and a SecureScriptElement should be returned, but got " + el.toString());
    }
})
