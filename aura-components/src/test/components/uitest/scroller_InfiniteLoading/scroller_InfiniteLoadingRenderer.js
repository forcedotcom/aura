({
	render: function(cmp, helper) {
		var dom = this.superRender();
        var div = cmp.find("body").getElement();
        var items = cmp._virtualItems;
        helper.renderItemsToDom(div, items);
		return dom;
	},
	
	afterRender: function(cmp, helper) {
		var dom = this.superAfterRender();
        if (!cmp.get("v.initBeforeRender")) {
            var listSize = cmp.get("v.initialSize");
            helper.generateListItems(0, listSize,
                function(item) {
                    cmp._virtualItems.push(item);
                },
                function() {
                    var div = cmp.find("body").getElement();
                    var items = cmp._virtualItems;
                    helper.renderItemsToDom(div, items);
                }
            );
        }
        return dom;
	},
	
	rerender: function(cmp, helper) {
        var dom = this.superRerender();
        var div = cmp.find("body").getElement();
        var items = cmp._virtualItems;
        helper.renderItemsToDom(div, items);
		return dom;
	}
})
