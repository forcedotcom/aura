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
    EDIT_LAYOUTS : {
        id : {
            componentDef : {
                descriptor : 'markup://ui:inputNumber'
            }
        },
        name : {
            componentDef : {
                descriptor : 'markup://ui:inputText'
            }
        },
        grade : {
            componentDef : {
                descriptor : 'markup://ui:inputNumber'
            }
        },
        linkLabel : {
            componentDef : {
                descriptor : 'markup://ui:inputText'
            }
        },
        issueDate : {
            componentDef : {
                descriptor : 'markup://ui:inputDate'
            }
        },
        passing : {
            componentDef : {
                descriptor : 'markup://ui:inputCheckbox'
            }
        },
        notes : {
            componentDef : {
                descriptor : 'markup://ui:inputTextArea'
            }
        },
        modDateTime : {
            componentDef : {
                descriptor : 'markup://ui:inputDateTime'
            }
        }
    },
    
    sortData : function(cmp, sortBy) {
        // hack just reversing list of items, no real sorting happening
        var items = cmp.get('v.items');
        var sortedItems = [];
        
        if (items.length === 0) {
            return;
        }
        
        for (var i=(items.length-1); i>=0; i--) {
            sortedItems.push(items[i]);
        }
        
        cmp.set('v.items', sortedItems);
    }
})// eslint-disable-line semi
