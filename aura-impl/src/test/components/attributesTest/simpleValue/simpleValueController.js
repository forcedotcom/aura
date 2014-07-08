({
	increment : function(c,e,h){
		var prev = c.get("v.intAttribute");
		c.set("v.intAttribute", prev ? prev+1 : 1);
	}
})