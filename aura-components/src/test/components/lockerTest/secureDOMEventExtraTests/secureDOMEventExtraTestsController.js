({
    onClickHandler: function(component, event, helper) {
        var eventTarget = event.target;
        component.set("v.eventTarget", eventTarget.dataset && eventTarget.dataset.testmarker);
        component.set("v.handlerCalled", true);
    }
})