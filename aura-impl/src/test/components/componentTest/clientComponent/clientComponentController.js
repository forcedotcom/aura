({
    showOutputCmp: function(cmp) {

        $A.componentService.newComponentAsync(
	        function(newCmp) {
	            cmp.getValue("v.outputValue").setValue(newCmp.getValue("v.value").value);
	        },
	        this,
	        {
            componentDef: {
                descriptor: "ui:outputNumber"
            },
            attributes: {
                value: 6
            }
        }, null, null, null);
    },

    addOutputCurrency: function(cmp) {
        $A.componentService.newComponentAsync(
            function(newCmp) {
                cmp.getValue("v.body").push(newCmp);
            },
            this,
            {
            componentDef: {
                descriptor: "ui:outputCurrency"
            },
            attributes: {
                value: 3,
                currencyCode: "GBP"
            }
        }, null, null, null
        );
    }
});