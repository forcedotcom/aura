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
     *  Test virtual data grid is loaded with fixed header.
     */
    testFixedHeader : {
        browsers: ["-IE7","-IE8"],
        attributes : {"testFixedHeader" : true},
        test : function(cmp) {
            var dataGrid = $A.test.getElementByClass("uiVirtualDataGrid");
            $A.test.assertNotNull(dataGrid, "Data grid was not loaded");

            var fixedHeader = $A.util.hasClass(dataGrid, "fixedHeaderTable");
            $A.test.assertNotNull(fixedHeader, "Header is not fixed");

            var dataRows = cmp.find("grid").getElement().getElementsByTagName("td");
            $A.test.assertNotNull(dataRows, "Data for data grid not rendered");
            var data = $A.test.getText(dataRows[0]);
            $A.test.assertEquals("Krista Arnold", data, "Data for data grid incorrect");
        }
    },

    testRowEventHandlerCalledOnClick: {
        browsers: ["-IE7","-IE8"],
        test: [
           function(cmp) {
               cmp._initialText = $A.test.getText(cmp.find("grid").getElement().getElementsByTagName("td")[0]);
               var firstGridRow = cmp.find("grid").getElement().getElementsByTagName("td")[0];
               var div = firstGridRow.getElementsByTagName("div")[0];
               // Event handler defined on div so must click there
               div.focus();
               $A.test.clickOrTouch(div); 
           },
           function(cmp) {
               var actualText = $A.test.getText(cmp.find("grid").getElement().getElementsByTagName("td")[0]);
               // click handler appends exclamation mark to current text
               $A.test.assertEquals(cmp._initialText+"!", actualText, "Click event handler not called for virtualDataGrid row");
           }
       ]
    }
})