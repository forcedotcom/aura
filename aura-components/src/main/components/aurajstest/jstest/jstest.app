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
<aura:application access="GLOBAL" controller="java://org.auraframework.components.aurajstest.JSTestController">
    <aura:attribute name="descriptor" type="String" default="ui:button"/>
    <aura:attribute name="defType" type="String" default="COMPONENT"/>
    <aura:attribute name="test" type="String"/>
    
    <aura:attribute name="index" type="Integer" default="0"/>
    <aura:attribute name="testCases" type="List" default="" access="PRIVATE"/>
    <aura:attribute name="testSuiteCode" type="String" access="PRIVATE"/>
    
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    
    <aura:if isTrue="{!v.testCases.length}">
        <ui:tabset aura:id="tabs" class="jstestTabset">
            <aura:iteration items="{!v.testCases}" var="case">
                <aurajstest:jstestCase aura:id="test" name="{!case.name}" url="{!case.url}" done="{!c.testDone}"/>
            </aura:iteration>
        </ui:tabset>
    </aura:if>

    <section class="suiteCode">
        <h1 onclick="{!c.toggleCode}">Sources <sub>click or tap to view</sub></h1>
        <div><pre aura:id="test-suite-code" class="hidden">{!v.testSuiteCode}</pre></div>
    </section>
</aura:application>
