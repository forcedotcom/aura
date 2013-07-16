({
    relay : function(cmp, evt, helper){
    	var clickEvent = evt.getParam("domEvent");
    	helper.preEventFiring(cmp, clickEvent);
		helper.fireEvent(cmp, clickEvent, helper);
    }
})