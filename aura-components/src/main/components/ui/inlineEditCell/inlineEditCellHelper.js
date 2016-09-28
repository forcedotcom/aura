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
    WRAPPER_CLASSES: 'slds-cell-edit',
    IS_EDITED_CLASS: 'slds-is-edited',
    HAS_ERRORS_CLASS: 'slds-has-error',
    
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
        var edited = cmp.get("v.edited");
        var hasErrors = cmp.get("v.hasErrors");
        
        var wrapperClasses = this.WRAPPER_CLASSES;
        
        var classes = cmp.get("v.class");
        if (!$A.util.isEmpty(classes)) {
            wrapperClasses += ' ' + classes;
        }
        
        cell.setAttribute('class', wrapperClasses);

        this.updateEdited(cell, edited);
        this.updateHasErrors(cell, hasErrors);
    },
    
    /**
     *  Helper function to update the edited class
     */
    updateEdited: function(element, isEdited) {
        this.updateClass(element, this.IS_EDITED_CLASS, isEdited);
    },
    
    /**
     *  Helper function to update the hasErrors class
     */
    updateHasErrors: function(element, hasErrors) {
        this.updateClass(element, this.HAS_ERRORS_CLASS, hasErrors);
    },
    
    /**
     *  Renders the appropriate attributes and classes on the cell
     *  for keyboard navigation to work properly
     */
    applyKeyboardAttributes: function(cmp, cellWrapper) {
        this.updateClass(cellWrapper, "cellContainer", true);
    	cellWrapper.setAttribute('tabIndex', '-1');
    },
    
    updateDisabled: function(cmp) {
        var disabled = cmp.get("v.disabled");
        
        if (disabled !== cmp._prevDisabled) {
            var buttonCmp = cmp.find("editTrigger");
            buttonCmp.set("v.disabled", disabled);
            
            var buttonClass = buttonCmp.get("v.class");
            
            if (disabled) {
                buttonClass += ' disabled';
            } else {
                buttonClass = buttonClass.replace('disabled', '');
            }
            
            buttonCmp.set("v.class", buttonClass);
            
            cmp._prevDisabled = disabled;
        }
    },
    
    updateClass: function(element, className, condition) {
        var operation = condition ? 'add' : 'remove';
        element.classList[operation](className);
    },
    
    getWrapper: function(cmp) {
        return cmp.getElement().parentNode;
    }
    
})// eslint-disable-line semi