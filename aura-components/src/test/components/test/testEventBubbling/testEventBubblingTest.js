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
  
    testEventBubbling: {
        test: function (cmp) {
            var outEmitter = cmp.find('outEmitter'),
                button     = outEmitter.find('button'),
                element    = button.getElement();

            $A.test.clickOrTouch(element);
            $A.test.assertTrue(cmp.get('v.bubble'));
        }
    },

    testIterationEventBubbling: {
        test: function (cmp) {
            var outEmitter = cmp.find('iterEmitter')[0],
                button     = outEmitter.find('button'),
                element    = button.getElement();

            $A.test.clickOrTouch(element);
            $A.test.assertTrue(cmp.get('v.bubble'));
        }
    },
    testStopPropagation: {
        test: function (cmp) {

            var receiver   = cmp.find('receiver'),
                outEmitter = receiver.find('outEmitter'),
                button     = outEmitter.find('button'),
                element    = button.getElement();

            $A.test.clickOrTouch(element);
            $A.test.assertFalse(cmp.get('v.bubble'));
            $A.test.assertTrue(receiver.get('v.bubble'));
        }
    }
})
