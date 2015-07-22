({
	generateListItems: function(startIndex, listSize, callback) {
		for (var i = startIndex; i < listSize; i++) {
			callback(this.generateListItem(i), i);
		}
	},
	
	generateListItem: function(index) {
		var div = document.createElement('div');
		
		div.setAttribute("class", "item");
		div.setAttribute("id", 'r' + index);
		$A.util.setText(div, "Pretty row " + index);
		
		return div;
	}
})