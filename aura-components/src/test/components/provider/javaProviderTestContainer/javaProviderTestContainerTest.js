({
    testJavaProviderProvidesConcreteComponent: {
        test: function(cmp) {
            var body = cmp.getSuper().get("v.body");
            var expected = "markup://provider:javaProviderImpl";
            var actual = body[0].getDef().getDescriptor().getQualifiedName();

            $A.test.assertEquals(expected, actual);
        }
    },

    testExtendsAbstractCmpWithJavaProvider: {
        test: function(cmp) {
            var body = cmp.getSuper().get("v.body");
            var expected = "markup://provider:javaProviderExtends";
            var actual = body[2].getDef().getDescriptor().getQualifiedName();

            $A.test.assertEquals(expected, actual);
        }
    },

    testAbstractCmpAttributeValueOnSubCmp: {
        test: function(cmp) {
            var subCmp = cmp.getSuper().get("v.body")[2];
            var subCmpDescriptor = subCmp.getDef().getDescriptor().getQualifiedName();
            $A.test.assertEquals("markup://provider:javaProviderExtends", subCmpDescriptor,
                    "Didn't get expected component.");

            var actual = subCmp.get("v.stringAttribute");
            $A.test.assertEquals("default value from javaProviderAbstract", actual);
        }
    },

    testAbstractCmpAttributeValueOnImplCmp: {
        test: function(cmp) {
            var implCmp = cmp.getSuper().get("v.body")[1];
            var subCmpDescriptor = implCmp.getDef().getDescriptor().getQualifiedName();
            $A.test.assertEquals("markup://provider:javaProviderImpl", subCmpDescriptor,
                    "Didn't get expected component.");

            var actual = implCmp.get("v.stringAttribute");
            $A.test.assertEquals("default value from javaProviderAbstract", actual);
        }
    },

    testOverrideAbstractCmpAttributeValueOnImplCmp: {
        test: function(cmp) {
            var implCmp = cmp.getSuper().get("v.body")[1];
            var subCmpDescriptor = implCmp.getDef().getDescriptor().getQualifiedName();
            $A.test.assertEquals("markup://provider:javaProviderImpl", subCmpDescriptor,
                    "Didn't get expected component.");

            var actual = implCmp.get("v.overriddenAttribute");
            $A.test.assertEquals("value from javaProviderImpl", actual);
        }
    },

    testOverrideAbstractCmpAttributeValueOnSubCmp: {
        test: function(cmp) {
            var subCmp = cmp.getSuper().get("v.body")[2];
            var subCmpDescriptor = subCmp.getDef().getDescriptor().getQualifiedName();
            $A.test.assertEquals("markup://provider:javaProviderExtends", subCmpDescriptor,
                    "Didn't get expected component.");

            var actual = subCmp.get("v.overriddenAttribute");
            $A.test.assertEquals("value from javaProviderImpl", actual);
        }
    }
})
