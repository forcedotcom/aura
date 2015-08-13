({
    onKeydown: function(component, event, helper) {
        var params = event.getParams();
        if (params.keyCode === 13) { // enter
            var value = component.getElement().value;
            if ( !$A.util.isEmpty(value) ) {
                var onItemSelected = component.getEvent("onItemSelected");
                var onItemSelectedPrams = {
                    label: component.getElement().value,
                    id: null
                };
                component.getElement().value = '';
                onItemSelected.setParams({ value : onItemSelectedPrams }).fire();
            }
        } else if (params.keyCode === 8) { // Backspace key
            var value = component.getElement().value;
            var domEvent = event.getParam("domEvent");
            if ( $A.util.isEmpty(value) ) {
                var onBackspacePressedWhenEmpty = component.getEvent("onBackspacePressedWhenEmpty");
                onBackspacePressedWhenEmpty.fire();
            }
        }
    },

    focus: function(component, event, helper) {
        component.getElement().focus();
    }
})