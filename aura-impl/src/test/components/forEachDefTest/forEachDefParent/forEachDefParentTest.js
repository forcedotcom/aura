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
({
    verifyValues:function(toplevelCmp, propertyOntopCmp, localIdOfCmpInForEach, itemCount, propertyOnInnerCmp, localIdOfInnerCmp ){
        var valuesAtTopLevelValue = toplevelCmp.getValue(propertyOntopCmp);
        var valuesAtTopLevel = valuesAtTopLevelValue.unwrap();
        aura.test.assertEquals(itemCount, valuesAtTopLevelValue.getLength());
        aura.test.assertEquals(itemCount, valuesAtTopLevel.length);

        var innerCmps = toplevelCmp.find('basicDataType').find(localIdOfCmpInForEach);
        aura.test.assertEquals(itemCount, innerCmps.length);
        for(var i=0; i<itemCount;i++){
            var  stringValueAtInnerCmp = innerCmps[i].getValue(propertyOnInnerCmp).getValue();
            aura.test.assertEquals(valuesAtTopLevel[i], stringValueAtInnerCmp);
            aura.test.assertEquals(''+valuesAtTopLevel[i], innerCmps[i].find(localIdOfInnerCmp).getElement().textContent);
        }
    },
    testIterationOfStringList:{
        test:function(cmp){
            this.verifyValues(cmp, 'm.stringList', 'stringValueByRef', 3, 'v.string' , 'string')
        }
    },
    testIterationOfNumberList:{
        test:function(cmp){
            this.verifyValues(cmp, 'm.integerList', 'numberValueByRef', 3, 'v.number' , 'number')
        }
    },
    testIterationOfBooleanList:{
        test:function(cmp){
            this.verifyValues(cmp, 'm.booleanList', 'booleanValueByRef', 3, 'v.bool' , 'bool')
        }
    }
})
