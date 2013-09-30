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
	
	[Fixture]
    function press(){
    	[Fact]
		function ButtonIsDisabled(){
			// Arrange
			var mockedComponent={
				getAttributes : function(){
					return {
						getValue : function(attributeName){
                            if(attributeName == "disabled"){
                                return {
                                    getBooleanValue : function(){
                                        return true;
                                    }
                                }
                            } else if(attributeName == "stopPropagation"){
                                return {
                                    getBooleanValue : function(){
                                        return false;
                                    }
                                }
                            }
						}
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
			var mockedEvent={
				preventDefault : function(){
					actual = true;
				}
			}
			var actual=false;
			
			// Act
			targetController.press(mockedComponent, mockedEvent);
			
			// Assert
			Assert.True(actual);
		}
		
		[Fact]
		function ButtonIsEnabled(){
			// Arrange
			var mockedComponent={
				getAttributes : function(){
					return {
						getValue : function(attributeName){
							if(attributeName == "disabled"){
								return {
									getBooleanValue : function(){
										return false;
									}
								}
							} else if(attributeName == "stopPropagation"){
                                return {
                                    getBooleanValue : function(){
                                        return false;
                                    }
                                }
                            }
						}
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
			var mockedEvent={
				preventDefault : function(){}
			}
			var actual=false;
			
			// Act
			targetController.press(mockedComponent, mockedEvent);
			
			// Assert
			Assert.True(actual);
		}
    }
}