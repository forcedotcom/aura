({
    testGetComponentClassName: {
        test: function(cmp) {
            var expected = "componentTest:componentApi";
            var actual = cmp.getType();
            $A.test.assertEquals(expected, actual);
        }
    },

    testGetHelperReturnsHelperObject: {
        test: function(cmp) {
            var helper = cmp.getDef().getHelper();

            $A.test.assertNotUndefinedOrNull(helper);
            $A.test.assertTrue(cmp.helper === helper,
                    "getHelper should return same helper object in component class");
            $A.test.assertTrue($A.util.isFunction(helper.helperFunction),
                    "helperFunction should be a function in helper object.");
        }
    },

    testGetRendererReturnsRendererObject: {
        test: function(cmp) {
            var descriptor = cmp.getDef().getDescriptor().getQualifiedName();
            var cmpClass = $A.componentService.getComponentClass(descriptor);
            var rendererfromCmpClass = cmpClass.prototype.renderer;

            var renderer = cmp.getRenderer();
            $A.test.assertNotUndefinedOrNull(renderer);
            $A.test.assertTrue(rendererfromCmpClass === renderer,
                    "getRenderer shoud return same renderer object in component class");
            $A.test.assertTrue($A.util.isFunction(renderer.render),
                    "render should be a function.");
            $A.test.assertTrue($A.util.isFunction(renderer.afterRender),
                    "afterRender should be a function.");
            $A.test.assertTrue($A.util.isFunction(renderer.rerender),
                    "rerender should be a function.");
            $A.test.assertTrue($A.util.isFunction(renderer.unrender),
                    "unrender should be a function.");
        }
    }
})
