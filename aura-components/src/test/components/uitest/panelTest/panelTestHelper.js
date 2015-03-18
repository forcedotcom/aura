({
	simpleConfig: [{
        componentDef: 'markup://ui:outputText',
        attributes : {
            values :
            {
                value : 'Dialog with Buttons'
            }
        }},
        {
        componentDef: 'markup://ui:button',
        attributes : {
            values :
            {
                label : 'button 1'
            }
        }},
        {
            componentDef: 'markup://ui:button',
            attributes : {
            values :
            {
                label : 'button 2'
            }
        }},
        {
            componentDef: 'markup://ui:button',
            attributes : {
                values :
                {
                    "class": 'pressOverlay',
                    label : 'open another overlay'
                }}
        }],
    mixConfig: [{
        componentDef: 'markup://ui:outputText',
        attributes : {
            values :
            {
                value : 'Dialog with Inputs'
            }
        }},
        {
            componentDef: 'markup://ui:inputText',
            attributes : {
                values :
                {
                    label : 'First Name',
                    'class' : 'firstInput'
                }
            }
        }, {
            componentDef: 'markup://ui:inputText',
            attributes : {
                values :
                {
                    label : 'Last Name'
                }
            }
        },
        {
            componentDef: 'markup://ui:button',
            attributes : {
                values :
                {
                    label : 'button 1'
                }
        }}
    ],
    getConfig: function(cmp, mode) {
		return this[mode || 'simpleConfig'];
	}
})