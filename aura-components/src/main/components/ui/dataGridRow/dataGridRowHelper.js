/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({  
    /**
     * Initializes columns.
     * Action instances are not ready at provide invocation.
     */
    setRowData: function (cmp) {
        var rowData = cmp.get("v.rowData");
        var cols = cmp.get("v.columns");
        var createdRowData = [];
        var rowContext = {
            selected : $A.expressionService.create(null, cmp.get("v.selected")),
            disabled : $A.expressionService.create(null, cmp.get("v.disabled")),
            index : $A.expressionService.create(null, cmp.get("v.index"))
        };
        var vp = $A.expressionService.createPassthroughValue(rowContext, cmp);
        for(var j=0; j<cols.length; j++) {
            if(cols[j].getType() !== "ui:dataGridColumn") {
                var cmps = [];
                var outputComponents = cols[j].get("v.outputComponent");
                for(var i=0; i<outputComponents.length;i++) {					
                    var cdr = outputComponents[i];
                    var config = {
                        descriptor: cdr.componentDef["descriptor"],
                        localId: cdr["localId"],
                        attributes: cdr.attributes["values"],
                        valueProvider: vp
                    };
    
                    cmps.push($A.createComponentFromConfig(config));
                }
                createdRowData.push(cmps);
            } else {
                createdRowData.push(rowData[cols[j].get("v.name")]);
            }
        }
        cmp.set("v.vp", vp);
        cmp.set("v.createdRowData", createdRowData);
    }
})// eslint-disable-line semi