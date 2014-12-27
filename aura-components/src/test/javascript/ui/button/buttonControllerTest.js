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

Function.RegisterNamespace("Test.Components.Ui.Button");

[Fixture]
Test.Components.Ui.Button.ButtonControllerTest=function(){
	var targetController = null;

	ImportJson("ui.button.buttonController",function(path,result){
		targetController=result;
	});

    var mockAura=Mocks.GetMock(Object.Global(),"$A",{
        util:{
            getBooleanValue:function(value){
                return value;
            }
        }
    });

	[Fixture]
    function press(){
    	[Fact]
		function ButtonIsDisabled(){
			// Arrange
			var stubComponent={
                get: function(attributeName){
                    if(attributeName == "v.disabled"){
                        return true;
                    } else if(attributeName == "v.stopPropagation"){
                        return false;
                    }
				},
				getEvent : function(){
					return {
						setParams : function(params){},
						fire : function(){
							actual = false;
						}
					}
				}
			};
			var stubEvent={
				preventDefault : function(){
					actual = true;
				}
			}
			var actual=false;

			// Act
			mockAura(function(){
                targetController.press(stubComponent, stubEvent);
            });

			// Assert
			Assert.True(actual);
		}

		[Fact]
		function ButtonIsEnabled(){
			// Arrange
			var stubComponent={
				get : function(attributeName){
                    if(attributeName == "v.disabled"){
                        return false;
                    } else if(attributeName == "v.stopPropagation"){
                        return false;
                    }
                },
				getEvent : function(){
					return {
						setParams : function(params){},
						fire : function(){
							actual = true;
						}
					}
				}
			};
			var stubEvent={
				preventDefault : function(){}
			}
			var actual=false;

			// Act
			mockAura(function(){
                targetController.press(stubComponent, stubEvent);
            });

			// Assert
			Assert.True(actual);
		}
    }
}