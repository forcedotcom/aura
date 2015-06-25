({
	addTab: function(cmp, title, content, closable, active){
		var e = cmp.find('tabsetOverflow').get("e.addTab");

        e.setParams({tab: {
            "title": title,
            "closable": closable,
            "active": active,
            "body": [{
                "componentDef": { descriptor:"markup://aura:text" },
                "attributes": {
                    "values": {
                        "value": content
                    }
                }
            }],
            }, index: -1});
        e.fire();
	}
})