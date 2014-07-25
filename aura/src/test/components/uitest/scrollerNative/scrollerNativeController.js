({
	init: function (component, event, helper) {
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    },

    scrollMoveHandler: function(component, event, helper){
    	var span = document.getElementById('scrollMoveHandlerCalled');
    	
    	if(span.textContent.trim() === "0"){
    		span.textContent = "1";
    	}
    },
    
})