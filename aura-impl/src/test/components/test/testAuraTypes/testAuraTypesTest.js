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
    testAttributeValuesAtClientSideAreOfDeclaredDataType:{
        test:function(cmp){
            aura.test.assertEquals('number', typeof cmp.getAttributes().get('intName'), "Integer type attribute should be provided as a number");
            aura.test.assertEquals('number',  typeof cmp.getAttributes().get('longName'), "Long type attribute should be provided as a number");
            aura.test.assertEquals('number', typeof cmp.getAttributes().get('doubleName'), "Double type attribute should be provided as a number");
            aura.test.assertEquals('number', typeof cmp.getAttributes().get('decimalName'), "Decimal type attribute should be provided as a number");
            aura.test.assertEquals('boolean', typeof cmp.getAttributes().get('boolName'), "Boolean attribute should be provided as a boolean");
            aura.test.assertEquals('string', typeof cmp.getAttributes().get('stringName'), "String type attribute should be provided as a string");
            aura.test.assertEquals('string', typeof cmp.getAttributes().get('objectName'), "Object type attribute assigned a string value should be provided as a string");
            aura.test.assertEquals('object', typeof cmp.getAttributes().get('mapName'), "Map type attribute should be provided as a object");
            aura.test.assertEquals('object', typeof cmp.getAttributes().get('listName'), "List type attribute should be provided as a object");
            aura.test.assertEquals('object', typeof cmp.getAttributes().get('setName'), "Set type attribute should be provided as a object");
            var cmpAttribute = cmp.getAttributes().get('componentArrayName');
            aura.test.assertEquals('object', typeof cmpAttribute, "Aura Component array type attribute should be provided as a object");
            aura.test.assertEquals(1, cmpAttribute.length)
            aura.test.assertEquals('Component', cmpAttribute[0].auraType);
        }
    }
})
