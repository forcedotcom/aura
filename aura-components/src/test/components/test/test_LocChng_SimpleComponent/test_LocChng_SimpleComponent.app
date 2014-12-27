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
<aura:application locationChangeEvent="test:test_LocChng_Event">

    <test:test_button label="click me (Button on Simple Component)" class="SimpleComponent" press="{!c.clientAction}" aura:id="button"/>

    <!--One handler for location change events fired for this component-->
    <aura:handler event="test:test_LocChng_Event" action="{!c.locationChange}"/>

    <!--Another handler for location change events fired by the parent component which would include this -->
    <aura:handler event="test:test_LocChng_Event2" action="{!c.locationChangeComposite}"/>

    <!--Will this handler be called for the Base event type-->
    <aura:handler event="aura:locationChange" action="{!c.locationChangeGeneric}"/>

</aura:application>
