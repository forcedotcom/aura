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
<aura:application template="auraStorageTest:componentDefStorageTemplate">
    <aura:attribute name="load" type="String" default="ui:scroller" description="Component to fetch or create"/>
    <aura:attribute name="status" type="String" default="" description="Last status message" />
    <aura:attribute name="log" type="String" default="" description="Log catcher" />
    <aura:attribute name="output" type="Aura.Component" description="Last created component" />

    <aura:method name="saveLog" action="c.saveLog" />
    <aura:method name="clearCachesAndLog" action="c.clearCachesAndLog" />
    <aura:method name="fetchCmp" action="c.fetchCmp" />
    <aura:method name="createComponentFromConfig" action="c.createComponentFromConfig" />
    <aura:method name="clearActionAndDefStorage" action="c.clearActionAndDefStorage" />
    <aura:method name="verifyDefsRestored" action="c.verifyDefsRestored" />

    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:handler event="auraStorage:modified" action="{!c.storageModified}"/>
    <aura:handler event="aura:initialized" action="{!c.initialized}"/>

    <div style="background: #ccc; padding: 10px; cursor: pointer">
        <ui:inputText value="{!v.load}" /> |
        <ui:button press="{!c.fetchCmp}" label="Fetch cmp" /> |
        <ui:button press="{!c.createComponentFromConfig}" label="$A.createComponentFromConfig" /> |
        <ui:button press="{!c.createComponent}" label="$A.createComponent" /> |
        <ui:button press="{!c.clearActionAndDefStorage}" label="Clear Caches" /> |
        <ui:button press="{!c.clearCachesAndLog}" label="Clear Caches + Log" /> |
        <ui:button press="{!c.saveLog}" label="Save Log" /> |
    </div>

    <div>Last status: {!v.status}</div>
    Output: <div class="border: 1px solid black;">{!v.output}</div>
    Log: <ui:inputTextArea value="{!v.log}" />
</aura:application>
