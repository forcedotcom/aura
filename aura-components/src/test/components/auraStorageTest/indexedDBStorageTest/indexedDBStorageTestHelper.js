({
    "appendLine" : function(cmp, text) {
        var content = cmp.find("content");
        var body;
        $A.createComponent("aura:text", { "value": text }, function(newCmp, error) {
            if (error) {
                console.log(error);
            }
            if (content.isValid() && newCmp) {
                body = content.get("v.body");
                body.push(newCmp);
                content.set("v.body", body);
            }
            $A.createComponent("aura:html", { "tag": "br" }, function(newCmp, error) {
                if (error) {
                    console.log(error);
                }
                if (content.isValid() && newCmp) {
                    body = content.get("v.body");
                    body.push(newCmp);
                    content.set("v.body", body);
                }
            });
        });
    }
})
