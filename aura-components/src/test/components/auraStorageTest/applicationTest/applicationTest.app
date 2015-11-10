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
<aura:application template="auraStorageTest:indexedDBtemplate">
    <aura:attribute name="status" type="String" default="Waiting" />
    <aura:attribute name="refreshed" type="String" default="NO" />
    <aura:attribute name="actionComplete" type="Boolean" default="false"/>

    <aura:import library="auraStorageTest:iframeTestLib" property="lib" />
 
    <aura:handler event="aura:applicationRefreshed" action="{!c.handleRefreshed}"/>
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>

    <aura:method name="addToStorage" action="c.addToStorage"/>
    <aura:method name="clearStoredAction" action="c.clearStoredAction"/>

    <div aura:id="iframeContainer" />

    Status: <span aura:id="status">{!v.status}</span><br/>
    Refreshed: <span aura:id="refreshed">{!v.refreshed}</span><br/>
    Action Complete: <span aura:id="actionComplete">{!v.actionComplete}</span><br/>
</aura:application>