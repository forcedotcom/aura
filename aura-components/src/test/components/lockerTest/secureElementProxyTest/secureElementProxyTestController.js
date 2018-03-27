({
    testGetPrototypeOfReturnsDivProto: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("title");
        var divProto = Object.getPrototypeOf(div);

        testUtils.assertTrue(divProto === HTMLDivElement.prototype);
    },

    testSetPrototypeOfBaseElementThrowsError: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("title");

        try {
            // note that with the SecureElement Proxy we need to go down an extra prototype level to get to
            // HTMLDivElement. The first getPrototypeOf returns our first Proxy layer.
            Object.setPrototypeOf(div, {});
            testUtils.fail("Expected error trying to set new prototype for SecureElement");
        } catch (e) {
            testUtils.assertStartsWith("Illegal attempt to set the prototype of", e.message, "Unexpected error trying to set new prototype");
        }
    },

    testInstanceOf: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("title");

        testUtils.assertTrue(div instanceof HTMLElement);
        testUtils.assertTrue(div instanceof HTMLDivElement);
    },

    testSetGetExpandos: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("title");
        div.foo = "expando!";
        testUtils.assertEquals("expando!", div.foo);
        div.foo = "another one!";
        testUtils.assertEquals("another one!", div.foo);
        div = document.getElementById("title");
        testUtils.assertEquals("another one!", div.foo);
    },

    testSetUnsupportedProperty: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("title");

        // 'get' on unsupported property works but 'set' throws an error
        testUtils.assertUndefined(div.align);
        testUtils.expectAuraWarning('SecureElement does not allow access to align');
        div.align = "foo";
        testUtils.assertUndefined(div.align);
    },

    testInOperation: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("title");
        // simple 'in' usage for properties that exist or do not
        testUtils.assertTrue("textContent" in div);
        testUtils.assertFalse("foobar" in div);

        // now try on expandos
        div.foo = "expando!";
        testUtils.assertTrue("foo" in div, "Expando property not found on Element via 'in' operator");
        delete div.foo;
        testUtils.assertFalse("foo" in div, "Expando property should not be on Element after delete operation");
    },

    testObjectKeys: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("title");

        testUtils.assertEquals(0, Object.keys(div).length, "Initial div element should return empty array for Object.keys()");
        div.expando = "foo";
        div.anotherOne = "bar";
        var keys = Object.keys(div);
        testUtils.assertEquals(2, keys.length, "Object.keys() should report expando on div");
        testUtils.assertEquals("expando", keys[0]);
        testUtils.assertEquals("anotherOne", keys[1]);
    },

    testGetOwnPropertyNames: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("title");

        testUtils.assertEquals(0, Object.getOwnPropertyNames(div).length, "Initial div element should return empty array for Object.keys()");
        div.expando = "foo";
        div.anotherOne = "bar";
        var keys = Object.getOwnPropertyNames(div);
        testUtils.assertEquals(2, keys.length, "Object.keys() should report expando on div");
        testUtils.assertEquals("expando", keys[0]);
        testUtils.assertEquals("anotherOne", keys[1]);
    },

    testDelete: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("title");
        testUtils.assertTrue(delete div.id);
        testUtils.assertTrue(delete div.asdf);
        Object.defineProperty(div, 'expando', {
            configurable: false
        });
        try {
            delete div.expando;
            testUtils.fail("Expected error trying to delete non-configurable property");
        } catch (e) {
            if ($A.get("$Browser.isFIREFOX")) {
                testUtils.assertEquals("property \"expando\" is non-configurable and can't be deleted", e.message);
            } else {
                testUtils.assertEquals("Cannot delete property 'expando' of [object Object]", e.message);
            }
        }
    },

    testAddOptionsToSelect: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var selectContainer = document.getElementById("selectContainer");
        selectContainer[0] = new Option(1, 1);
        selectContainer[1] = new Option(2, 2);
        selectContainer[2] = new Option(3, 3);
        var selectOptions = selectContainer.options;
        testUtils.assertTrue(selectOptions instanceof HTMLOptionsCollection);
        testUtils.assertEquals(3, selectOptions.length);
        testUtils.assertEquals('<option value="1">1</option>', selectOptions[0].outerHTML);
        testUtils.assertEquals('<option value="2">2</option>', selectOptions.item(1).outerHTML);
    },

    testDefineCheckedProperty: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        var node = document.createElement("input");
        node.type = 'checkbox';

        var getValue = helper.trackValueOnNode(node, 'checked');

        node.checked = true;
        testUtils.assertEquals("true", getValue(), "Custom node 'checked' attribute setter not called");
        testUtils.assertEquals(true, node.checked, "Custom node 'checked' attribute getter returned wrong value");
        node.checked = false;
        testUtils.assertEquals("false", getValue(), "Custom node 'checked' attribute setter not called");
        testUtils.assertEquals(false, node.checked, "Custom node 'checked' attribute getter returned wrong value");

        return node;
    },

    testDefineValueProperty: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        var node = document.createElement("input");

        var getValue = helper.trackValueOnNode(node, 'value');

        node.value = "black";
        testUtils.assertEquals("black", getValue(), "Custom node 'value' attribute setter not called");
        testUtils.assertEquals("black", node.value, "Custom node 'value' attribute getter returned wrong value");
        node.value = "white";
        testUtils.assertEquals("white", getValue(), "Custom node 'value' attribute setter not called");
        testUtils.assertEquals("white", node.value, "Custom node 'value' attribute getter returned wrong value");

        return node;
    },

    /**
     * Automation for W-4701252
     * @param cmp
     */
    testValuePropertyOnNonInputElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var aTag = document.getElementById("anchorWithValue");
        testUtils.assertNull(aTag.getAttribute("value"), "Accessing invalid attribute values should continue to return null");
    }
})
