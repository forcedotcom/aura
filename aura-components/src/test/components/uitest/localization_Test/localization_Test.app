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
<aura:application access="unauthenticated" model="java://org.auraframework.components.test.java.model.TestJavaModel" controller="java://org.auraframework.components.test.java.controller.JavaTestController">
    <aura:attribute name="submitCount" type="integer"/>

    <div id="outSubmitCountDiv">
        Submit count: <ui:outputText aura:id="outSubmitCount" value="0"/>
    </div>

    <div>Input Date</div>
    <ui:button buttonTitle="Date" label="submit" press="{!c.submit}"/> <br/>
    enter Date: <ui:inputDate aura:id="inDate" displayDatePicker="true" value="{!m.dateOnly}"/> <br/>
    your Date value is: <ui:outputDate aura:id="outDate" value="{!m.dateOnly}"/> <br/>
    <br/>

    <div>Input DateTime</div>
    <ui:button buttonTitle="DateTime" label="submit" press="{!c.submit}"/> <br/>
    enter DateTime: <ui:inputDateTime aura:id="inDateTime" value="{!m.dateTimeISOString}" timezone="GMT"/> <br/>
    your DateTime value is: <ui:outputDateTime aura:id="outDateTime" value="{!m.dateTimeISOString}" timezone="GMT" format="MMM dd, yyyy, h:mm:ss a"/> <br/>
    <br/>

    <div>Input Number</div>
    <ui:button buttonTitle="Number" label="submit" press="{!c.submit}"/> <br/>
    enter Number: <ui:inputNumber aura:id="inNumber" value="{!m.integer}"/> <br/>
    your Number value is: <ui:outputNumber aura:id="outNumber" value="{!m.integer}"/> <br/>
    <br/>

    <div>Input Percent</div>
    <ui:button buttonTitle="Percent" label="submit" press="{!c.submit}"/> <br/>
    enter Percent: <ui:inputPercent aura:id="inPercent" value="{!m.percent}"/> <br/>
    your Percent value is: <ui:outputPercent aura:id="outPercent" value="{!m.percent}"/> <br/>
    <br/>

	<div>Input Currency</div>
	<ui:button buttonTitle="Currency" label="submit" press="{!c.submit}"/> <br/>
    enter Currency: <span id="MyCurrency"><ui:inputCurrency aura:id="inCurrency" value="{!m.currency}"/></span> <br/>
    your Currency value is: <ui:outputCurrency aura:id="outCurrency" value="{!m.currency}"/> <br/>
    <br/>

</aura:application>
