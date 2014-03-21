({
	makeDOM : function(resultSet, cssClassName){
		var dom = [],
			divItem;
		
		if(resultSet == null){
			dom = [];//fails if dom=[] gives gack on the UI
		}
		for(var i in resultSet){
			divItem = document.createElement('div');
			divItem.textContent = resultSet[i].label;
			divItem.id = resultSet[i].value;
			divItem.className = "item " + cssClassName;
	    	dom.push(divItem);
		}
		return dom;
    },
    
    
})