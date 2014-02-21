({
	init: function(cmp) {
		var examples = cmp.getValue("m.examples").unwrap();
		var body = cmp.getValue("v.body");

		console.log("!!!!!!!!!!!");
		for(var i=0, len=examples.length; i<len; i++) {
			$A.componentService.newComponent(examples[i]);
		}
		console.log("!!!!!!!!!!!");
		
		
		var exampleDescriptors = cmp.getValue("m.exampleDescriptors").unwrap();
		
		for(var i=0, len=exampleDescriptors.length; i<len; i++) {
			body.push($A.componentService.newComponent(exampleDescriptors[i]));
		}		
	}
})