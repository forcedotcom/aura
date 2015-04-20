({
	init: function (cmp, event, helper) {
		console.log('init:eventBubblingCmp');
	},
	handlerEmitter: function (cmp, event, helper) {
		console.log('testEventBubbling:handleEmitter -> receivedEvent: ', event);
	},
	handlerDataChange: function (cmp, event, helper) {
		console.log('ui:dataChanged Event received on testEventBubblingParent.cmp');
	},
	updateSize: function (cmp, event, helper) {
		console.log('handlerTestEvemtBubling | APP:event -> updateSize()');
	},
})