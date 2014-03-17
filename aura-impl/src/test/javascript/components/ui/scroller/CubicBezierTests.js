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
Test.Components.Ui.Scroller.CubicBezier=function(){
	
	var targetHelper,
		scrollerNS,
		windowMock=Test.Mocks.NeededMocks.getWindowMock();

	windowMock(function(){
		ImportJson("ui.scroller.scrollerHelper",function(path,result){
			targetHelper=result;
		});
		scrollerNS = targetHelper.getScrollerNamespace();
	});
	
	
	/* we are ok with half a pixel discrepancy */
	var acceptableDelta=0.5

	/* Bezier Curve formulae */
	var Formulae={
		coord:function (a,b) {
			var x,y; 
		  	if(!a) x=0;
		  	if(!b) y=0;
		  	return {x: a, y: b};
		},
		/* reversing these equations i.e. B4->B1, B3->B2, B2->B3, B1->B4
		 * will plot (Xn,Yn) first, and not (Xo,Yo) 
		 */
 		B1:function(t) { return (1-t)*(1-t)*(1-t); },
 		B2:function(t) { return 3*t*(1-t)*(1-t); },
 		B3:function(t) { return 3*t*t*(1-t); },
 		B4:function(t) { return t*t*t; },
		getBezier:function(percentTime,C1,C2,C3,C4) {
  			var pos = new Formulae.coord();
  			pos.x = C1.x*Formulae.B1(percentTime) + 
  					C2.x*Formulae.B2(percentTime) + 
  					C3.x*Formulae.B3(percentTime) + 
  					C4.x*Formulae.B4(percentTime);
  			pos.y = C1.y*Formulae.B1(percentTime) + 
  					C2.y*Formulae.B2(percentTime) + 
  					C3.y*Formulae.B3(percentTime) + 
  					C4.y*Formulae.B4(percentTime);
  			return pos;
		}
	};

	/* returns Y axis values from Bezier formulae */
	function GetYFromFormulae(timeDifferential, cX1,cY1,cX2,cY2){
		var P1,P2,P3,P4,Y_values=[];
		P1=Formulae.coord(0,0);
		P2=Formulae.coord(cX1,cY1);
		P3=Formulae.coord(cX2,cY2);
		P4=Formulae.coord(1,1);

		for(var i=0,j=timeDifferential.length; i<j; i++){
			Y_values[i]=Formulae.getBezier(timeDifferential[i],P1,P2,P3,P4).y;
		}

		return Y_values;
	};

	/* allows us to compare two arrays with an acceptable delta */
	function AssertArraysApproximatelyEqual(message,param1,param2){
		var value,length=(param1 && param2) ? (param1.length+param2.length):0;
		
		if(length && !(length%2)){
			for(var i=0,j=length/2; i<j; i++){
				value=Math.abs(param1[i]-param2[i]);
				if(!((value >= 0) && (value <= acceptableDelta))){
					Assert.Fail(message + " CubicBezier curve has deviated more than acceptableDelta="+acceptableDelta+"  found:"+value);
				}
			}
			Assert.True(true);
		}
		else{
			Assert.Fail("Either arrays are empty or null or undefined or falsy or do not have the same size!");
		}

	}

	/* returns a time array split equally based on interval */
	function GetTimeDifferential(totalTimeInMs,interval){
		var t=1,i=0,time=[];
		while(t<totalTimeInMs){
		 t=interval*(i+1);
		 time[i]=(t/1000);
		 i++;
		}
		return time;
	}



	[Fixture]
	function EASING_REGULAR(){

		var timeDifferential=GetTimeDifferential(600,16);

		[Fact]
		function SatisfiesCubicBezierEquations(){
			//Arrange
			var Y_values_expected=GetYFromFormulae(timeDifferential,0.33,0.66,0.66,1);
			var Y_values_actual=[];
			var CubicBezierEasingRegular;
			windowMock(function(){
				CubicBezierEasingRegular=scrollerNS.CubicBezier(0.33, 0.66, 0.66, 1);
			});

			//Act
			for(var i=0,j=timeDifferential.length; i<j; i++){
				Y_values_actual[i]=CubicBezierEasingRegular(timeDifferential[i]);
			}

			//Assert
			AssertArraysApproximatelyEqual("Easing regular:",Y_values_expected,Y_values_actual);

		}
	}

	[Fixture]
	function EASING_BOUNCE(){

		var timeDifferential=GetTimeDifferential(300,16);

		[Fact]
		function SatisfiesCubicBezierEquations(){
			//Arrange
			var Y_values_expected=GetYFromFormulae(timeDifferential,0.33,0.33,0.66,0.81);
			var Y_values_actual=[];
			var CubicBezierEasingBounce;
			windowMock(function(){
				CubicBezierEasingBounce=scrollerNS.CubicBezier(0.33, 0.33, 0.66, 0.81);
			});

			//Act
			for(var i=0,j=timeDifferential.length; i<j; i++){
				Y_values_actual[i]=CubicBezierEasingBounce(timeDifferential[i]);
			}

			//Assert
			AssertArraysApproximatelyEqual("Easing bounce:",Y_values_expected,Y_values_actual);

		}
	}

}
