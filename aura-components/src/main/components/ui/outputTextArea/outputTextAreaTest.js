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
    /**
     * Verify the elements used to display a textArea.
     * Changing the element type would affect styling of third party apps.
     */
    testHtmlElementOfOutputTextArea:{
        attributes:{value : 'Salesforce.com, ....some literature about the company.'},
        test:function(cmp){
            var span = cmp.find('span');
            //Make sure a span tag is used for outputTextArea. Failure might mean breaking styling of third party app
            aura.test.assertEquals('SPAN', span.getElement().tagName, "OutputTextArea is expected to use a span tag to display value.");
            aura.test.assertEquals('Salesforce.com, ....some literature about the company.', span.getElement().textContent);
        }
    },
    /**
     * verify that empty string value will end up as empty span.
     */
    testEmptyStringAsValue:{
        attributes:{value : ''},
        test:function(cmp){
            var span = cmp.find('span');
            aura.test.assertNotNull(span);
            aura.test.assertEquals('', span.getElement().textContent);
        }
    }
})
