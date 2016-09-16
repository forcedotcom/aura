({
    onpress : function(component, event, helper) {
        var fooEvent = component.getEvent('foo');

        alert("{ component: " + component + ", event: " + event + ", document: " + document + ", window: " + window + ", fooEvent: " + fooEvent + " }");
	}
})
