({
    showOutputCmp: function(cmp) {
        $A.componentService.newComponentAsync(
            this,
            function(newCmp) {
                cmp.set("v.outputValue", newCmp.get("v.value"));
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
            	var body = cmp.get("v.body");
            	body.push(newCmp);
            	cmp.set("v.body", body);
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
