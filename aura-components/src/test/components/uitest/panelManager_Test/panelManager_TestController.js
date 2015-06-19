({
    init: function (cmp, event, helper) {
        cmp.counter = 0;
    },
    createP2: function (cmp, event, helper) {
    	var count = cmp.counter++;
    	
        var body = $A.newCmp({componentDef: 'uitest:panel2Content'});
        
        $A.get('e.ui:createPanel').setParams({
        	panelType   :'myPanel2',
            visible: true, 
            panelConfig : {
            	"instanceId": count,
            	title: 'instance(' + (count) + ')',
                body  : body
            },
            onCreate: function (panel) {
                cmp.get("v._testPanels").push(panel);
            }

        }).fire();
    }
})