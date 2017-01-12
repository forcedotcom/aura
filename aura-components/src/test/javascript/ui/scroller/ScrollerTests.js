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
Test.Components.Ui.Scroller.ScrollerTest=function(){

	var targetHelper,
		scrollerNS,
		windowMock=Test.Mocks.NeededMocks.getWindowMock();
	
	windowMock(function(){
		var callback = function (path, fn) {fn();};
		ImportJson("aura-components/src/main/components/ui/scrollerLib/bootstrap.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/browserSupport.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/browserStyles.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/helpers.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/CubicBezier.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/ScrollerJS.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/EndlessPlugin.js", callback);

		ImportJson("aura-components/src/main/components/ui/scroller/scrollerHelper.js",function(path,result){
			targetHelper=result;
		});
		scrollerNS=targetHelper.getScrollerNamespace();
	});

	function match(expected,actual){
		//match key in expected
		for(var key in expected){
			if (expected.hasOwnProperty(key)) {
				//with key in scroller instance
				if(key in actual){
					var v1=actual[key],
						v2=expected[key];
			       if(!(v1===v2)){
			           Assert.Fail(key+":"+expected[key]+" does not equal "+key+":"+actual[key]);
			       }
			    }
			    else{
			    	Assert.Fail("Key not found. Key:"+key);
			    }
			}  
		}
		Assert.True(true);
	}


	[Fixture]
	function InitializeScroller(){

		function getScrollerInstance(scrollerOptions){
			var scrollerInstance,
				nodeAlias=Stubs.Dom,

				childNode=nodeAlias.GetNode(
				{
					id:"scroller",
					classList:{
						add:function(token){}
					}
				},
				null,
				[nodeAlias.GetNode()]),

				wrapper=nodeAlias.GetNode(
				{	
					id:"wrapper",
					classList:{
						add:function(token){}
					}
				},
				null,
				[childNode]);
			
			windowMock(function(){
			 	scrollerInstance=new window.Scroller(wrapper, scrollerOptions);	
	    	});

			return scrollerInstance;

		}

		[Fact]
		function AttachesCorrectlyToDOM(){
			var expected={
				scrollerId:"scroller",
				parentId:"wrapper"
			},
			scrollerInstance=getScrollerInstance();

			Assert.True(
				(scrollerInstance.scroller.id===expected.scrollerId)
				&&
				(scrollerInstance.scroller.parentNode.id===expected.parentId)
			);
		}
	

		[Fact]
		function EndlessHorizontalScroll(){
			var expected={
				enabled:true,
				endless:true,
				scroll:"horizontal",
				scrollVertical:false
			},
			scrollerOptions={
				plugins:['Endless'],
				scroll:'horizontal'
			},
			scroller=getScrollerInstance(scrollerOptions);

			match(expected,scroller);
		}

		[Fact]
		function EndlessScrollWithGpuOptimization(){

			var expected={
				enabled:true,
				endless:true,
				scroll:"vertical",
				scrollVertical:true
			},
			scrollerOptions={
				itemSelector    : 'article.mam',
			    disableMouse    : false,
			    infiniteLoading : false,
			    pullToRefresh   : false,
			    pullToLoadMore  : false,
			    gpuOptimization : true,
			    plugins: ['Endless']
			},
			scroller=getScrollerInstance(scrollerOptions);

			match(expected,scroller);
		}

		[Fact]
		function EitherGpuOptimizationOrCssTransition(){

			var expected={},
			scrollerOptions={
			    gpuOptimization : true,
			    useCSSTransition:true
			},
			scroller=getScrollerInstance(scrollerOptions);

			Assert.Undefined(scroller.surfacesPositioned);
		}

		[Fact]
		function ScrollerNoOpts(){

			var expected={},
				scroller=getScrollerInstance();

			Assert.True(scroller.scroll==='vertical');
		}

		// 
		// function ScrollerNoWrapper(){
		// 	var actualException,
		// 		expectedException='some exception';

		// 	windowMock(function(){
		// 		actualException=Record.Exception(function(){
		// 			new window.Scroller();
		// 		});
		// 	});

		// 	Assert.Equal(expectedException,actualException);
		// }
        
        [Fixture]
        function TestScrollerMathsAndCalculations(){
        	[Fact,Data({
				current:10,
				start:5,
				time:5,
				expected:1
			},{
				current:10,
				start:10,
				time:5,
				expected:0
			})]
			function GetVelocity(data){
				//Arrange
				var current=data.current,
				    start=data.start,
				    time=data.time,
				    expected=data.expected,
				    scroller=getScrollerInstance({debounce: false}),
				    actual;
			
				//Act
				actual=scroller._getVelocity(current,start,time);
			
				//Assert
				Assert.Equal(expected,actual);
			}
        
	        [Fact,Data({
				velocity:0.5,
				current:100,
				destination:350,
				time:1000
			},{
				velocity:-0.5,
				current:100,
				destination:-150,
				time:1000
			})]
			function ComputeMomentum(data){
				//Arrange
				var velocity=data.velocity,
				    current=data.current,
				    expected={
					    destination:data.destination,
					    time:data.time
				    },
				    scroller=getScrollerInstance({debounce: false}),
				    actual;
				
				//Act
				actual=scroller._computeMomentum(velocity,current);
				
				//Assert
				Assert.Equal(expected,actual);	
	        }

			 [Fact,Data({
				start:100,
				end:200,
				velocity:5,
				current:120,
				destination:162.5,
				time:8.5
			},{
				start:100,
				end:100,
				velocity:5,
				current:120,
				destination:131.25,
				time:2.25
			})]
			function ComputeSnap(data){
				//Arrange
	            var start=data.start,
	                end=data.end,
	                velocity=data.velocity,
	                current=data.current,
	                expected={
					    destination:data.destination,
					    time:data.time
				    },
				    scroller=getScrollerInstance(),
				    actual;
	
	            //Act
				actual=scroller._computeSnap(start,end,velocity,current);
	
				//Assert
				Assert.Equal(expected,actual);
			}
			
			
			[Fact,Data({
				current:120,
				start:100,
				duration:5,
				lowerMargin:100,
				wrapperSize:10,
				destination:2.5,
				time:29.375,
				bounce:'cubic-bezier(0.33, 0.33, 0.66, 0.81)'
			},{
				current:120,
				start:10,
				duration:5,
				lowerMargin:10,
				wrapperSize:10,
				destination:13.75,
				time:4.829545454545454,
				bounce:'cubic-bezier(0.33, 0.33, 0.66, 0.81)'
			})]
			function Momentum(data){
				//Arrange
				var current=data.current,
				    start=data.start,
				    duration=data.duration,
				    lowerMargin=data.lowerMargin,
				    wrapperSize=data.wrapperSize,
				    expected={
					    destination:data.destination,
					    time:data.time,
					    bounce:data.bounce
				    },
				    scroller=getScrollerInstance({debounce: false}),
				    actual;
				
				//Act
				actual=scroller._momentum(current,start,duration,lowerMargin,wrapperSize);
				
				//Assert
				Assert.True((expected.destination===actual.destination) && (expected.time===actual.time) && (expected.bounce===actual.bounce.fn.toString()));
			}
        }
	}
}