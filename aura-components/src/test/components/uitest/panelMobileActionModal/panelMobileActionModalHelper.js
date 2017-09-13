({
	getCreatePanelEvent : function(cmp, closeAfterCreate) {
		var footerAction = null;
		$A.createComponent('markup://ui:button', {
                    action: {'label': 'footerActionBtn', 'showlabel': true}
                }, function(newCmp) {
                    footerAction = newCmp;
                });
		
		return $A.get('e.ui:createPanel').setParams({
			panelType : 'modal',
			visible : true,
			panelConfig : {
				title : 'Mobile Action Modal',
				showCloseButton: true,
				body : 'This is a mobile action modal',
				footerActions : footerAction,
				closeOnActionButtonClick : true 
			},
			onCreate : function(panel) {
				cmp._panel = panel;
				if(closeAfterCreate) {
					panel.close();
				}
			}
		});
	}
})