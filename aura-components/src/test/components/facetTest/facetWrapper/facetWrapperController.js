({
	init: function (cmp) {
		$A.createComponent( 'markup://aura:text', { "value": "Programatic Body 6" },
        function (textCmp) {
            $A.createComponent( 'markup://miscTest:facet',
                { title: [textCmp] }, function (card) {
                    cmp.find('container').set('v.body' , card);
                });
        } )
	},
	toggle: function (cmp) {
		cmp.set('v.toggle', !cmp.get('v.toggle'));
	},
	changeFoo: function (cmp) {
		cmp.set('v.foo', 'Insanity | ' + Date.now());
	}
})