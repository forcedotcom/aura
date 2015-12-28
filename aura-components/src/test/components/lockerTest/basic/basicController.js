({
    onpress : function(component, event, helper) {
        var fooEvent = component.getEvent('foo');
        alert("{ component: " + component + ", event: " + event + ", document: " + document + ", window: " + window + ", fooEvent: " + fooEvent + " }");
        // fooEvent.getSource(); is now secure!
        // fooEvent.fire(); can now be fired
        // component.find('button').getEvent('press'); is also secure!
        // just like this one can be fired as well.
        // DCHASMAN TODO Add in test code that tries to access body - make sure that components are wrapped in SecureComponent etc
        var body = component.get("v.body");
	}
})
