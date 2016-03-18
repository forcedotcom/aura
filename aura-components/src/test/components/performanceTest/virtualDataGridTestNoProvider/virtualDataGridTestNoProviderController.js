({

    setup : function(cmp, event, helper) {

        var NUM_ROWS = 50, NUM_COLUMNS = 50;

        cmp.gridData = [];

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
                    "componentDef": {
                        "descriptor":"markup://ui:outputText"
                    },
                    "attributes" : {
                        "values" : {
                            "value": "{"  + "!item.c" + i + "}"
                        }
                    }
                }        
            columnTemplates.push(columnTemplate);
        }
        
        cmp.find('myData').set("v.headerColumns", dataGridColumns);
        cmp.find('myData').set("v.columns", columnTemplates);

        // generate data for NUM_ROWS rows
        for (var i = 0; i < NUM_ROWS; i++) {
            var gridRow = {};
            for(var j = 0; j< NUM_COLUMNS;j++){
                gridRow["c" + j] = j;
            }
            cmp.gridData.push(gridRow);
        }

    },

    run : function(cmp, event, helper) {
        cmp.set("v.data", cmp.gridData);
        event.getParam('arguments').done.immediate();
    },

    postProcessing : function(cmp, event, helper) {

    }
})