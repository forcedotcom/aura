({
    handleChange: function(cmp, event) {
        var result = {
            "oldValue": event.getParam("oldValue"),
            "newValue": event.getParam("value")
        };

        cmp.set("v.result", result);
    }

})
