({
    init: function (cmp, event, helper) {
        cmp.counter = 0;
    },
    createP2: function (cmp, event, helper) {
        var body = $A.newCmp({componentDef: 'uitest:panel2Content'});

        $A.get('e.ui:createPanel').setParams({
            panelType   :'myPanel2',
            visible: true, 
            panelConfig : {
                title: 'instance(' + (cmp.counter++) + ')',
                body  : body
            },
            onCreate: function (panel) {
                //console.log(panel);
            }

        }).fire();
    }
})