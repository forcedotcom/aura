({

        afterRender: function(cmp, helper) {
                var dom = cmp.getElement();
                helper.lib.panelLibCore.scopeScroll(dom);
        }
})