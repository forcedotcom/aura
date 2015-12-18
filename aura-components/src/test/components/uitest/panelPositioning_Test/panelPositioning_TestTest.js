({

	 testNorth: {
	 	test: function(cmp){
	 		var t = this.makeTest('north', function(cmp, panel) {
	 			$A.test.addWaitForWithFailureMessage(true, function() {
		 			var p = panel.getElement();
		 			var t = cmp.find('littleTarget').getElement();
		 			return p.getBoundingClientRect().bottom < t.getBoundingClientRect().top;
	 			}, 'Panel must be north of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testSouth: {
	 	test: function(cmp){
	 		var t = this.makeTest('south', function(cmp, panel) {
	 			$A.test.addWaitForWithFailureMessage(true, function() {
		 			var p = panel.getElement();
		 			var t = cmp.find('littleTarget').getElement();
		 			return p.getBoundingClientRect().top > t.getBoundingClientRect().bottom;
	 			}, 'Panel must be south of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testEast: {
	 	test: function(cmp){
	 		var t = this.makeTest('east', function(cmp, panel) {
	 		    $A.test.addWaitForWithFailureMessage(true, function() {
	 		        var p = panel.getElement();
	                var t = cmp.find('littleTarget').getElement();
	                return p.getBoundingClientRect().left > t.getBoundingClientRect().right;
	 		    }, "Panel must be east of target");
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testWest: {
	 	test: function(cmp){
	 		var t = this.makeTest('west', function(cmp, panel) {
	 			$A.test.addWaitForWithFailureMessage(true, function() {
	 				var p = panel.getElement();
	 				var t = cmp.find('littleTarget').getElement();
	 				return p.getBoundingClientRect().right < t.getBoundingClientRect().left;
	 			}, 'Panel must be west of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testSouthWest: {
	 	test: function(cmp){
	 		var t = this.makeTest('southwest', function(cmp, panel) {
	 			$A.test.addWaitForWithFailureMessage(true, function() {
		 			var p = panel.getElement();
		 			var t = cmp.find('littleTarget').getElement();
		 			return p.getBoundingClientRect().right < t.getBoundingClientRect().left && p.getBoundingClientRect().top > t.getBoundingClientRect().bottom;
	 			}, 'Panel must be southwest of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testNorthWest: {
	 	test: function(cmp){
	 		var t = this.makeTest('northwest', function(cmp, panel) {
	 			$A.test.addWaitForWithFailureMessage(true, function() {
		 			var p = panel.getElement();
		 			var t = cmp.find('littleTarget').getElement();
		 			return p.getBoundingClientRect().right < t.getBoundingClientRect().left && p.getBoundingClientRect().bottom < t.getBoundingClientRect().top;
	 			}, 'Panel must be northwest of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testNorthEast: {
	 	test: function(cmp){
	 		var t = this.makeTest('northeast', function(cmp, panel) {
	 			$A.test.addWaitForWithFailureMessage(true, function() {
		 			var p = panel.getElement();
		 			var t = cmp.find('littleTarget').getElement();
		 			return p.getBoundingClientRect().left > t.getBoundingClientRect().right && p.getBoundingClientRect().bottom < t.getBoundingClientRect().top;
	 			}, 'Panel must be northeast of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testSouthEast: {
	 	test: function(cmp){
	 		var t = this.makeTest('southeast', function(cmp, panel) {
		 			$A.test.addWaitForWithFailureMessage(true, function() {
			 			var p = panel.getElement();
			 			var t = cmp.find('littleTarget').getElement();
			 			return p.getBoundingClientRect().left > t.getBoundingClientRect().right && p.getBoundingClientRect().top > t.getBoundingClientRect().bottom;
	 			}, 'Panel must be southeast of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testNorthInside: {
	 	test: function(cmp){
	 		var t = this.makeTest('north', function(cmp, panel) {
	 			$A.test.addWaitForWithFailureMessage(true, function() {
		 			var p = panel.getElement();
		 			var t = cmp.find('bigTarget').getElement();
		 			return p.getBoundingClientRect().top == t.getBoundingClientRect().top;
	 			}, 'Top of panel and target must be aligned');
	 		}, true);
	 		t.bind(this)(cmp);
	 	}
	 },


	 testSouthInside: {
	 	test: function(cmp){
	 		var t = this.makeTest('south', function(cmp, panel) {
	 			$A.test.addWaitForWithFailureMessage(true, function() {
		 			var p = panel.getElement();
		 			var t = cmp.find('bigTarget').getElement();
		 			return p.getBoundingClientRect().bottom == t.getBoundingClientRect().bottom;
	 			}, 'Bottom of panel and target must be aligned');
	 		}, true);
	 		t.bind(this)(cmp);
	 	}
	 },

	 testEastInside: {
	 	test: function(cmp){
	 		var t = this.makeTest('east', function(cmp, panel) {
	 			$A.test.addWaitForWithFailureMessage(true, function() {
		 			var p = panel.getElement();
		 			var t = cmp.find('bigTarget').getElement();
		 			return Math.ceil(p.getBoundingClientRect().right) == Math.round(t.getBoundingClientRect().right);
	 			}, 'Right side of of panel and target must be aligned');

	 		}, true);
	 		t.bind(this)(cmp);
	 	}
	 },

	 testWestInside: {
	 	test: function(cmp){
	 		var t = this.makeTest('west', function(cmp, panel) {
	 			$A.test.addWaitForWithFailureMessage(true, function() {
		 			var p = panel.getElement();
		 			var t = cmp.find('bigTarget').getElement();
		 			return  p.getBoundingClientRect().left == t.getBoundingClientRect().left;
	 			},'Left side of panel and target must be aligned');
	 		}, true);
	 		t.bind(this)(cmp);
	 	}
	 },

	 /*
	 This test only tests one combination of target and target align, because
	 there are unit tests on the library that test the details,
	 this just needs to make sure the values are properly passed through
	  */
	 testAdvanced: {
	 	test: function(cmp) {
	 		var myPanel = null;
	 		var littleTarget = cmp.find('littleTarget').getElement();
			var body = $A.createComponentFromConfig({componentDef: { descriptor: "markup://aura:unescapedHtml" }, attributes: {values: {value: '<div class="panel-content">Woooooo</div>'}}});

	 		$A.test.addWaitFor(true, function() {
	 			return !!myPanel;
	 		}, function() {

	 			$A.test.addWaitForWithFailureMessage(true, function(){
	 				var p = myPanel.getElement();
	 				var t = cmp.find('littleTarget').getElement();
	 				
	 				// allow within five pixel tolerance because of slight rounding errors in chrome
	 				return Math.round(p.getBoundingClientRect().right/5) * 5 == Math.round(t.getBoundingClientRect().right/5) * 5;
	 			}, 'right should be aligned');
	 			
	 		});


	        this.makePanel({
	                referenceElement: littleTarget,
	                showCloseButton: false,
	                closeOnClickOut: true,
	                useTransition: false,
	                body  : body,
	                advancedConfig: {
	                	targetAlign: 'right top',
	                	align: 'right top'
	                },
	                pad:0,
	                showPointer: false,
	                boundingElement: window
	        }, function(panel) {
        		myPanel = panel;
	        });	 	
	    }
	 },

	 testTopPad: {
	 	test: function(cmp) {
	 	    var that = this;
	 		var myPanel = null;
	 		var littleTarget = cmp.find('littleTarget').getElement();
	 		var body = $A.createComponentFromConfig({componentDef: { descriptor: "markup://aura:unescapedHtml" }, attributes: {values: {value: '<div class="panel-content">Woooooo</div>'}}}); 

	 		$A.test.addWaitFor(true, function() {
	 			return !!myPanel;
	 		}, function() {
	 			$A.test.addWaitForWithFailureMessage(true, function(){
	 				var p = myPanel.getElement();
	 				var t = cmp.find('littleTarget').getElement();

	 				// 5px tolerance
	 				var topPadded  = Math.round(p.getBoundingClientRect().top / 5) * 5 ==  Math.round(t.getBoundingClientRect().top /5) * 5 + 5;

	 				var leftAligned = Math.round(p.getBoundingClientRect().left / 5) * 5 == Math.round(t.getBoundingClientRect().left / 5) * 5;
	 				return topPadded && leftAligned;
	 			}, 'left should be aligned and top should be padded by 5px');

	 		});

	 		this.makePanel({
                referenceElement: littleTarget,
                showCloseButton: false,
                closeOnClickOut: true,
                useTransition: false,
                body  : body,
                advancedConfig: {
                    targetAlign: 'left top',
                    align: 'left top',
                    vertPad: 5
                },
                pad: 0,
                showPointer: false,
                boundingElement: window
            }, function(panel) {
                myPanel = panel;
            }); 

	    }
	 },

	 makeTest: function(direction, testFunc, inside){
	 	return function(cmp) {
	 	   var bigTarget = cmp.find('bigTarget').getElement();
           var littleTarget = cmp.find('littleTarget').getElement();
           var value = direction;

           var isInside = inside || false;
           var myPanel = null;
           var that = this;
           $A.createComponent("aura:unescapedHtml", {value: '<div class="panel-content">Woooooo</div>'}, function(body) {
               that.makePanel({
                   referenceElement: isInside? bigTarget: littleTarget,
                   showCloseButton: false,
                   closeOnClickOut: true,
                   useTransition: false,
                   body  : body,
                   direction: value,
                   showPointer: false,
                   boundingElement: window,
                   inside: isInside,
                   pad: isInside ? 0 : 15 //easier to caluculate insideness with 0 pad
               }, function(panel) {
                   // setTimeout(function(){
                       myPanel = panel;
                   // }, 5);
               });
           });

           $A.test.addWaitFor(true, 
                   function() {
               return !!myPanel;
           }, function() {
               return testFunc(cmp, myPanel);
           });
         }
    },

	 makePanel: function(config, cb) {
	 	$A.get('e.ui:createPanel').setParams({
	            panelType   :'panel',
	            visible: true,
	            panelConfig : config, onCreate:function(panel) {
	            	cb(panel);
	            }}).fire();
	 }
})