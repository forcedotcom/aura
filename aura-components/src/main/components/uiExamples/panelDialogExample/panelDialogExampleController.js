({
	showNonModal: function(cmp, event, helper) {
	      var nonModalCmp = $A.newCmp({componentDef: 'uiExamples:detailPopover', attributes: {}});
	      var referenceElement = cmp.find("detailTrigger").getElement();
	      var openPanelEvent = $A.get('e.ui:openPanel').setParams({
	          show: true,
	          isModal: false,
	          isDialog: true,
	          referenceElement: referenceElement,
	          title: 'Detail Panel',
	          titleDisplay: false,
	          body: nonModalCmp,
	          showCloseButton: false,
	          animation: 'none'
	      });
	      openPanelEvent.fire();
	   },
	   
	   showModal: function(cmp, event, helper) {
		   var modalCmp = $A.newCmp({componentDef: 'uiExamples:detailPopover', attributes: {}});
		      var openPanelEvent = $A.get('e.ui:openPanel').setParams({
		          show: true,
		          isModal: true,
		          isDialog: true,
		          title: 'Detail Panel',
		          titleDisplay: false,
		          body: modalCmp,
		          animation: 'none'
		      });
		      openPanelEvent.fire();
	   }
	
})