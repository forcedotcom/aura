({
    testIsGlobal: {
        test: function(cmp) {
            var text = $A.test.getText(cmp.getElement());
            $A.test.assertTrue(text.indexOf("PASS") === 0, text)
        }
    }
})