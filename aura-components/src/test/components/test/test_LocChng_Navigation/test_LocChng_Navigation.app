<!--

    Copyright (C) 2013 salesforce.com, inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<aura:application locationChangeEvent="test:test_LocChng_Event" >

    <ui:button label="click me" class="SimpleComponent" press="{!c.clientAction}"/>

    <!--One handler for location change events fired for this component-->
    <aura:handler event="test:test_LocChng_Event" action="{!c.locationChange}"/>

    <ui:button label="Back" class="Back" press="{!c.back}"/>
    <ui:button label="Next" class="Next" press="{!c.next}"/>
    <br/>

    <ui:outputText value="display" class="id" aura:id="display"/>
    <br/>

    <aura:attribute name="locationChangeIndicator" type="String" default="start"/>

    <ui:outputText value="{! 'Location change indicator:' + v.locationChangeIndicator}" class="{!v.locationChangeIndicator}"/>
</aura:application>
