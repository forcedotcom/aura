({

    setup : function(cmp, event, helper) {

        helper.generateColumnConfigs(cmp);
    },

    run : function(cmp, event, helper) {

        var grid = cmp.find("myGrid");
        var headers = grid.get("v.headerColumns");
        var columns = grid.get("v.columns");
        var newHeaders = [];
        var newColumns = [];

        // produces a shuffled array of integers 0 to columns.length
        var shuffledColumnsIndices = helper.shuffle(Array.apply(null, {
            length : columns.length
        }).map(Number.call, Number));

        for (var i = 0; i < headers.length; i++) {

            var randColumn = shuffledColumnsIndices.splice(0, 1);

            // get the configuration of the random column
            var config = cmp._columnConfigs[headers[randColumn].get("v.name")];

            $A.createComponent("ui:dataGridColumn", config.header.attributes.values, function(newCmp, status, statusMessagesList) {
                // create arrays holding virtualDataGrid's `columns` and `headerColumns` attributes
                newHeaders[i] = newCmp;
                newColumns[i] = config.column;
                // set the grid's attributes when we're done building the arrays 
                if (shuffledColumnsIndices.length === 0) {
                    grid.set("v.headerColumns", newHeaders);
                    grid.set("v.columns", newColumns);
                    event.getParam('arguments').done.immediate();
                }
            });

        }
    },

    postProcessing : function(cmp, event, helper) {

    }

})