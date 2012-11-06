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
    testVerifyModelIsValueObject:{
        test:function(component){
            var model = component.getModel();
            aura.test.assertTrue(model === undefined, 'Model should not exist');
        }
    },
    testVerifySettingValuesOnModel:{
        test: function(component){
            var model = component.getModel();
            //The dummy model should have the same function that a true model has. See Model.js
            //FIXME - you cannot set a value on a model that was not predefined.
            /*model.getValue('string').setValue('DummyModel');
            aura.test.assertTrue(model.getValue('string').auraType ==='Value', 'Model not stored as a Value object');
            aura.test.assertEquals(model.getValue('string').getValue(),'DummyModel', 'Setting value on a model failed');*/
        }
    }
}
)
