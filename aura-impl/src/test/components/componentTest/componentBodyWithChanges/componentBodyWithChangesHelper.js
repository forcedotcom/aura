({
    newComponent: function(cmp, item) {

        var text = $A.componentService.newComponent({
            'componentDef' : 'markup://ui:outputText',
            'attributes': {
                'values': {
                    'value': item.text
                }
            }
        });

        var div = $A.componentService.newComponent({
            'componentDef' : 'markup://aura:html',
            'localId' : item.color,
            'attributes': {
                'values': {
                    'tag' : 'div',
                    'HTMLAttributes' : {
                        'style': 'margin: 10px; border: 1px solid ' + item.color
                    },
                    'body' : [text]
                }
            }
        });

        return div;
    },

    newComponentList: function(cmp, items) {
        var newCmps = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var newCmp = this.newComponent(cmp, item);
            newCmps.push(newCmp);
        }

        return newCmps;
    }
})