({
	makeDOM : function(resultSet, cssClassName){
		var dom = [],
			divItem;
		
		if(resultSet == null){
			dom = [];
		}
		for(var i in resultSet){
			divItem = document.createElement('div');
			divItem.textContent = resultSet[i].label;
			divItem.id = resultSet[i].value + cssClassName;
			divItem.className = "item " + cssClassName;
	    	dom.push(divItem);
		}
		return dom;
    }
    
})