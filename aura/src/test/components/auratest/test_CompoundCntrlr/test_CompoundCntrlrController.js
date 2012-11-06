/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    similarActionNames: function(cmp, event) {
        var button = event.getSource();
        button.getAttributes().setValue("label", 'clientAction1'+apexActionReturnValue);
        $A.rerender(button);
        /*Once we have the capability to run Client actions and Server actions which have same name, invoke the server action and
         * change the test to verify that the label on the button is clientActionserverAction
        var a = $A.expressionService.getValue(cmp, "{!c.similarActionNames}");
        a.setCallback(cmp, function(action) {
            var apexActionReturnValue = action.getReturnValue();
            button.getAttributes().setValue("label", 'clientAction'+apexActionReturnValue);
            $A.rerender(button);
        });
        this.runAfter(a);;*/
    },
    dissimilarActionNames: function(cmp, event) {
        var button = event.getSource();
        $A.rerender(cmp);
        var a = $A.expressionService.get(cmp, "c.similarActionNames");
        a.setCallback(cmp, function(action) {
            var apexActionReturnValue = action.getReturnValue();
            button.getAttributes().setValue("label", 'clientAction2'+apexActionReturnValue);
            $A.rerender(button);
        });
        this.runAfter(a);
    },
    anotherActionName: function(cmp, event) {
        var button = event.getSource();
        $A.rerender(cmp);
        var a = $A.expressionService.get(cmp, "c.serverAction");
        a.setCallback(cmp, function(action) {
            var apexActionReturnValue = action.getReturnValue();
            button.getAttributes().setValue("label", 'clientAction3'+apexActionReturnValue);
            $A.rerender(button);
        });
        this.runAfter(a);
    }
}
