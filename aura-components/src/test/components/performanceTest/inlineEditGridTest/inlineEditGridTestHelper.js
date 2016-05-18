({

    initGrid : function(cmp) {

        var EDIT_LAYOUTS = {
            A : {
                componentDef : {
                    descriptor : 'markup://ui:inputText'
                }
            },
             B : {
                componentDef : {
                    descriptor : 'markup://ui:inputText'
                }
            },
             C : {
                componentDef : {
                    descriptor : 'markup://ui:inputText'
                }
            }
        };

        var items = [];

        for (var i = 0; i < cmp.get("v.numRows") * 3; i++) {
            items.push({
                data : {
                    A : i,
                    B : ++i,
                    C : ++i
                },
                status : {},
                errors : {}
            });
        }
        
        cmp.set("v.items", items);
        
        // Generate edit layouts:
        cmp.find("grid").set("v.editLayouts", EDIT_LAYOUTS);
    },
     
     triggerEditOnCell : function(cmp, rowIndex, colIndex) {
         var tbody = document.getElementsByTagName("tbody")[0];
         var trs = this.getOnlyTrs(tbody.children);      
         var trigger = trs[rowIndex].children[colIndex].querySelector('.triggerContainer button');
         trigger.click();
     },
     
     getOnlyTrs : function(elements) {
         var elementArray = [];

         for (var i = 0; i < elements.length; i++) {
             if (elements[i].tagName == 'TR') {
                 elementArray.push(elements[i]);
             }
         }
         return elementArray;
     }

})
