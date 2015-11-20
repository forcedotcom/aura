({

    setup : function(cmp, event, helper) {
        cmp.mData = cmp.get('m.data');
        cmp.datagrid = cmp.find("myGrid");
    },

    run : function(cmp, event, helper) {

        for (var i = 0; i < cmp.mData.length; i++) {
            cmp.datagrid.appendItems([ cmp.mData[i] ]);
        }

        event.getParam('arguments').done.immediate();
    },

    postProcessing : function(cmp, event, helper) {

    }
})