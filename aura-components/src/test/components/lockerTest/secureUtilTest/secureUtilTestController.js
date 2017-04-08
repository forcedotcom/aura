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
    }
})
