({
    afterRender : function(cmp){
	cmp.get("inputTextBoxFocusable").getElement().focus();
	cmp.get("inputTextBoxFocusable").getElement().select();
	this.superAfterRender();
    }
})