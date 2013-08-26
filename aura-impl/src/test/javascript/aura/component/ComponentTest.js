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
Function.RegisterNamespace("Test.Aura.Component");

[Fixture]
Test.Aura.Component.ComponentTest=function(){
	// Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
    Mocks.GetMock(Object.Global(), "exp", function(){})(function()
        {Mocks.GetMock(Object.Global(), "$A", function(){})(function(){
            $A.ns = {};
            // #import aura.component.Component
        });
    });
    
   
    [Fixture]
    function Index() {
    	//this cover when component is invalid
        [Fact]
        function ReturnsNullForInvalidComponent() {
            //Arrange
            var target = null;
            var mockPriv = Mocks.GetMock(Object.Global(), "ComponentPriv" , function(){});
            mockPriv(function(){
                target = new Component();
                target.assertValid = function(){return false};
            });
            //Act
            var actual = target.index(null,null);
            //Assert
            Assert.Null(actual);
        }
        //this cover when delegateValueProvider is not null
        [Fact]
        function ReturnsResultFromDelegateValueProvider() {
            //Arrange
            var localid = "testLocalId";
            var globalid = "testGlobalId";
            var expected = "id from delegateValueProvider";
            var actual = null;
            var mockPriv = Mocks.GetMocks(Object.Global(), {
                "ComponentPriv" : function(){}
            });
            var targetValueProvider={
                index:function(lid,gid){
                    if((lid==localid)&&(gid==globalid)) return expected;
                }
            };
            mockPriv(function(){
                target = new Component();
                target.assertValid = function(){return true};
                target.priv.delegateValueProvider = targetValueProvider;
            });
            //Act
            mockPriv(function(){ 
                actual = target.index(localid,globalid);
            });
            //Assert
            Assert.Equal(expected, actual);
        }
        
        //this cover when index[locaid] does not exist
        [Fact]
        function InitLocalIdWithGlobalId() {
            //Arrange
            var localid = "testLocalId";
            var globalid = "testGlobalId";
            var expected = globalid;
            var target = null;
            var actual=null;
            var mockPriv = Mocks.GetMock(Object.Global(), "ComponentPriv" , function(){});
            mockPriv(function(){
                target = new Component();
                target.assertValid = function(){return true};
                target.priv.index = null;
            });
            //Act
            target.index(localid,globalid);
            actual = target.priv.index[localid];
            //Assert
            Assert.Equal(expected, actual);
        }
        
        //this cover when index[locaid] exist but not an array
        [Fact]
        function AppendLocalIdWithGlobalId() {
            //Arrange
            var localid = "testLocalId";
            var globalid = "testGlobalId2";
            var original_globalid = "testGlobalId1";
            var expected = [original_globalid,globalid];
            var target = null;
            var actual=null;
            var mockPriv = Mocks.GetMocks(Object.Global(), {
                "$A" : {
                    util : {
                        isArray : function() {return false;}
                    }
                },
                "ComponentPriv" : function(){}
            });
            mockPriv(function(){
                target = new Component();
                target.assertValid = function(){return true};
                target.priv.index = [];
                target.priv.index[localid] = original_globalid;
            });
            //Act
            mockPriv(function(){ 
                target.index(localid,globalid);
                actual = target.priv.index[localid];
            });
            //Assert
            Assert.Equal(expected, actual);
        }
        
        //this cover when index[locaid] is already an array
        [Fact]
        function AppendLocalIdArrayWithGlobalId() {
            //Arrange
            var localid = "testLocalId";
            var globalid = "testGlobalId2";
            var original_globalid_array = ["testGlobalId1"];
            var expected = ["testGlobalId1",globalid];
            var target = null;
            var actual=null;
            var mockPriv = Mocks.GetMocks(Object.Global(), {
                "$A" : {
                    util : {
                        isArray : function() {return true;}
                    }
                },
                "ComponentPriv" : function(){}
            });
            mockPriv(function(){
                target = new Component();
                target.assertValid = function(){return true};
                target.priv.index = [];
                target.priv.index[localid] = original_globalid_array;
            });
            //Act
            mockPriv(function(){ 
            target.index(localid,globalid);
            actual = target.priv.index[localid];
            });
            //Assert
            Assert.Equal(expected, actual);
        }
    }//end of [Fixture] Index()
    
    [Fixture]
    function GetDef(){
        [Fact]
        function ReturnsNullForInvalidComponent(){
        	//Arrange
        	var target = null;
        	var mockPriv = Mocks.GetMock(Object.Global(), "ComponentPriv" , function(){});
        	mockPriv(function(){
        		target = new Component();
        		target.assertValid = function(){return false};
        	});
        	//Act
        	var actual = target.getDef();
        	//Assert
        	Assert.Null(actual);
        }

        [Fact]
        function ReturnsComponentDef(){
        	//Arrange
        	var expected = "Expected ComponentDef";
        	var target = null;
        	var mockPriv = Mocks.GetMock(Object.Global(), "ComponentPriv" , function(){});
        	mockPriv(function(){
              target = new Component();
              target.assertValid = function(){return true};
              target.priv.componentDef = expected;
              });
        	//Act
        	var actual = target.getDef();
        	//Assert
        	Assert.Equal(expected, actual);
        }
    }//end of [Fixture]function GetDef()
      
}
