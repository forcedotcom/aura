({
    getDivFromMarkup: function (component, event, helper) {
        var div = component.find('findMe');
        if (div.toString().indexOf("SecureComponent:") === 0) {
            component.set("v.isSecureComponent", true);
        } else {
            component.set("v.isSecureComponent", false);
        }
    }
})