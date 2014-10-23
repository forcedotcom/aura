({
	doInit : function(cmp){
		if(cmp.get("v.caseToRender") == "testMultiULToOne"){
			var inputText = cmp.find("inputTextId");
    	    var inputError1 = cmp.find("error1").get("v.domId");
    	    var inputError2 = cmp.find("error2").get("v.domId");
    	    
    	    inputText.set("v.ariaDescribedBy", inputError1+" "+inputError2);
		}    
	}
})