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
Function.RegisterNamespace("Test.Components.Ui.Scroller");

[Fixture]
Test.Components.Ui.Scroller.IndicatorsPluginTests=function(){

	var targetHelper,
		plugins,
		windowMock=Test.Mocks.NeededMocks.getWindowMock();
	
	windowMock(function(){
		ImportJson("ui.scroller.scrollerHelper",function(path,result){
			targetHelper=result;
		});
		plugins=targetHelper.getScrollerNamespace().plugins;
	});

	[Fixture]
	function AddIndicator(){

		[Fact]
		function CreatesAnIndicator(){

			var indicatorsPlugin,
				refreshMock,
				domStubAlias = Test.Stubs.Aura.Dom,
				expectedOpts = {
					disableTouch:false,
					disablePointer:false,
					disableMouse:false,
					interactive:true,
					resize:true,
					snap:true,
					scrollbars:true
				},
				actualOpts,
				scrollerWrapper = domStubAlias.GetNode({id:'scroller-wrapper'}, null, 
					[domStubAlias.GetNode({id:'indicator', style:{}})]),
				scroller = domStubAlias.GetNode({id:'scroller'},null,[domStubAlias.GetNode()]);

			windowMock(function(){
				indicatorsPlugin = new plugins.Indicators();
				indicatorsPlugin.wrapper = scrollerWrapper;
				scroller._indicators=[];

				indicatorsPlugin.addIndicator.apply(scroller, [scrollerWrapper,expectedOpts]);
				expectedOpts.el=scrollerWrapper;
				actualOpts = scroller._indicators[0].opts;
			});

			Assert.Equal(expectedOpts,actualOpts);
		}
	}

	[Fixture]
	function Position(){

		[Fact,Data({
			inputX:0, inputY:-100, scrollerX:0, scrollerY:-50, scrollVertical:true, expectedPoint:{x:0,y:0}
		},{
			inputX:-100, inputY:0, scrollerX:0, scrollerY:-50, scrollVertical:true, expectedPoint:{x:0,y:0}
		},{
			inputX:100, inputY:100, scrollerX:0, scrollerY:-50, scrollVertical:false, expectedPoint:{x:-1000,y:-50}
		})]
		function CallRAFwithXY(data){
			var indicatorsPlugin,
				refreshMock,
				domStubAlias = Test.Stubs.Aura.Dom,
				expectedOpts = {},
				actualPoint={x:0,y:0},
				scrollToMock,
				scrollerWrapper = domStubAlias.GetNode({id:'scroller-wrapper'}, null, 
					[domStubAlias.GetNode({id:'indicator', style:{}})]),
				scroller = domStubAlias.GetNode({id:'scroller'},[domStubAlias.GetNode()]);
				scroller.x = data.scrollerX;
				scroller.y = data.scrollerY;
				scroller.scrollVertical = data.scrollVertical;

			windowMock(function(){
				indicatorsPlugin = new plugins.Indicators();
				indicatorsPlugin.wrapper = scrollerWrapper;
				scroller._indicators=[];

				indicatorsPlugin.addIndicator.apply(scroller, [scrollerWrapper,expectedOpts]);
				expectedOpts.el=scrollerWrapper;

				scrollToMock=Mocks.GetMock(scroller,"scrollTo",function(x,y){
					actualPoint.x = x;
					actualPoint.y = y;
				});

				scrollToMock(function(){
					scroller._indicators[0]._pos(data.inputX,data.inputY);
				});
				
			});

			Assert.Equal(data.expectedPoint,actualPoint);
		}
	}
	
	[Fixture]
	function CurrentSizes(){

		[Fact,Data({
			scrollerX:10,
			scrollerY:20,
			scrollVertical:false,
			wrapperHeight:100,
			wrapperWidth:200,
      		expectedSize: { virtual:1, wrapperSize:200, maxScroll:10 }
		},{
			scrollerX:10,
			scrollerY:20,
			scrollVertical:true,
			wrapperHeight:10,
			wrapperWidth:20,
      		expectedSize: { virtual:1, wrapperSize:10, maxScroll:20 }
		})]
        function GetCurrentSizes(data){
			//Arrange
			 var indicatorsPlugin,
		     	 expectedOpts = {},
		     	 expectedSize = data.expectedSize,
		     	 domStubAlias = Test.Stubs.Aura.Dom,
		     	 actualSize,
		     	 indicator = {
		     	 	wrapperHeight:0,
		     	 	wrapperWidth:0
		     	 },
		     	scrollerWrapper = domStubAlias.GetNode({id:'scroller-wrapper'}, null, 
			 		[domStubAlias.GetNode({id:'indicator', style:{}})]),
			 	scroller = domStubAlias.GetNode({id:'scroller'},[domStubAlias.GetNode()]);
			 	scroller.maxScrollX = data.scrollerX;
			 	scroller.maxScrollY = data.scrollerY;
			 	scroller.scrollVertical = data.scrollVertical;

            	
		     windowMock(function(){
			 	indicatorsPlugin = new plugins.Indicators();
			 	indicatorsPlugin.wrapper = scrollerWrapper;
				scroller._indicators=[];
                
             	indicatorsPlugin.addIndicator.apply(scroller, [scrollerWrapper, expectedOpts]);
             	expectedOpts.el=scrollerWrapper;
                indicator = scroller._indicators[0];
                indicator.wrapperHeight = data.wrapperHeight;
				indicator.wrapperWidth = data.wrapperWidth;
			 });

	    	//Act
     		actualSize = indicator.getCurrentSizes();

     		//Assert
            Assert.Equal(expectedSize,actualSize);
		}
	}

	[Fixture]
	function VirtualScrollSize(){
		
		[Fact,Data({
			scrollerY:20,
			virtualSizeY:0,
			wrapperHeight:100,
      		expectedSize: 20
		},{
			scrollerY:20,
			virtualSizeY:200,
			wrapperHeight:100,
      		expectedSize: 200
		})]
		function GetVirtualScrollSize(data){
			//Arrange
			var indicatorsPlugin,
				expectedOpts = {},
		   	    expected = data.expectedSize,
		   	    domStubAlias = Test.Stubs.Aura.Dom,
		   	    actual,
                indicator = {
                	wrapperHeight:0,
                	virtualSizeY:0

                },
        		scrollerWrapper = domStubAlias.GetNode({id:'scroller-wrapper'}, null, 
					[domStubAlias.GetNode({id:'indicator', style:{}})]),
				scroller = domStubAlias.GetNode({id:'scroller'},[domStubAlias.GetNode()]);
            	scroller.maxScrollY = data.scrollerY;
            	scroller.scrollVertical = true;

			windowMock(function(){
				indicatorsPlugin = new plugins.Indicators();
				indicatorsPlugin.wrapper = scrollerWrapper;
				scroller._indicators=[];

            	indicatorsPlugin.addIndicator.apply(scroller, [scrollerWrapper, expectedOpts]);
            	expectedOpts.el=scrollerWrapper;
            	indicator = scroller._indicators[0];
                indicator.wrapperHeight = data.wrapperHeight;
                indicator.virtualSizeY = data.virtualSizeY;
			});

			//Act
			actual = scroller._indicators[0].getVirtualScrollSize();
           
			//Assert
			Assert.Equal(expected,actual);
		}
	}

	[Fixture]
	function VirtualMaxSize(){
		
		[Fact,Data({
			scrollerY:20,
			virtualSizeY:0,
			scrollSize:200,
			wrapperHeight:300,
      		expectedSize: 20
		},{
			scrollerY:-Infinity,
			virtualSizeY:0,
			scrollSize:200,
			wrapperHeight:300,
      		expectedSize: -200
		})]
		function GetVirtualMaxSize(data){
			//Arrange
			var indicatorsPlugin,
				expectedOpts = {},
		   	    expected = data.expectedSize,
		   	    domStubAlias = Test.Stubs.Aura.Dom,
		   	    actual,
                indicator = {
                	wrapperHeight:0,
                	virtualSizeY:0

                },
        		scrollerWrapper = domStubAlias.GetNode({id:'scroller-wrapper'}, null, 
					[domStubAlias.GetNode({id:'indicator', style:{}})]),
				scroller = domStubAlias.GetNode({id:'scroller'},[domStubAlias.GetNode()]);
            	scroller.maxScrollY = data.scrollerY;
            	scroller.scrollVertical = true;

			windowMock(function(){
				indicatorsPlugin = new plugins.Indicators();
				indicatorsPlugin.wrapper = scrollerWrapper;
				scroller._indicators=[];

            	indicatorsPlugin.addIndicator.apply(scroller, [scrollerWrapper, expectedOpts]);
            	expectedOpts.el = scrollerWrapper;
            	indicator = scroller._indicators[0];
                indicator.wrapperHeight = data.wrapperHeight;
                indicator.virtualSizeY = data.virtualSizeY;
			});

			//Act
			actual=scroller._indicators[0].getVirtualMaxSize(data.scrollSize);
           
			//Assert
			Assert.Equal(expected,actual);
		}
	}
}
