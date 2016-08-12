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
    BLOOD_TYPES : ['A', 'B', 'AB', 'O'],
    EDIT_LAYOUTS : {
        id : {
            componentDef : {
                descriptor : 'markup://ui:inputNumber'
            },
            attributes : {
                values : {
                    updateOn : 'input'
                }
            }
        },
        name : {
            componentDef : {
                descriptor : 'markup://ui:inputText'
            },
            attributes : {
                values : {
                    updateOn : 'input'
                }
            }
        },
        grade : {
            componentDef : {
                descriptor : 'markup://ui:inputNumber'
            },
            attributes : {
                values : {
                    updateOn : 'input'
                }
            }
        },
        linkLabel : {
            componentDef : {
                descriptor : 'markup://ui:inputText'
            },
            attributes : {
                values : {
                    updateOn : 'input'
                }
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
            },
            attributes : {
                values : {
                    updateOn : 'click'
                }
            }
        },
        notes : {
            componentDef : {
                descriptor : 'markup://ui:inputTextArea'
            },
            attributes : {
                values : {
                    updateOn : 'input'
                }
            }
        },
        modDateTime : {
            componentDef : {
                descriptor : 'markup://ui:inputDateTime'
            }
        },
        bloodtype : {
            componentDef : {
                descriptor : 'markup://ui:inputSelect'
            },
            attributes : {
                values : {
                    useMenu : true,
                    options : [
                        { label : "A", value : "A", selected : true},
                        { label : "B", value : "B", selected : false },
                        { label : "AB", value : "AB", selected : false },
                        { label : "O", value : "O", selected : false }
                    ]
                }
            }
        },
        progress : {
            componentDef : {
                descriptor : 'markup://ui:inputPercent'
            },
            attributes : {
                values : {
                    updateOn : 'input'
                }
            }
        },
        dues : {
            componentDef : {
                descriptor : 'markup://ui:inputCurrency'
            },
            attributes : {
                values : {
                    updateOn : 'input'
                }
            }
        },
    },
    
    EDIT_PANEL_CONFIG : {
        passing : {
            submitOn : 'change'
        },
        bloodtype : {
            submitOn : 'change'
        }
    },
    
    updateLastEdited : function(cmp, params) {
        var values = params.values;
        var lastEdited = {
            index : params.index,
            keys : [],
            values : []
        };
        
        // Retrieve keys and values as arrays
        for (key in values) {
            lastEdited.keys.push(key);
            lastEdited.values.push(values[key]);
        }
        
        cmp.set("v.lastEdited", lastEdited);
    }
})// eslint-disable-line semi
