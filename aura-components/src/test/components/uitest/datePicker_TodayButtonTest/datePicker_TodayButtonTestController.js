({
    handleSelectedDate: function(cmp, evt, helper) {
        var value = evt.getParam("value");
        var hours = evt.getParam("hours");
        var minutes = evt.getParam("minutes");

        cmp.set('v.selectedDate', {
            value : value,
            hours : hours,
            minutes : minutes
        })
    }
})
