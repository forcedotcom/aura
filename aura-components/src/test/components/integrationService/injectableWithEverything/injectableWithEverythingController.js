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
({
    handleClick : function(cmp) {
        var valueFromHelper = cmp.getDef().getHelper().returnAString();
        var a = cmp.get('c.getString');

        a.setCallback(cmp, function(a){
            $A.createComponent(
                "aura:text",
                {
                    value: a.getReturnValue()
                },
                function(newCmp){
                    var body = cmp.find('dataFromController').get('v.body');
                    body.push(newCmp);
                    cmp.find('dataFromController').set('v.body', body);
                }
            );
            $A.enqueueAction(a);
        });
    },
    showStyle: function(cmp) {
        var dfaElement = cmp.find('dataFromAttribute').getElement();
        cmp.set('v.dataFromAttributeStyle','call getCSSProperty');
        var dfaStyle = $A.util.style.getCSSProperty(dfaElement,'color');
        if(dfaStyle == undefined) {
            dfaStyle = 'get background return undefined!';
        }
        cmp.set('v.dataFromAttributeStyle',dfaStyle);
    }
});
