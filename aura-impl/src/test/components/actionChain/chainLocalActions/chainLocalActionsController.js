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
{
    handleClick:function(cmp){
        var multiply = cmp.get("c.multiply");
        multiply.setParams({
            "a" : 2
        });
        multiply.setCallback(cmp, function(action){
            $A.log(action.getReturnValue());//Should be 200
        });
        multiply.setChained();
        var subtract = cmp.get("c.subtract");
        subtract.setParams({
            "a" : 99
        });
        subtract.setCallback(cmp, function(action){
            $A.log(action.getReturnValue());//Should be 101
        });
        subtract.setChained();

        var add = cmp.get("c.add");
        add.setParams({
            "a" : 1,
            "b" : 99,
            "actions": $A.util.json.encode({
                actions: [multiply, subtract]
            })
        });
        add.setCallback(cmp, function(action){
            $A.log(action.getReturnValue());//Should be 100
        });
        this.runAfter(add);
    },

    callServerButPassNoChainedActions:function(cmp){
        var a = cmp.get("c.add");
        a.setCallback(cmp, function(action){
            $A.log(action.getError());
            $A.log(action.getReturnValue())
        });
        a.setParams({
            "a" : 1,
            "b" : 99,
            "action1" : null
        });
        this.runAfter(a);
    }
}
