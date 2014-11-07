({
    showPanelFullSCreen: function(cmp, event, helper) {
        var openPanelEvent = $A.get('e.ui:openPanel').setParams({
            show: true,
            title: 'my panel',
            'class': 'myPanel',
            isFullScreen: true,
            callbacks: { onCreate: function(panel){
                var cmps = $A.componentService.newComponentAsync(this, function(){}, helper.getConfig(cmp));
                var overlay = cmps[3];
                overlay.addHandler('press', cmp, 'c.showPanel')
                panel.set("v.body", cmps);
            }
            }
        });
        openPanelEvent.fire();
    },

    showPanel: function(cmp, event, helper) {
        var openPanelEvent = $A.get('e.ui:openPanel').setParams({
            show: true,
            title: 'my panel',
            'class': 'myPanel',
            isFullScreen: false,
            callbacks: { onCreate: function(panel){
                var cmps = $A.componentService.newComponentAsync(this, function(){}, helper.getConfig(cmp));
                var overlay = cmps[3];
                overlay.addHandler('press', cmp, 'c.showPanel')
                panel.set("v.body", cmps);
            }
            }
        });
        openPanelEvent.fire();
    },
	
	showModal: function(cmp, event, helper) {
		var cmps = $A.componentService.newComponentAsync(this, function(){}, helper.getConfig(cmp));
		var overlay = cmps[3];
		overlay.addHandler('press', cmp, 'c.showModal')
		var openPanelEvent = $A.get('e.ui:openPanel').setParams({
        	show: true,
        	isModal: true,
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
	
	showPanelSlider: function(cmp,event, helper) {
		if (cmp._panelSlider) {
			return;
		}
		var openPanelEvent = $A.get('e.ui:openPanel').setParams({
        	show: true,
        	isSlider: true,
        	isVisible: true,
        	title: 'my panel',
        	'class': 'myWidth',
            callbacks: {onCreate: function(panel){
            	var cmps = $A.componentService.newComponentAsync(this, function(){}, helper.getConfig(cmp));
            	panel.set("v.body", cmps);
            	cmp._panelSlider = panel;
            }}
        });
        openPanelEvent.fire();
	},
	
	newOverlay: function(cmp,event, helper) {
		this.showModal(cmp,event, helper);
	},
	
	destroyPanelSlider: function(cmp, event, helper) {
		$A.getEvt("ui:closePanel").setParams({
            instance : cmp._panelSlider,
            destroy: true
        }).fire();
		cmp._panelSlider = null;
	}
})