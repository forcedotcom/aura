({
	getServerString : function(cmp){
		var a = cmp.get("c.getString");
		a.setParams({param : "" + new Date()});
		a.setCallback(cmp, function(action){
			cmp.set("m.secret", action.getReturnValue());
		});
                $A.enqueueAction(a);
	}
})
