({
/*
 * These helper methods are in the renderer due to the many ways
 * that abstractList can be implemented.  Since controller methods
 * can be overridden, and component creation can be dynamic, putting
 * the relevant helper method call in the renderer ensures that the
 * emptyListContent is handled no matter how the list is implemented.
 */
	afterRender : function(component, helper){
		helper.updateEmptyListContent(component);
	},
	rerender : function(component, helper){
		this.superRerender();
		var items = component.getValue('v.items');
		if (items.isDirty()) {
			helper.updateEmptyListContent(component);
		}
	}
})
