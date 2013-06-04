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

//Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
Mocks.GetMock(Object.Global(), "exp", function(){})(function(){
  //#import aura.AuraClientService
});

Function.RegisterNamespace("Test.Aura");
[Fixture]
Test.Aura.AuraClientServiceTest = function(){
    var mockOnLoadUtil = Mocks.GetMocks(Object.Global(),
	    { "$A": {
		ns :{
		    Util:{
			prototype:{
			    on:function(){}
			}
		    }
		}
	      },
	      "window": {
		  onbeforeunload: function(){}
	      },
	      "exp" : function(){}
	    });
    
    [Fixture]
    function EnqueueAction(){
	[Fact]
	function CallsSetExclusiveIfParamPassed(){
	    //Arrange
	    var expected = "Set Exclusive Called";
	    var target;
	    var actual;
	    
	    mockOnLoadUtil(function(){
		target = new AuraClientService();
	    });
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		assert : function(){},
		util : {isUndefined: function(){}, 
		    	isUndefinedOrNull: function(){}
		}
	    });
	    var action = {
		    setExclusive : function(param){
			actual = param;
		    },
		    getDef : function(){
			return {isClientAction:function(){return true;}};
		    },
		    run : function(){
			
		    },
		    auraType : "Action"
	    };
	    //Act
	    mockAuraUtil(function(){
		target.enqueueAction(action, undefined, expected);
	    });
	    //Assert
	    Assert.Equal(expected, actual);
	}
	
	[Fact]
	function DoesNotCallSetExclusiveIfParamUndefined(){
	    //Arrange
	    var target;
	    var actual = true;
	    
	    mockOnLoadUtil(function(){
		target = new AuraClientService();
	    });
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		assert : function(){},
		util : {isUndefined: function(){}, 
		    	isUndefinedOrNull: function(){}
		}
	    });
	    var action = {
		    setExclusive : function(param){
			actual = false;
		    },
		    getDef : function(){
			return {isClientAction:function(){return true;}};
		    },
		    run : function(){
			
		    },
		    auraType : "Action"
	    };
	    //Act
	    mockAuraUtil(function(){
		target.enqueueAction(action, undefined, undefined);
	    });
	    //Assert
	    Assert.True(actual);
	}
	
	[Fact]
	function ClientActionRunsImmediately(){
	    //Arrange
	    var target;
	    var actual = false;
	    
	    mockOnLoadUtil(function(){
		target = new AuraClientService();
	    });
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		assert : function(){},
		util : {isUndefined: function(){},
		    	isUndefinedOrNull: function(){}
		    }
	    });
	    var action = {
		    setExclusive : function(){},
		    getDef : function(){
			return {isClientAction:function(){return true;}};
		    },
		    run : function(){
			actual = true;
		    },
		    auraType : "Action"
	    };
	    //Act
	    mockAuraUtil(function(){
		target.enqueueAction(action, undefined, undefined);
	    });
	    //Assert
	    Assert.True(actual);
	}
	
	[Fact]
	function ServerActionsAreQueued(){
	    //Arrange
	    var target;
	    var ranImmediately = false;
	    
	    mockOnLoadUtil(function(){
		target = new AuraClientService();
	    });
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		assert : function(){},
		util : {isUndefined: function(){},
		    	isUndefinedOrNull: function(){}
		}
	    });
	    var action = {
		    setExclusive : function(){},
		    getDef : function(){
			return {isClientAction:function(){return false;}};
		    },
		    run : function(){
			ranImmediately = true;
		    },
		    auraType : "Action"
	    };
	    //Act
	    mockAuraUtil(function(){
		target.enqueueAction(action, undefined, undefined);
	    });
	    //Assert
	    Assert.False(ranImmediately);
	    Assert.Equal(1, target.priv.actionQueue.length);
	    Assert.Equal(action, target.priv.actionQueue[0]);
	}
	
	[Fact]
	function ThrowsIfActionParamIsUndefined(){
	    //Arrange
	    var expected = "EnqueueAction() cannot be called on an undefined or null action."
	    var actual;
	    mockOnLoadUtil(function(){
		target = new AuraClientService();
	    });
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		assert : function(condition, message){
		    if(!condition){
			var error = new Error(message);
			throw error;
		    }
		},
		util : {
		    	isUndefined: function(){},
		    	isUndefinedOrNull: function(obj){
		    	    return obj === undefined || obj === null;
		    	}
		}
	    });
	    //Act
	    mockAuraUtil(function(){
		actual = Record.Exception(function(){
		    	target.enqueueAction(undefined, undefined, undefined);
		    })
	    });
	    //Assert
	    Assert.Equal(expected, actual);
	}
	
	[Fact]
	function ThrowsIfActionParamIsNull(){
	    //Arrange
	    var expected = "EnqueueAction() cannot be called on an undefined or null action."
	    var actual;
	    mockOnLoadUtil(function(){
		target = new AuraClientService();
	    });
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		assert : function(condition, message){
		    if(!condition){
			var error = new Error(message);
			throw error;
		    }
		},
		util : {
		    	isUndefined: function(){},
		    	isUndefinedOrNull: function(obj){
		    	    return obj === undefined || obj === null;
		    	}
		}
	    });
	    //Act
	    mockAuraUtil(function(){
		actual = Record.Exception(function(){
		    	target.enqueueAction(null, undefined, undefined);
		    })
	    });
	    //Assert
	    Assert.Equal(expected, actual);
	}
	
	[Fact]
	function ThrowsIfFirstParamsAuraTypeIsNotAction(){
	    //Arrange
	    var expected = "Cannot call EnqueueAction() with a non Action parameter."
	    var actual;
	    mockOnLoadUtil(function(){
		target = new AuraClientService();
	    });
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		assert : function(condition, message){
		    if(!condition){
			var error = new Error(message);
			throw error;
		    }
		},
		util : {
		    	isUndefined: function(obj){
		    	    return obj === undefined;
		    	},
		    	isUndefinedOrNull: function(obj){
		    	    return obj === undefined || obj === null;
		    	}
		}
	    });
	    var action = {
		    auraType : "Component"
	    };
	    //Act
	    mockAuraUtil(function(){
		actual = Record.Exception(function(){
		    	target.enqueueAction(action, undefined, undefined);
		    })
	    });
	    //Assert
	    Assert.Equal(expected, actual);
	}
	
	[Fact]
	function ThrowsIfFirstParamIsNotRecognizedAuraType(){
	    //Arrange
	    var expected = "Cannot call EnqueueAction() with a non Action parameter."
	    var actual;
	    mockOnLoadUtil(function(){
		target = new AuraClientService();
	    });
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		assert : function(condition, message){
		    if(!condition){
			var error = new Error(message);
			throw error;
		    }
		},
		util : {
		    	isUndefined: function(obj){
		    	    return obj === undefined;
		    	},
		    	isUndefinedOrNull: function(obj){
		    	    return obj === undefined || obj === null;
		    	}
		}
	    });
	    var action = "FooBared";
	    //Act
	    mockAuraUtil(function(){
		actual = Record.Exception(function(){
		    	target.enqueueAction(action, undefined, undefined);
		    })
	    });
	    //Assert
	    Assert.Equal(expected, actual);
	}
	
	
    }
}