{
	getServerString : function(cmp){
		var a = cmp.get("c.getString");
		a.setParams({param : "" + new Date()});
		a.setCallback(cmp, function(action){
			cmp.getValue("m.secret").setValue(action.getReturnValue());
		});
                $A.enqueueAction(a);
	}
}
