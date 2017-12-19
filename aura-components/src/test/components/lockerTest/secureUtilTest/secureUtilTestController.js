({
    addClass: function(cmp, event) {
        var cmpTarget = cmp.find('changeIt');
        $A.util.addClass(cmpTarget, 'changeMe');
    },
    removeClass: function(cmp, event) {
        var cmpTarget = cmp.find('changeIt');
        $A.util.removeClass(cmpTarget, 'changeMe');
    },
    hasClass: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");
        // Set by test
        var hasClass = cmp.get("v.hasClassSet");
        var cmpTarget = cmp.find('changeIt');
        testUtils.assertEquals(hasClass, $A.util.hasClass(cmpTarget, 'changeMe'), hasClass?"Expected component to have class":"Expected component to not have class");
    },
    toggleClass: function(cmp, event) {
        var cmpTarget = cmp.find('changeIt');
        $A.util.toggleClass(cmpTarget, 'changeMe');
    },

    addClass_Element: function(cmp, event) {
        var cmpTarget = cmp.find('changeIt');
        $A.util.addClass(cmpTarget.getElement(), 'changeElement');
    },
    removeClass_Element: function(cmp, event) {
        var cmpTarget = cmp.find('changeIt');
        $A.util.removeClass(cmpTarget.getElement(), 'changeElement');
    },
    hasClass_Element: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");
        // Set by test
        var hasClass = cmp.get("v.hasClassSet");
        var cmpTarget = cmp.find('changeIt');
        testUtils.assertEquals(hasClass, $A.util.hasClass(cmpTarget.getElement(), 'changeElement'), hasClass?"Expected element to have class":"Expected element to not have class");
    },
    toggleClass_Element: function(cmp, event) {
        var cmpTarget = cmp.find('changeIt');
        $A.util.toggleClass(cmpTarget.getElement(), 'changeElement');
    },

    // Cross namespace test case: Try to add css class to a component from another namespace
    testAddClassToSecureComponentRef: function(cmp) {
        var lockedCmp = cmp.find("uiButton");
        $A.util.addClass(lockedCmp, 'changeMe');
    },

    testIsEmpty_negativeCases: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        cmp.set("v.objAttr", {foo: "bar"});
        cmp.set("v.arrAttr", ["bar"]);
        cmp.set("v.strAttr", "bar");
        var testData = [
            // Primitives
            {key: "value"},
            ['item'],
            'literal',
            // Dom elements
            cmp.find("changeIt").getElement(), // Dom element
            document.getElementsByTagName("div"), // HTMLCollection
            document.getElementsByTagName("media"), // Empty HTMLCollection, $A.util.isEmpty() is meant for native objects and arrays
            // Proxy wrapped values
            cmp.get("v.objAttr"),
            cmp.get("v.arrAttr"),
            // Unwrapped value
            cmp.get("v.strAttr"),
            // facet
            cmp.find("outerDiv").get("v.body")
        ]
        testData.forEach(function(item){
            testUtils.assertFalse($A.util.isEmpty(item), "Expected $A.util.isEmpty() to return false: " + item);
        })
    },

    testIsEmpty_positiveCases: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        cmp.set("v.objAttr", {});
        cmp.set("v.arrAttr", []);
        cmp.set("v.strAttr", "");
        var testData = [
            // Primitives
            undefined,
            null,
            {},
            [],
            '',
            // Proxy wrapped values
            cmp.get("v.objAttr"),
            cmp.get("v.arrAttr"),
            // Unwrapped value
            cmp.get("v.strAttr"),
            // Empty facet
            cmp.find("innerDiv").get("v.body")
        ]
        testData.forEach(function(item){
            testUtils.assertTrue($A.util.isEmpty(item), "Expected $A.util.isEmpty() to return true: " + item);
        })
    }
})
