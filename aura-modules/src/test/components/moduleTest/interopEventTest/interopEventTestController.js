({
    callMethodWithThrow : function (cmp, event) {
        var method = cmp.get('v.method');
        try {
            event[method]('arg1', 'arg2', 'arg3');
        } catch (ex) {
            cmp.set('v.methodCallError', ex.message);
        }
    },
    handleRemoveCustomEvent : function (cmp, event) {
        cmp.set('v.ids', event.getParam('ids'));
        cmp.set('v.evtName', event.getName());
    },
    handleRemoveCallback: function (cmp, event) {
        cmp.set('v.ids', event.getParam('domEvent'));
    },
    handleClickWithCallback: function (cmp, event) {
        cmp.set('v.ids', event.getParam('domEvent'));
    },
    // ... preventDefault and stopPropagation
    handleBubbledRemove: function (cmp, evt) {
        cmp.find('evt-propagated').getElement().innerText = 'true';
    },
    handleRemove : function (cmp, event) {
        event.preventDefault();
        event.stopPropagation();
    },
    handleEventWithDetails : function (cmp, event) {
        cmp.set('v.value', event.getParam('v'));
    },
	handleEventWithDetailsAsProxy: function (cmp, event) {
		cmp.set('v.value', event.getParams());
	},
})
