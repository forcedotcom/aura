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
<aura:application>
    <div aura:id="ready" class="layout_t"/>
    <aura:handler event="aura:layoutChange" action="{!c.layoutDone}"/>
    <aura:handler event="aura:beforeLayoutChange" action="{!c.layoutChanging}"/>

    <ui:button press="{!c.forward}" label="Forward" aura:id='Forward_Button' class='Forward_Button' />
    <ui:button press="{!c.backward}" label="Back" aura:id='Back_Button' class='Back_Button' />
    <ui:button press="{!c.removeLayoutDone}" label="Remove Layout Done" aura:id='Remove_Layout_Done' class='Remove_Layout_Done' />

    <div  class="Button1" aura:id="Button1" />
    <div  class="Button2" aura:id="Button2" />
</aura:application>
