({
	getConfig: function(cmp) {
		if (!this._componentConfig) {
			this._componentConfig= [{
				componentDef: 'markup://ui:outputText',
				attributes : {
					values :
					{
						value : 'testing'
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
				}
			},
			{
				componentDef: 'markup://ui:button',
				attributes : {
					values :
					{
						label : 'button 2'
					}
				}
			},
			{
				componentDef: 'markup://ui:button',
				attributes : {
					values :
					{
						"class": 'pressOverlay',
						label : 'open another overlay'
					}
				}
			}
		];
		}
		return this._componentConfig;
	}	
})