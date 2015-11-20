({

    setup : function(cmp, event, helper) {

        var NUM_ROWS = 50, NUM_COLUMNS = 50;

        // use helper to pass the gridData to the run() callback
        // there might be a better way of doing this
        helper.gridData = [];

        var dataGridColumns = [];
        // the body of virtualDataGrid's 'columns' attribute 
        var columnTemplates = [];

        for (var i = 0; i < NUM_COLUMNS; i++) {
            // create dataGridColumn components to pass to the headerColumns attribute
            $A.createComponent("ui:dataGridColumn", {
                "label" : "C" + i,
                "name" : "c_" + i
            }, function(newDataGridColumn) {
                dataGridColumns.push(newDataGridColumn);
            });

            var columnTemplate = {
                "componentDef" : "markup://ui:outputText",
                "attributes" : {
                    "values" : {
                        value : i
                    }
                }
            }
            columnTemplates.push(columnTemplate);
        }
        

        cmp.find('myData').set("v.headerColumns", dataGridColumns);
        cmp.find('myData').set("v.columns", columnTemplates);

        // generate empty data for NUM_ROWS rows
        // empty since the data is being provided in columnTemplate.attributes.values.value
        for (var i = 0; i < NUM_ROWS; i++) {
            var gridRow = {};
            helper.gridData.push(gridRow);
        }

    },

    run : function(cmp, event, helper) {
        cmp.set("v.data", helper.gridData);
        event.getParam('arguments').done.immediate();
    },

    postProcessing : function(cmp, event, helper) {

    }
})