({
    renderItemsToDom: function(div, items) {
		var fragment = document.createDocumentFragment();
		for (var i = 0; i < items.length; i++) {
			fragment.appendChild(items[i]);
		}
		div.appendChild(fragment);
    },

	generateListItems: function(startIndex, numItems, itemCallback, doneCallback) {
		for (var i = startIndex; i < numItems; i++) {
			itemCallback(this.generateListItem(i), i);
        }
        if (doneCallback) {
            doneCallback();
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
