({
    /**
     * Verify throwing error that contains clear message when component class is not found,
     * e.g. when dynamically create a component that is not referenced in markup and is not
     * delcared in aura:dependency.
     *
     * Seems this case only happens on newComponentDeprecated which is a deprecated function,
     * updating or removing this test if we remove newComponentDeprecated.
     */
    _testThrowsComponentClassNotFoundError: {
        test: function() {
            // a component is not defined in markup or aura:dependency
            var cmpDescr="ui:message";
            $A.test.expectAuraError("Component class not found: markup://" + cmpDescr);
            // newCmp calls newComponentDeprecated
            $A.newCmp({componentDef:cmpDescr}, null, true, true);
        }
    }

})
