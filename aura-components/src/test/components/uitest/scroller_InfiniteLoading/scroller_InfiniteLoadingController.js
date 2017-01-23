({
	init: function(cmp, evt, helper) {
		cmp._virtualItems = [];
        if (cmp.get("v.initBeforeRender")) {
            var listSize = cmp.get("v.initialSize");
            helper.generateListItems(0, listSize, function(item) {
                cmp._virtualItems.push(item);
            });
        }
    },
    
    onLoadMore: function(cmp, callback, helper) {
        setTimeout(function() {
            var currentSize = cmp._virtualItems.length;
            var newSize = currentSize + cmp.get("v.loadSize");
            helper.generateListItems(currentSize, newSize,
                function(item) {
                    cmp._virtualItems.push(item);
                },
                function() {
                    var div = cmp.find("body").getElement();
                    var items = cmp._virtualItems;
                    helper.renderItemsToDom(div, items);
                    callback();
                }
            );
        }, cmp.get('v.loadDelay_ms'));
    }
})
