({
    afterRender : function(cmp){
	cmp.find("inputTextBoxFocusable").getElement().focus();
	cmp.find("inputTextBoxFocusable").getElement().select();
	this.superAfterRender();
    }
})