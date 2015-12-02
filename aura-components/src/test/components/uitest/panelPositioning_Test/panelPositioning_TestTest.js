({

	 testNorth: {
	 	test: function(cmp){
	 		var t = this.makeTest('north', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('littleTarget').getElement();
	 			$A.test.assert(p.getBoundingClientRect().bottom < t.getBoundingClientRect().top, 'Panel must be north of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testSouth: {
	 	test: function(cmp){
	 		var t = this.makeTest('south', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('littleTarget').getElement();
	 			$A.test.assert(p.getBoundingClientRect().top > t.getBoundingClientRect().bottom, 'Panel must be south of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

     // TODO(W-2853977): Tests flapping in Jenkins.
	 _testEast: {
	 	test: function(cmp){
	 		var t = this.makeTest('east', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('littleTarget').getElement();
	 			$A.test.assert(p.getBoundingClientRect().left > t.getBoundingClientRect().right, 'Panel must be east of target');

	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testWest: {
	 	test: function(cmp){
	 		var t = this.makeTest('west', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('littleTarget').getElement();
	 			$A.test.assert(p.getBoundingClientRect().right < t.getBoundingClientRect().left, 'Panel must be west of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testSouthWest: {
	 	test: function(cmp){
	 		var t = this.makeTest('southwest', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('littleTarget').getElement();
	 			var actual = p.getBoundingClientRect().right < t.getBoundingClientRect().left && p.getBoundingClientRect().top > t.getBoundingClientRect().bottom;
	 			$A.test.assert(actual, 'Panel must be southwest of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testNorthWest: {
	 	test: function(cmp){
	 		var t = this.makeTest('northwest', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('littleTarget').getElement();
	 			var actual = p.getBoundingClientRect().right < t.getBoundingClientRect().left && p.getBoundingClientRect().bottom < t.getBoundingClientRect().top;
	 			$A.test.assert(actual, 'Panel must be northwest of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testNorthEast: {
	 	test: function(cmp){
	 		var t = this.makeTest('northeast', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('littleTarget').getElement();
	 			var actual = p.getBoundingClientRect().left > t.getBoundingClientRect().right && p.getBoundingClientRect().bottom < t.getBoundingClientRect().top;
	 			$A.test.assert(actual, 'Panel must be northeast of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 testSouthEast: {
	 	test: function(cmp){
	 		var t = this.makeTest('southeast', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('littleTarget').getElement();
	 			var actual = p.getBoundingClientRect().left > t.getBoundingClientRect().right && p.getBoundingClientRect().top > t.getBoundingClientRect().bottom;
	 			$A.test.assert(actual, 'Panel must be southeast of target');
	 		});
	 		t.bind(this)(cmp);
	 	}
	 },

	 // TODO(W-2853977): Tests flapping in Jenkins.
	 _testNorthInside: {
	 	test: function(cmp){
	 		var t = this.makeTest('north', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('bigTarget').getElement();
	 			var actual = p.getBoundingClientRect().top == t.getBoundingClientRect().top;
	 			$A.test.assert(actual, 'Top of panel and target must be aligned');
	 		}, true);
	 		t.bind(this)(cmp);
	 	}
	 },

	 // TODO(W-2853977): Tests flapping in Jenkins.
	 _testSouthInside: {
	 	test: function(cmp){
	 		var t = this.makeTest('south', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('bigTarget').getElement();
	 			var actual = p.getBoundingClientRect().bottom == t.getBoundingClientRect().bottom;
	 			$A.test.assert(actual, 'Bottom of panel and target must be aligned');
	 		}, true);
	 		t.bind(this)(cmp);
	 	}
	 },

	 testEastInside: {
	 	test: function(cmp){
	 		var t = this.makeTest('east', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('bigTarget').getElement();
	 			var actual = Math.ceil(p.getBoundingClientRect().right) == Math.round(t.getBoundingClientRect().right);
	 			$A.test.assert(actual, 'Right side of of panel and target must be aligned');

	 		}, true);
	 		t.bind(this)(cmp);
	 	}
	 },

	 testWestInside: {
	 	test: function(cmp){
	 		var t = this.makeTest('west', function(cmp, panel) {
	 			var p = panel.getElement();
	 			var t = cmp.find('bigTarget').getElement();
	 			var actual = p.getBoundingClientRect().left == t.getBoundingClientRect().left;
	 			$A.test.assert(actual, 'Left side of panel and target must be aligned');
	 		}, true);
	 		t.bind(this)(cmp);
	 	}
	 },

	 /*
	 This test only tests one combination of target and target align, because
	 there are unit tests on the library that test the details,
	 this just needs to make sure the values are properly passed through
	  */
	 _testAdvanced: {
	 	test: function(cmp) {
	 		var myPanel = null;
	 		var littleTarget = cmp.find('littleTarget').getElement();
			var body = $A.createComponentFromConfig({componentDef: 'aura:unescapedHtml', attributes: {values: {value: '<div class="panel-content">Woooooo</div>'}}});

	 		$A.test.addWaitFor(true, function() {
	 			return !!myPanel;
	 		}, function() {

	 			var p = myPanel.getElement();
	 			var t = cmp.find('littleTarget').getElement();
	 			var actual = Math.floor(p.getBoundingClientRect().right) == Math.floor(t.getBoundingClientRect().right);
	 			$A.test.assert(actual, 'right should be aligned');
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
	        	setTimeout(function(){
	        		myPanel = panel;
	        	},5);
	        	
	        });	 	
	    }
	 },

	 // TODO(W-2853977): Tests flapping in Jenkins.
	 _testTopPad: {
	 	test: function(cmp) {
	 	    var that = this;
	 		var myPanel = null;
	 		var littleTarget = cmp.find('littleTarget').getElement();
	 		$A.createComponent("aura:unescapedHtml", {value: '<div class="panel-content">Woooooo</div>'}, function(body) {
	            that.makePanel({
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
                    setTimeout(function(){
                        myPanel = panel;
                    },5);
                    
                }); 
	 		});

	 		$A.test.addWaitFor(true, function() {
	 			return !!myPanel;
	 		}, function() {

	 			var p = myPanel.getElement();
	 			var t = cmp.find('littleTarget').getElement();

	 			var actual = Math.ceil(p.getBoundingClientRect().top) == Math.ceil(t.getBoundingClientRect().top + 5);
	 			$A.test.assert(actual, 'top should be padded by 5px');

	 			actual = Math.round(p.getBoundingClientRect().left) == Math.round(t.getBoundingClientRect().left);
	 			$A.test.assert(actual, 'left should be aligned');

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
                   setTimeout(function(){
                       myPanel = panel;
                   }, 5);
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