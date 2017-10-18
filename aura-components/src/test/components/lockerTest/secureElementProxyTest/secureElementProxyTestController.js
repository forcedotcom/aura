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
        testUtils.assertUndefined(div.shadowRoot);
        try {
            div.shadowRoot = "foo";
            testUtils.fail("Expected error trying to set unsupported property");
        } catch (e) {
            testUtils.assertEquals("SecureElement does not allow access to shadowRoot", e.message, "Unexpected error" +
                    " message setting unsupported property");
        }
    },

    testInOperation: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("title");

        // simple 'in' usage for properties that exist or do not
        testUtils.assertTrue("textContent" in div);
        testUtils.assertFalse("foobar" in div);
        testUtils.assertTrue("shadowRoot" in div); // part of the HTMLDivElement prototype but blocked by Locker

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
            testUtils.assertEquals("'deleteProperty' on proxy: trap returned falsish for property 'expando'", e.message);
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
    }
})
