({
	//Helper function that will go to the component, and either validate it or invalidate it
	addErrorsToCmp : function(invalidCmp){		    	
    	 var ariaDesc = document.getElementById(invalidCmp.get("v.ariaDescribedBy"))
    	 var value = "v.value";
    	 
    	 if($A.util.isEmpty(ariaDesc)){
    		 invalidCmp.setValid(value, false);
        	 invalidCmp.addErrors(value, {"message":"The wren"});
        	 invalidCmp.addErrors(value, {"message":"Earns his living"});
        	 invalidCmp.addErrors(value, {"message":"Noiselessly"});
    	 }
    	 else{
    		 invalidCmp.setValid(value, true);
    	 }
	},
	
	//Extracting out the ability to create this new inputDefaultError
	createNewCmp : function(cmp, lblAide){
		 $A.componentService.newComponentAsync(
	                this,
	                function(newcmp){
	                    var propsArea=cmp.find("propsArea");
                        var body=propsArea.get("v.body");
                        body.push(newcmp);
                        propsArea.set("v.body",body);
	                },
	                {
	                    "componentDef": "markup://uitest:inputDefaultErrorDynamic_test",
	                    "attributes": {
	                        "values": {
	                            label: "Label"+lblAide,
	                            value : "123",
	                            name: "Label"+lblAide,
	                            newClass : "class"+lblAide
	                        }
	                    }
	                }
	        );
	}
})