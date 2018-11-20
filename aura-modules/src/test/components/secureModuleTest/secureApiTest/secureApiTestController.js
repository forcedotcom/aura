({
    testApiPropertiesAccessedViaModule: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var data = { win: window, el: document.createElement('div') };
        var testModule = cmp.find("secureDecoratorComponentParent").getElement();

        testUtils.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', testModule.apiProperty.win.toString(), 'Expected "apiProperty.win" to be lockerized!');
        testUtils.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', testModule.apiProperty.el.toString(), 'Expected "apiProperty.el" to be lockerized!');
        
        testModule.apiProperty = data;

        testUtils.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', testModule.apiProperty.win.toString(), 'Expected "apiProperty.win" to be lockerized!');
        testUtils.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', testModule.apiProperty.el.toString(), 'Expected "apiProperty.el" to be lockerized!');
    },

    testApiMethodsAccessedViaModule: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var data = { win: window, el: document.createElement('div') };
        var testModule = cmp.find("secureDecoratorComponentParent").getElement();

        var apiMethodReturnValue = testModule.apiMethod(data);

        testUtils.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', apiMethodReturnValue.win.toString(), 'Expected "apiMethod.win" to be lockerized!');
        testUtils.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', apiMethodReturnValue.el.toString(), 'Expected "apiMethod.el" to be lockerized!');
    }
})
  