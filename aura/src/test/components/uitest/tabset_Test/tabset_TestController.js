({
    addTab: function(cmp, evt) {
        if (!cmp._counter) cmp._counter = 0;
        var title = "Dynamic";
        var content = "Dynamically generated";
        var closable = true;
        var active = true;
        var e = cmp.find('tabset2').get("e.addTab");
        
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
        }]}, index: -1});
        e.fire();
        cmp._counter++;
    },
    
    updateTab: function(cmp) {
        cmp.find("icon").set("v.value", "new Title");
    },
    
    activateTabByName: function(cmp) {
        var name = cmp.find("campaigns").get('v.name');
        var e = cmp.find('tabset2').get("e.activateTab");
        e.setParams({"name": name}).fire();
    },
    
    activateTabByIndex: function(cmp) {
        var index = cmp.find("dashboard").get('v.value');
        var e =cmp.find('tabset2').get("e.activateTab");
        e.setParams({"index": index}).fire();
    }
    
})