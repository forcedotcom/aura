({
	
	showModal: function(cmp, event, helper) {
		var cmps = $A.componentService.newComponentAsync(this, function(){}, helper.getConfig(cmp));
		var overlay = cmps[3];
		overlay.addHandler('press', cmp, 'c.showModal')
		var openPanelEvent = $A.get('e.ui:openPanel').setParams({
        	show: true,
            isModal: true,
            isDialog: true,
        	title: 'my panel',
        	'class': 'myClass',
        	body: cmps
//            callbacks: { onCreate: function(panel){
//            	var cmps = $A.componentService.newComponentAsync(this, function(){}, helper.getConfig(cmp));
//            	panel.set("v.body", cmps);
//            }}
        });
        openPanelEvent.fire();
	},

    showNonModal: function(cmp, event, helper) {
        var cmps = $A.componentService.newComponentAsync(this, function(){}, helper.getConfig(cmp));
        var overlay = cmps[3];
        var referenceElement = cmp.find("nonModalButton").getElement();
        overlay.addHandler('press', cmp, 'c.showNonModal');

        var openPanelEvent = $A.get('e.ui:openPanel').setParams({
            show: true,
            isModal: false,
            isDialog: true,
            referenceElement: referenceElement,
            title: 'my panel',
            'class': 'myClass',
            body: cmps
//            callbacks: { onCreate: function(panel){
//            	var cmps = $A.componentService.newComponentAsync(this, function(){}, helper.getConfig(cmp));
//            	panel.set("v.body", cmps);
//            }}
        });
        openPanelEvent.fire();
    },
	
	newOverlay: function(cmp,event, helper) {
		this.showModal(cmp,event, helper);
	}
})