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
    /**
     * Test re-render behavior after reset iteration.
     * verify bug W-2528112
     */
    testRerenderWhileResettingIteration: {
        test: [function(cmp) {
            var target = cmp.find('innerCmp')[0];

            // make dirty
            cmp.set('v.data.elements[0].changes[0].newValue', 'test new value');
            cmp.set('v.innerClassName', 'bar');

            // invalidate the first inner iteration
            target.destroy();

            $A.test.assertFalse(target.isValid());
            $A.test.assertEquals(1, cmp.find('innerCmp').length, "there should only be one inner iteration after the other is destroyed.")
        }, function(cmp) {
            var newData = [
                {"changes": [ 
                    {
                        "fieldName": "New Description",
                        "newValue": "Old America",
                        "oldValue": "New America"
                    }
                ]},
                {"changes": [
                    {
                       "fieldName": "New Name",
                       "newValue": null,
                        "oldValue": "Blah Blah Blah"
                    },
                    {
                        "fieldName": "New Revenue",
                        "newValue": "$500,000,000.00",
                        "oldValue": null
                    }
                ]}
            ];

            cmp.set('v.data.elements', newData);
        }, function(cmp) {
            var target = cmp.render();
            $A.test.assertEquals(2, target.length, "there should be two inner iteration after reset.");
        }]
    }
})
