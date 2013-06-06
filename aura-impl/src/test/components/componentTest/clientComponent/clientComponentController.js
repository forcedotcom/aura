({
    showOutputCmp: function(cmp) {
        $A.componentService.newComponentAsync(
            this,
            function(newCmp) {
                cmp.getValue("v.outputValue").setValue(newCmp.getValue("v.value").value);
            },
            {
                componentDef: {
                    descriptor: "ui:outputNumber"
                },
                attributes: {
                    values: {
                        value: 6
                    }
                }
            },
            null, null, null
        );
    },

    addOutputCurrency: function(cmp) {
        $A.componentService.newComponentAsync(
            this,
            function(newCmp) {
                cmp.getValue("v.body").push(newCmp);
            },
            {
                componentDef: {
                    descriptor: "ui:outputCurrency"
                },
                attributes: {
                    values: {
                        value: 3,
                        currencyCode: "GBP"
                    }
                }
            },
            null, null, null
        );
    }
});
