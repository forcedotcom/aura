({
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-SAFARI", "-IPHONE", "-IPAD"],

    testTemplateChildNodes: {
        test: function(cmp) {
          cmp.secureShadowRootTester("testTemplateChildNodes");
        }  
    },

    testTemplateHost: {
        test: function(cmp) {
            cmp.secureShadowRootTester("testTemplateHost");
        }
    },

    testTemplateHostOtherNamespace: {
        test: function(cmp) {
            cmp.secureShadowRootTester("testTemplateHostOtherNamespace");
        }
    },

    testTemplateQuerySelector: {   
        test: function(cmp) {  
            cmp.secureShadowRootTester("testTemplateQuerySelector");   
        }  
    }, 
    
    testTemplateQuerySelectorAll: {    
        test: function(cmp) {
            cmp.secureShadowRootTester("testTemplateQuerySelectorAll");
        }  
    }, 

    // TODO: Enable After @W-5527917@
    _testShadowRoot: {
        test: function(cmp) {
            cmp.secureShadowRootTester("testShadowRoot");
        }
    },

    // TODO: Enable After @W-5527917@
    _testShadowRootOtherNamespace: {
        test: function(cmp) {
            cmp.secureShadowRootTester("testShadowRootOtherNamespace");
        }
    },

    testInternalFieldsAreNotAccessibleOnTemplate: {
        test: function(cmp) {
            cmp.secureShadowRootTester("testInternalFieldsAreNotAccessibleOnTemplate");
        }
    }
})
