({
    init: function() {

    },

    handleMouseDown: function(cmp, evt, helper) {
        helper.handleMouseDown(cmp, evt);
    },

    handlePress: function(cmp, evt, helper) {
        $A.createComponent('aura:unescapedHtml', {
                    'value': '<div class="panel-content">Much, much, much more text.<p>so much</p><h2>text</h2></div>'
                }, function(body){
                    var bigTarget = cmp.find('bigTarget').getElement();
                    var littleTarget = cmp.find('littleTarget').getElement();
                    var value = cmp.find('direction').get('v.value');
                    var showPointer = cmp.find('showPointer').get('v.value');
                    var pad = parseInt(cmp.find('pad').get('v.value'),10);
                    var padTop = cmp.find('padTop').get('v.value');


                    var isInside = cmp.find('isInside').get('v.value');

                    var panelConfig ={
                        referenceElement: isInside ? bigTarget : littleTarget,
                        showCloseButton: false,
                        closeOnClickOut: true,
                        useTransition: false,
                        body  : body,
                        direction: value,
                        showPointer: showPointer,
                        boundingElement: isInside ? window : bigTarget,
                        inside: isInside,
                        pad: pad
                    };

                    if(cmp.find('isAdvanced').get('v.value')) {
                        delete panelConfig.direction;
                        panelConfig.advancedConfig = {
                            align: cmp.find('align').get('v.value'),
                            targetAlign: cmp.find('targetAlign').get('v.value'),
                            vertPad: padTop !== undefined ? parseInt(padTop, 10) : undefined
                        };
                    }

                    $A.get('e.ui:createPanel').setParams({
                        panelType   :'panel',
                        visible: true,
                        panelConfig : panelConfig
                    }).fire();
                });

    }
})