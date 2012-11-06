<!--

    Copyright (C) 2012 salesforce.com, inc.

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
<aura:application locationChangeEvent="test:test_LocChng_Event2">
    <test:test_button label="click me (Button on Composite Component)" class="CompositeComponent" press="{!c.clientAction}" aura:id="compositeButton"/>

    <!--One handler for location change events fired for inner component(test:test_LocChng_SimpleComponent)-->
    <!--aura:handler event="test:test_LocChng_Event" action="{!c.innerClicked}"/-->

    <!--One handler for location change events fired for inner component-->
    <aura:handler event="test:test_LocChng_Event2" action="{!c.clicked}"/>
    <!--FIXME - apps can't be referenced like this<test:test_LocChng_SimpleComponent />-->
</aura:application>
