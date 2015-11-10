({
    generateColumnConfigs: function(cmp) {
        cmp._columnConfigs = {
            firstName: {
                header: {
                    "componentDef": "markup://ui:dataGridColumn",
                    "attributes": {
                        "values": {
                            label: "First Name",
                            name: "firstName"
                        }
                    }
                },
                column: {
                    "componentDef": "markup://ui:outputText",
                    "attributes": {
                        "values": {
                            value: $A.expressionService.create(null, "{!item.firstName}")
                        }
                    }
                }
            },
            lastName: {
                header: {
                    "componentDef": "markup://ui:dataGridColumn",
                    "attributes": {
                        "values": {
                            label: "Last Name",
                            name: "lastName"
                        }
                    }
                },
                column: {
                    "componentDef": "markup://ui:outputText",
                    "attributes": {
                        "values": {
                            value: $A.expressionService.create(null, "{!item.lastName}")
                        }
                    }
                }
            },
            _id: {
                header: {
                    "componentDef": "markup://ui:dataGridColumn",
                    "attributes": {
                        "values": {
                            label: "ID",
                            name: "_id"
                        }
                    }
                },
                column: {
                    "componentDef": "markup://ui:outputText",
                    "attributes": {
                        "values": {
                            value: $A.expressionService.create(null, "{!item._id}")
                        }
                    }
                }
            },
            isActive: {
                header: {
                    "componentDef": "markup://ui:dataGridColumn",
                    "attributes": {
                        "values": {
                            label: "Active",
                            name: "isActive"
                        }
                    }
                },
                column: {
                    "componentDef": "markup://ui:outputText",
                    "attributes": {
                        "values": {
                            value: $A.expressionService.create(null, "{!item.isActive}")
                        }
                    }
                }
            },
            balance: {
                header: {
                    "componentDef": "markup://ui:dataGridColumn",
                    "attributes": {
                        "values": {
                            label: "Balance",
                            name: "balance"
                        }
                    }
                },
                column: {
                    "componentDef": "markup://ui:outputText",
                    "attributes": {
                        "values": {
                            value: $A.expressionService.create(null, "{!item.balance}")
                        }
                    }
                }
            },
            age: {
                header: {
                    "componentDef": "markup://ui:dataGridColumn",
                    "attributes": {
                        "values": {
                            label: "Age",
                            name: "age"
                        }
                    }
                },
                column: {
                    "componentDef": "markup://ui:outputText",
                    "attributes": {
                        "values": {
                            value: $A.expressionService.create(null, "{!item.age}")
                        }
                    }
                }
            },
            address: {
                header: {
                    "componentDef": "markup://ui:dataGridColumn",
                    "attributes": {
                        "values": {
                            label: "Address",
                            name: "address"
                        }
                    }
                },
                column: {
                    "componentDef": "markup://ui:outputText",
                    "attributes": {
                        "values": {
                            value: $A.expressionService.create(null, "{!item.address}")
                        }
                    }
                }
            }
        }
    },
        
    shuffle: function(array) {
    	  var currentIndex = array.length, temporaryValue, randomIndex ;

    	  // While there remain elements to shuffle...
    	  while (0 !== currentIndex) {

    	    // Pick a remaining element...
    	    randomIndex = Math.floor(Math.random() * currentIndex);
    	    currentIndex -= 1;

    	    // And swap it with the current element.
    	    temporaryValue = array[currentIndex];
    	    array[currentIndex] = array[randomIndex];
    	    array[randomIndex] = temporaryValue;
    	  }

    	  return array;
    	}    
})