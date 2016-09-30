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
     *  Creates the appropriate cell wrapper component based on whether this
     *  needs to be a row header.
     */
    createWrapper: function(isRowHeader) {
        var cellWrapper;
        
        if (isRowHeader) {
             cellWrapper = document.createElement('TH');
             cellWrapper.setAttribute('scope', 'row');
         } else {
             cellWrapper = document.createElement('TD');
         }
         
        return cellWrapper;
    },
    
    /**
     *  Adds the appropriate classes to the table cell element. 
     */
    applyStyles: function(cmp, cell) {      
        var classes = cmp.get("v.class");
        if (!$A.util.isEmpty(classes)) {
            cell.setAttribute('class', classes);
        }
    },
    
    /**
     *  Renders the appropriate attributes and classes on the cell
     *  for keyboard navigation to work properly
     */
    applyKeyboardAttributes: function(cmp, cellWrapper) {
        this.updateClass(cellWrapper, "cellContainer", true);
    	cellWrapper.setAttribute('tabIndex', '-1');
    },
    
    updateClass: function(element, className, condition) {
        var operation = condition ? 'add' : 'remove';
        element.classList[operation](className);
    }
})// eslint-disable-line semi