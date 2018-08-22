({
    "init": function (cmp) {
        $A.createComponent("ui:label", {"label":"URI def parameters test label"}, function(newCmp) {
            cmp.set("v.body", [newCmp]);
        });
    },
    "getParameters": function() {
        return [
            ["testFunc", function() { 
                return 'something';
            }]
        ];
    }
})