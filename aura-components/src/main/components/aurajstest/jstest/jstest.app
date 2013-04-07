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
<aura:application model="java://org.auraframework.components.aurajstest.JSTestModel">
    <aura:if isTrue="{!m.isHybrid}">
        <script src="/auraFW/resources/hybridcontainer1.5/cordova-2.3.0.js"></script>
    </aura:if>
    <aura:attribute name="descriptor" type="String" default="ui:button"/>
    <aura:attribute name="defType" type="String" default="COMPONENT"/>
    <aura:attribute name="index" type="Integer" default="0"/>
    <aura:attribute name="test" type="String"/>
    <ui:tabset aura:id="tabs">
        <aura:forEach items="{!m.testCases}" var="case">
            <aurajstest:jstestCase aura:id="test" case="{!case}" url="{!m.url}" suite="{!m.testSuite}" done="{!c.testDone}"/>
        </aura:forEach>
    </ui:tabset>

    <section class="suiteCode">
        <h1>JS Test Suite <span onclick="{!c.toggleCode}">Display</span></h1>
        <pre aura:id="test-suite-code">{!m.testSuite.code}</pre>
    </section>
</aura:application>
