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
<aura:application locationChangeEvent="layoutServiceTest:locChangeEvent"
                   controller="java://org.auraframework.impl.java.controller.JavaTestController">
  <aura:attribute name="wasLayoutHandlerCalled" type="Boolean" default="false"/>
  <aura:attribute name="wasBehaviorOverridden" type="Boolean" default="false"/>
  <aura:attribute name="hashparams" type="String" default="parameters passed with # token"/>
  <aura:attribute name="layoutFailedCount" type="Integer" default="0" />

  <aura:handler event="layoutServiceTest:testLayoutHandlerEvent" action="{!c.handleTestLayoutHandlerEvent}"/>
  <aura:handler event="aura:layoutFailed" action="{!c.handleLayoutFailedEvent}" />

  <div class="content" aura:id="content"></div>
  <div class="miscContent" aura:id="miscContent"> </div>

  wasLayoutHandlerCalled?<div class="wasLayoutHandlerCalled"><aura:renderIf isTrue="{!v.wasLayoutHandlerCalled}">Yes<aura:set attribute="else">No</aura:set></aura:renderIf></div>
  wasBehaviorOverridden?<div class="wasBehaviorOverridden"><aura:renderIf isTrue="{!v.wasBehaviorOverridden}">Yes<aura:set attribute="else">No</aura:set></aura:renderIf></div>

  <div>
    <ui:button press="{!c.selectLayout2WithDefaultAction}" aura:id="buttonWithDirectCallWithDefaultAction" class="buttonWithDirectCallWithDefaultAction" label="Change to layout2 with $layoutService.changeLocation() with default action" />
  </div>
  <div>
    <ui:button press="{!c.selectLayout2WithOverride}" aura:id="buttonWithDirectCallWithOverride" class="buttonWithDirectCallWithOverride" label="Change to layout2 with $layoutService.changeLocation() with override" />
  </div>
  <div>
    <ui:button press="{!c.selectLayout2WithSetWindowLocation}" aura:id="buttonWithSetWindowLocationLayout2" class="buttonWithSetWindowLocationLayout2" label="Change to layout2 with window.location" />
  </div>
  <div>
    <ui:button press="{!c.selectLayout1WithSetWindowLocation}" aura:id="buttonWithSetWindowLocationLayout1" class="buttonWithSetWindowLocationLayout1" label="Change to layout1 with window.location" />
  </div>
  <div>
    <ui:button press="{!c.selectDefaultLayoutWithSetWindowLocation}" aura:id="buttonWithSetWindowLocationDefaultLayout" class="buttonWithSetWindowLocationDefaultLayout" label="Change to default layout with window.location" />
  </div>

  <div>
    <ui:button press="{!c.selectLayout2WithParams}" aura:id="selectLayout2WithParams" class="selectLayout2WithParams" label="Change to layout2 with $layoutService.changeLocation() and some parameters" />
  </div>

    <aura:handler event="layoutServiceTest:locChangeEvent" action="{!c.locationCange}"/>
    Params?<div class="params">{!v.hashparams}</div>

</aura:application>
