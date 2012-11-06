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
<aura:application render="client" preload="preloadTest" controller="java://org.auraframework.impl.java.controller.TestControllerToAttachEvents">
    <aura:handler event="handleEventTest:applicationEvent" action="{!c.handleApplicationEvent}"/>
    <ui:button label="Run action to attach single event at server" press="{!c.attachOneEvent}"/>

    <aura:handler event="preloadTest:applicationEvent" action="{!c.preloadedEventDef}"/>
    <aura:handler event="test:applicationEvent" action="{!c.newEventDef}"/>
    <ui:button label="Run action to attach multiple events at server" press="{!c.attachMultipleEvents}"/>
    
    <aura:handler event="handleEventTest:dupEvent" action="{!c.handleDupEvent}"/>
    <ui:button label="Run action to attach duplicate events at server" press="{!c.attachDupEvent}"/>
    
    <aura:handler event="handleEventTest:chainEvent" action="{!c.handleChainEvent}"/>
    <ui:button label="Run action to simulate event chain." press="{!c.attachEventChain}"/>
    
    <!--For demonstration only -->
    <ui:button label="You spin my head right round (Click me and I will keep spinning)" press="{!c.infiniteEventCycle}"/>
    <aura:handler event="handleEventTest:cyclicEvent" action="{!c.causeInfiniteEvenLoop}"/>
    <p/>
    Events handled:<div aura:id="events"/>
    Action Responses: <div aura:id="response"/>
</aura:application>