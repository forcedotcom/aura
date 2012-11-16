({
	increment : function(c,e,h){
		var i = c.getValue("v.intAttribute");
		var prev = i.unwrap();
		i.setValue(prev ? prev+1 : 1);
	}
})