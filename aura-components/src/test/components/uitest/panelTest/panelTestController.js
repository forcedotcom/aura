({
	
    showSimpleModal: function(cmp, event, helper) {
        $A.componentService.newComponentAsync(this, function(cmps){
            var overlay = cmps[3];
            overlay.addHandler('press', cmp, 'c.showModal')
            var openPanelEvent = $A.get('e.ui:openPanel').setParams({
                show: true,
                isModal: true,
                isDialog: true,
                title: 'Dialog Title',
                'class': 'myClass',
                body: cmps
            });
            openPanelEvent.fire();
        }, 
        // TODO(W-2528400): Cannot do helper.getConfig(cmp)) here because helper references wrong file
        cmp.getDef().getHelper().getConfig(cmp));
    },
    
	showModal: function(cmp, event, helper) {
		$A.componentService.newComponentAsync(this, function(cmps){
            var openPanelEvent = $A.get('e.ui:openPanel').setParams({
                show: true,
                isModal: true,
                isDialog: true,
                title: 'Dialog Title',
                'class': 'myClass',
                body: cmps,
                autoFocus: cmp.get("v.autoFocus")
            });
            openPanelEvent.fire();
        }, 
        // TODO(W-2528400): Cannot do helper.getConfig(cmp)) here because helper references wrong file
        cmp.getDef().getHelper().getConfig(cmp, 'mixConfig'));
	},

    showNonModal: function(cmp, event, helper) {
        $A.componentService.newComponentAsync(this, function(cmps){
            var overlay = cmps[3];
            var referenceElement = cmp.find("nonModalButton").getElement();
            overlay.addHandler('press', cmp, 'c.showNonModal');

            var openPanelEvent = $A.get('e.ui:openPanel').setParams({
                show: true,
                isModal: false,
                isDialog: true,
                referenceElement: referenceElement,
                title: 'Dialog Title',
                'class': 'myClass',
                body: cmps
            });
            openPanelEvent.fire();
        },
        // TODO(W-2528400): Cannot do helper.getConfig(cmp)) here because helper references wrong file
        cmp.getDef().getHelper().getConfig(cmp));
    },
    
    showNonModalNonTransient: function(cmp, event, helper) {
        if(!cmp._panel){
            $A.newCmpAsync(this, function(newCmp) {
                var referenceElement = cmp.find("nonModalButton").getElement();
                var overlay = newCmp[3];
                overlay.addHandler('press', cmp, 'c.showNonModalNonTransient');
                var openPanelEvent = $A.get('e.ui:openPanel').setParams({
                  show: true,
                  isModal: false,
                  isDialog: true,
                  referenceElement: referenceElement,
                  title: 'my panel',
                  body: newCmp,
                  closeOnClickOut: true,
                  isTransient : false,
                  callbacks: {onCreate: function(panel){
                      cmp._panel = panel;
                  }}
              });
              openPanelEvent.fire();
          }, 
          // TODO(W-2528400): Cannot do helper.getConfig(cmp)) here because helper references wrong file
          cmp.getDef().getHelper().getConfig(cmp));
        } else if (cmp._panel && cmp._panel.isValid()) {
            var openPanelEvent = $A.get('e.ui:openPanel').setParams({
                show: true,
                isModal: false,
                isDialog: true,
                closeOnClickOut: true,
                instance: cmp._panel,
                isTransient : false,
            });
            openPanelEvent.fire();
        }
    },
    
    newOverlay: function(cmp,event, helper) {
        this.showModal(cmp,event, helper);
    }
})