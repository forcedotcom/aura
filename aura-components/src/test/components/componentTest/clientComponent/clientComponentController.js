({
    showOutputCmp: function(cmp) {
        $A.createComponent(
            "ui:outputNumber",
            {
                value : "6"
            },
            function(newCmp) {
                cmp.set("v.outputValue", newCmp.get("v.value"));
            }
        );
    },

    addOutputCurrency: function(cmp) {
        $A.createComponent(
            "ui:outputCurrency",
            {
                value: 3,
                currencyCode: "GBP"
            },
            function(newCmp) {
            	var body = cmp.get("v.body");
            	body.push(newCmp);
            	cmp.set("v.body", body);
            }
        );
    }
});
