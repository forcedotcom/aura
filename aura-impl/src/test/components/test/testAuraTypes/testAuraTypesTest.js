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
            aura.test.assertEquals('number', typeof cmp.get('v.intName'), "Integer type attribute should be provided as a number");
            aura.test.assertEquals('number',  typeof cmp.get('v.longName'), "Long type attribute should be provided as a number");
            aura.test.assertEquals('number', typeof cmp.get('v.doubleName'), "Double type attribute should be provided as a number");
            aura.test.assertEquals('number', typeof cmp.get('v.decimalName'), "Decimal type attribute should be provided as a number");
            aura.test.assertEquals('boolean', typeof cmp.get('v.boolName'), "Boolean attribute should be provided as a boolean");
            aura.test.assertEquals('string', typeof cmp.get('v.stringName'), "String type attribute should be provided as a string");
            aura.test.assertEquals('string', typeof cmp.get('v.objectName'), "Object type attribute assigned a string value should be provided as a string");
            aura.test.assertEquals('object', typeof cmp.get('v.mapName'), "Map type attribute should be provided as a object");
            aura.test.assertEquals('object', typeof cmp.get('v.listName'), "List type attribute should be provided as a object");
            aura.test.assertEquals('object', typeof cmp.get('v.setName'), "Set type attribute should be provided as a object");
            var cmpAttribute = cmp.get('v.componentArrayName');
            aura.test.assertEquals('object', typeof cmpAttribute, "Aura Component array type attribute should be provided as a object");
            aura.test.assertEquals(1, cmpAttribute.length)
            aura.test.assertEquals('Component', cmpAttribute[0].auraType);
        }
    }
})
