({
	getMenuSelected: function(cmp, event) {
        var menuCmp = cmp.find("checkboxMenu");
        var menuItems = menuCmp.get("v.childMenuItems");
        var values = [];
        for (var i = 0; i < menuItems.length; i++) {
            var c = menuItems[i];
            if (c.get("v.selected") === true) {
                values.push(c.get("v.label"));
            }
        }
        var resultCmp = cmp.find("result");
        resultCmp.set("v.value", values.join(","));
    }	
})
