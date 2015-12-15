({
    onpress : function(component, event, helper) {
        alert("{ component: " + component + ", event: " + event + ", document: " + document + ", window: " + window + " }");

        // DCHASMAN TODO Add in test code that tries to access body - make sure that components are wrapped in SecureComponent etc
        var body = component.get("v.body");
	}
})