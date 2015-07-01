({
    // TODO(tbliss): Remove this if possible. Or call through to library so not duplicating functionality
    "appendLine" : function(cmp, text) {
        var content = cmp.find("content");
        var body;
        var configs = [];
        configs[0] = ["aura:text", { "value": text }];
        configs[1] = ["aura:html", { "tag": "br" }];
        $A.createComponents(configs,
            function(newCmps, overallStatus) {
                if (content.isValid() && newCmps) {
                    body = content.get("v.body");
                    for (var i = 0; i < newCmps.length; i++) {
                        body.push(newCmps[i]);
                    }
                    content.set("v.body", body);
                }
        });
    }
})
