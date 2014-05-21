({
	init: function (component, event, helper) {
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    },
})