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
    doCopy: function(cmp) {
      $A.log('Copy Event Fired');
      cmp.getValue("v.copyEventFired").setValue(true);
      cmp.find("outputStatus").getAttributes().setValue("value", "Copy Event Fired");
    },
    doCut: function(cmp) {
        $A.log('Cut Event Fired');
        cmp.getValue("v.cutEventFired").setValue(true);
        cmp.find("outputStatus").getAttributes().setValue("value", "Cut Event Fired");
      },
    doPaste: function(cmp) {
        $A.log('Paste Event Fired');
        cmp.getValue("v.pasteEventFired").setValue(true);
        cmp.find("outputStatus").getAttributes().setValue("value", "Paste Event Fired");
    },
})
