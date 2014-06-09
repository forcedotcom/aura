({
    addTab: function(cmp, evt) {
        if (!cmp._counter) cmp._counter = 0;
        var title = cmp.find("inputTabTitle").get('v.value') || (" New Tab " + cmp._counter);
        var content = cmp.find("inputTabContent").get("v.value") || ('testing tab bdoy ' + cmp._counter);
        var closable = cmp.find("inputTabClosable").get("v.value") || false;
        var active = cmp.find("inputTabActive").get("v.value") || false;
        var name = cmp.find("inputTabName").get("v.value");
        var e =cmp.find('tabset2').get("e.addTab");
        
        e.setParams({tab: {
            "title": title,
            "closable": closable,
            "active": active,
            "name": name,
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
        var name = cmp.find("inputForActivateByName").get('v.value');
        var e =cmp.find('tabset2').get("e.activateTab");
        e.setParams({"name": name}).fire();
    },
    
    activateTabByIndex: function(cmp) {
        var index = cmp.find("inputForActivateByIndex").get('v.value');
        var e =cmp.find('tabset2').get("e.activateTab");
        e.setParams({"index": index}).fire();
    }
    
})