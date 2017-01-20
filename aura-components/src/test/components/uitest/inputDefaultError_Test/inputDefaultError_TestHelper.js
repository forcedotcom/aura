({
    // Helper function that will go to the component, and either validate it or invalidate it
    addErrorsToCmp : function(invalidCmp, errors) {
        if (errors) {
            invalidCmp.set("v.errors", errors);
        } else if ($A.util.isEmpty(invalidCmp.get("v.errors"))) {
            invalidCmp.set("v.errors", [ {
                "message" : "The wren"
            }, {
                "message" : "Earns his living"
            }, {
                "message" : "Noiselessly"
            } ]);
        } else {
            invalidCmp.set("v.errors", null);
        }
    },

    // Extracting out the ability to create this new inputDefaultError
    createNewCmp : function(cmp, lblAide) {
        $A.createComponent(
            "uitest:inputDefaultErrorDynamic_test",
            {
                label : "Label" + lblAide,
                value : "123",
                name : "Label" + lblAide,
                newClass : "class" + lblAide
            },
            function(newcmp) {
                var propsArea = cmp.find("propsArea");
                var body = propsArea.get("v.body");
                body.push(newcmp);
                propsArea.set("v.body", body);
            }
        );
    }
})