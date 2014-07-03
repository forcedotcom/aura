({
	//Helper function that will go to the component, and either validate it or invalidate it
	addErrorsToCmp : function(invalidCmp){		    	
    	 var ariaDesc = document.getElementById(invalidCmp.get("v.ariaDescribedby"))
    	 var value = "v.value";//invalidCmp.getValue("v.value");
    	 
    	 if($A.util.isEmpty(ariaDesc)){
    		 invalidCmp.setValid(value, false);
        	 invalidCmp.addErrors(value, {"message":"The wren"});
        	 invalidCmp.addErrors(value, {"message":"Earns his living"});
        	 invalidCmp.addErrors(value, {"message":"Noiselessly"});
    	 }
    	 else{
    		 invalidCmp.setValid(value, true);
    	 }
	}
})