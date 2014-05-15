({
    testDomEventAttributeOnPressEvent: {
        test: function(cmp) {
            var btn = cmp.find("domEventBtn").getElement();
            $A.test.clickOrTouch(btn);
            $A.test.assertTrue(cmp.get("v.isDomEventSet"));
        }
    }
})
