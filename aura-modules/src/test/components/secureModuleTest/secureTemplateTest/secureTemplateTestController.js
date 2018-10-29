({
    secureTemplateTester: function(cmp, event) {
        var testModule = cmp.find("secureTemplateComponentParent");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
