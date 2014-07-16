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

Function.RegisterNamespace("Test.Components.Ui.asyncComponentManager");

[Fixture]
Test.Components.Ui.asyncComponentManager.asyncComponentManagerHelperTest=function(){
    var targetHelper=null;
    ImportJson("ui.asyncComponentManager.asyncComponentManagerHelper", function(path, result){
        targetHelper = result;
    });

    [Fixture]
    function asyncLoadComponents(){
	/*
      [Fact]
        function testLoadComponent(){
            var asyncComponent = {
                getGlobalId: function() {
                	return "globalId";
                },
                get: function(expression) {
                	return {
                		fire: function() {}
                	};
                }
            };
            var targetComponent = Stubs.Aura.GetComponent({
                "v.maxConcurrency":1
            });
            targetComponent._registeredComponents =[asyncComponent];
            targetComponent._numOfLoadingComponents = 0;
            
            targetHelper.loadComponents(targetComponent);
            Assert.Equal(0, targetComponent._registeredComponents.length);
            Assert.Equal(1, targetComponent._numOfLoadingComponents);
        }

        [Fact]
        function testLoadComponentMaxConcurrency(){
        	var asyncComponent1 = {
                getGlobalId: function() {
                	return "globalId1";
                }
            };

            var targetComponent = Stubs.Aura.GetComponent({
                "v.maxConcurrency":1
            });
            targetComponent._registeredComponents =[asyncComponent1];
            targetComponent._numOfLoadingComponents = 1;
            
            targetHelper.loadComponents(targetComponent);

            Assert.Equal(asyncComponent1, targetComponent._registeredComponents[0]);
            Assert.Equal(1, targetComponent._numOfLoadingComponents);
        }
        */
    }
}
