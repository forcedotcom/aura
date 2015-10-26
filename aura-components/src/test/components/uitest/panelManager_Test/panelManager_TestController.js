({
    init: function (cmp, event, helper) {
        cmp.counter = 0;
    },
    createP2: function (cmp, event, helper) {
        var count = cmp.counter++;

        $A.createComponent("uitest:panel2Content", {}, function(newCmp) {
            $A.get('e.ui:createPanel').setParams({
                panelType   :'myPanel2',
                visible: true, 
                panelConfig : {
                    "instanceId": count,
                    title: 'instance(' + (count) + ')',
                    body  : newCmp
                },
                onCreate: function (panel) {
                    cmp.get("v._testPanels").push(panel);
                }
            }).fire();
        });
    }
})