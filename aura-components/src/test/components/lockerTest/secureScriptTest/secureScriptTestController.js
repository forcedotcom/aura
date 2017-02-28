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

        script.setAttribute("data-foo", "");
        testUtils.assertEquals("", script.getAttribute("data-foo"), "Unexpected attribute value, should be null");

        script.removeAttribute("data-foo");
        testUtils.assertEquals(null, script.getAttribute("data-foo"), "Unexpected attribute value, should be undefined");
    },

    testGetSetDataset: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        // Create the script.
        var script = document.createElement("script");

        // Empty test.
        testUtils.assertEquals("DOMStringMap", typeof(script.dataset), "Empty dataset has unexpected type.");
        testUtils.assertEquals(0, Object.keys(test.dataset).length, "Empty dataset has unexpected length.");

        // Set the foo using the dataset.
        script.dataset.foo = "bar";

        // Check if we have a DOMStringMap with 1 property that is "foo" with the value bar;
        testUtils.assertEquals("DOMStringMap", typeof(script.dataset), "Dataset has unexpected type.");
        testUtils.assertEquals(1, Object.keys(test.dataset).length, "Dataset has unexpected length.");
        testUtils.assertEquals("bar", script.dataset.foo , "Unexpected dataset value, should be bar.");

        // Check if the get attribute  works.
        testUtils.assertEquals("bar", script.getAttribute("data-foo"), "Unexpected attribute value, should be bar.");

        // Check if we can set the dataset using the set attribute.
        script.setAttribute("data-foo", "bar2");

        testUtils.assertEquals(1, Object.keys(test.dataset).length, "Dataset has unexpected length, should be 1.");
        testUtils.assertEquals(null, script.dataset.foo , "Unexpected dataset value, should be bar2.");

        var script = document.createElement("script");
        // Make sure 2 attribute works.
        script.dataset.foo = "bar";
        script.dataset.bar = "foo";
        testUtils.assertEquals(2, Object.keys(test.dataset).length, "Dataset has unexpected length, should be 2.");
        testUtils.assertEquals("bar", script.getAttribute("data-foo"), "Unexpected attribute value for foo, should be bar.");
        testUtils.assertEquals("foo", script.getAttribute("data-bar"), "Unexpected attribute value for bar, should be foo.");
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

    testScriptsFromUnsafeSourceBlocked: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var scriptSrcsToBlock = ['http://badjs.com/fooBar.js', '//badjs.com/fooBar.js'];
        scriptSrcsToBlock.forEach(function(scriptSrcToBlock){
            try {
                var scriptTag = document.createElement("script");
                scriptTag.src = scriptSrcToBlock;
                cmp.getElement().appendChild(scriptTag);
                testUtils.fail("Should have blocked loading script from unsafe sources");
            } catch(e) {
                testUtils.assertStartsWith("SecureScriptElement: External script loading blocked, CSP restrictions:", e.message);
            }
        });
    }
})
