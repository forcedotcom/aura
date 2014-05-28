({
    init: function (cmp, event, helper) {
        // Date picker component is dependent on server side model.
        // Instead set the required model to use the predefined month labels in ui:datePickerHelper.js.
        var datePicker = cmp.find("datePicker");
        datePicker.set("m.monthLabels", datePicker.getDef().getHelper().MonthLabels);
    }
})