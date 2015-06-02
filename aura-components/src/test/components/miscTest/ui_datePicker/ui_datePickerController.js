({
    init: function (cmp, event, helper) {
        // Date picker component is dependent on server side model.
        // When instantiated client side, set the required model to use the predefined month labels in ui:datePickerHelper.js.
        var datePicker = cmp.find("datePicker");
        if(datePicker && !datePicker.get("m.monthLabels")) {
            datePicker.set("m.monthLabels", datePicker.getDef().getHelper().MonthLabels);
        }
    }
})