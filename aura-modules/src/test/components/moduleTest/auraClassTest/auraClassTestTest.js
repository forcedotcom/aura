({
    selector: {
        moduleCmpWithAuraClass: 'moduletest-button.moduleTestAuraClassTest'
    },

    testAuraClassIsSetOnModuleComponent: {
        test: [
            function(cmp) {
                $A.test.assertNotNull(
                    document.querySelector(this.selector.moduleCmpWithAuraClass),
                    "Aura class not applied to module component, cannot find element '" + this.selector.moduleCmpWithAuraClass + "'"
                );
            }
        ]
    }
})
