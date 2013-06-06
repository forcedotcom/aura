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
    setTopicPanelFacet : function(cmp, topic) {
        var config = {
                'componentDef' : 'markup://auradocs:topicPanel',
                'attributes' : {
                    'values' : {
                        'topic' : topic
                    }
                }};
       try {
           var topicPanel = $A.componentService.newComponentDeprecated(config, null, true, true);
           cmp.setValue('{!v.topicPanel}', [topicPanel]);
       } catch (e) {
           // Handle the catch-all scenario.
           if(topic !== 'welcome') {
               console.log("Got a non-existent topic. Falling back to the welcome topic");
               setTopicPanelFacet(cmp, 'welcome');
           } else {
               console.log("Unable to get the welcome topic.");
           }
       }
    }
});