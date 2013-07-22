({
	getMenuSelected: function(cmp, event) {
        var menuCmp = cmp.find("checkboxMenu");
        var menuItems = menuCmp.getValue("v.childMenuItems");
        var values = [];
        for (var i = 0; i < menuItems.getLength(); i++) {
            var c = menuItems.getValue(i);
            if (c.get("v.selected") === true) {
                values.push(c.get("v.label"));
            }
        }
        var resultCmp = cmp.find("result");
        resultCmp.setValue("v.value", values.join(","));
    }	
})
