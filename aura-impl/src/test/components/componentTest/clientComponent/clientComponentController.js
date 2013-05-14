({
    showOutputCmp: function(cmp) {

        $A.componentService.newAsyncComponent({
            componentDef: {
                descriptor: "ui:outputNumber"
            },
            attributes: {
                value: 6
            }
        }, null, null, null,
        function(newCmp) {
            cmp.getValue("v.outputValue").setValue(newCmp.getValue("v.value").value);
        });
    },

    addOutputCurrency: function(cmp) {
        $A.componentService.newAsyncComponent({
            componentDef: {
                descriptor: "ui:outputCurrency"
            },
            attributes: {
                value: 3,
                currencyCode: "GBP"
            }
        }, null, null, null,
        function(newCmp) {
            cmp.getValue("v.body").push(newCmp);
        });
    }
});