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
<aura:application controller="java://org.auraframework.impl.java.controller.JavaTestController">
    <aura:attribute name="host" type="String" default=""/>
    <aura:attribute name="actionStatus" type="String" default=""/>
    <aura:attribute name="actionValue" type="String" default=""/>
    <aura:attribute name="eventsFired" type="String" default=""/>

    <aura:handler event="aura:connectionLost" action="{!c.logEvent}"/>
    <aura:handler event="aura:connectionResumed" action="{!c.logEvent}"/>
    <aura:handler event="aura:layoutChange" action="{!c.logEvent}"/>
    <aura:handler event="aura:layoutFailed" action="{!c.logEvent}"/>
    <aura:handler name="init" value="{!this}" action="{!c.setHost}"/>
    <aura:handler name="change" value="{!v.host}" action="{!c.setHost}"/>

    <ui:inputText aura:id="inputHost" value="{!v.host}"/>
    <ui:button aura:id="button" label="test connection" press="{!c.testConnection}"/><br/>
    <ui:outputUrl aura:id="defaultlink" label="default layout" value="#default"/><br/>
    <ui:outputUrl aura:id="actionlink" label="action layout" value="#action"/><br/>

    <ui:outputText value="{!'events fired: ' + v.eventsFired}"/><br/>
    <ui:outputText value="{!'action status: ' + v.actionStatus}"/><br/>
    <ui:outputText value="{!'action value: ' + v.actionValue}"/><br/>
    <div aura:id="container"/>
</aura:application>
