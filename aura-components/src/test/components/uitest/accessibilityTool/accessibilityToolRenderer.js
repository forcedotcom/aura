({
    afterRender : function(cmp, hlp){
      hlp.injectCmp(cmp);
      this.superAfterRender();
    },
    
    rerender : function(cmp, hlp){
	hlp.injectCmp(cmp);
	this.superRerender();
    }
})