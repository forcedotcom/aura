
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
<aura:application
    template="auraNativeTest:template"
    access="global"
    useAppcache="false"
    services="auraNativeTest:primerService"
    controller="java://org.auraframework.impl.java.controller.ComponentTestController">

    <aura:attribute name="currentLabelValue" type="String" default="" />
    <aura:attribute name="otherLabel" type="String" default="" />
    <aura:attribute name="error" type="Map" default="" />
    <aura:attribute name="stringifiedError" type="String" default="" />

    <section>
        <!-- We can also use the service as a regular library  -->
        <auraNativeTest:primerService aura:id="primer" />

        <div class="examples">

            <div style="margin: 10px;padding: 10px; border:1px solid blue">
                <p><ui:button press="{!c.runPrimedLabel}" label="Check for primed label" /></p>
                <p>Label (If priming is correct value should be "Today"): <span>{!v.currentLabelValue}</span></p>
            </div>

            <div style="margin: 10px;padding: 10px; border:1px solid black">
                <ui:button press="{!c.primeAnAction}" label="Test prime an action" />
                <ui:button press="{!c.runAction}" label="Run an action" />
                <p>Once primed we should see no request</p>
            </div>

            <div style="margin: 10px;padding: 10px; border:1px solid green">
                <ui:button press="{!c.primeLabel}" label="Test priming a label" />
                <ui:button press="{!c.runLabel}" label="Show label" />
                <p>Once primed we should see no request <span>{!v.otherLabel}</span></p>
            </div>

            <div style="margin: 10px;padding: 10px; border:1px solid red">
                <ui:button press="{!c.submitErrorToPrimingService}" label="Test Aura Servlet error" />
                <ui:button press="{!c.submitErrorWithNoTokenToPrimingService}" label="Test Aura Servlet error with no token" />
                <ui:button press="{!c.showErrorResult}" label="Show Error Result" />
                <p>Priming service should parse the Servlet's error payload <span>{!v.stringifiedError}</span></p>
            </div>
        </div>
    </section>
</aura:application>
