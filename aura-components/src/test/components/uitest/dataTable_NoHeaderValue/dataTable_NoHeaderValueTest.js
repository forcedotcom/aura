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
     * Verify that ui:datatable works when there are no headerValues specified.
     */
    //TODO: W-1006073
    _testDataTableWithNoHeader:{
        test:function(cmp){
            var dataTable = cmp.find('dataTable');

            var tableElement = dataTable.find('table').getElement();
            aura.test.assertTrue(tableElement instanceof HTMLTableElement, "expected to see a Table dom element in data Table.");
            aura.test.assertEquals(1, tableElement.rows.length, "Expected to see only one row in the table.")

            var dataRow = tableElement.firstChild;
            aura.test.assertTrue(dataRow instanceof HTMLTableRowElement, "Expected table row dom element." )
            aura.test.assertEquals("Row1 Col1Row1 Col2" , $A.test.getText(dataRow), "Text set in markup of dataTable not displayed." )
            aura.test.assertTrue(dataRow.cells[0] instanceof HTMLTableCellElement)
            aura.test.assertEquals('TD', dataRow.cells[0].tagName, 'Data in non header row should be shown using TD tags')
            aura.test.assertFalse( $A.util.hasClass(dataRow.cells[0],'header') , "data cells should not have header class" );
        }
    }
})
