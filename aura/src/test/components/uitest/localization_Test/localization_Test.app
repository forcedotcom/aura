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
<aura:application access="public" model="java://org.auraframework.impl.java.model.TestJavaModel" controller="java://org.auraframework.impl.java.controller.JavaTestController">
    <aura:attribute name="submitCount" type="integer"/>

    <div id="outSubmitCountDiv">
        Submit count: <ui:outputText aura:id="outSubmitCount" value="0"/>
    </div>

    <div>Input Date</div>
    enter Date: <ui:inputDate aura:id="inDate" value="{!m.dateOnly}"/> <br/>
    <ui:button buttonTitle="Date" label="submit" press="{!c.submit}"/> <br/>
    your Date value is: <ui:outputDate aura:id="outDate" value="{!m.dateOnly}"/> <br/>
    <br/>

    <div>Input DateTime</div>
    enter DateTime: <ui:inputDateTime aura:id="inDateTime" value="{!m.dateTimeISOString}" timezone="GMT"/> <br/>
    <ui:button buttonTitle="DateTime" label="submit" press="{!c.submit}"/> <br/>
    your DateTime value is: <ui:outputDateTime aura:id="outDateTime" value="{!m.dateTimeISOString}" timezone="GMT"/> <br/>
    <br/>

    <div>Input Number</div>
    enter Number: <ui:inputNumber aura:id="inNumber" value="{!m.integer}"/> <br/>
    <ui:button buttonTitle="Number" label="submit" press="{!c.submit}"/> <br/>
    your Number value is: <ui:outputNumber aura:id="outNumber" value="{!m.integer}"/> <br/>
    <br/>

    <div>Input Percent</div>
    enter Percent: <ui:inputPercent aura:id="inPercent" value="{!m.percent}"/> <br/>
    <ui:button buttonTitle="Percent" label="submit" press="{!c.submit}"/> <br/>
    your Percent value is: <ui:outputPercent aura:id="outPercent" value="{!m.percent}"/> <br/>
    <br/>

	<div>Input Currency</div>
    enter Currency: <span id="MyCurrency"><ui:inputCurrency aura:id="inCurrency" value="{!m.currency}"/></span> <br/>
    <ui:button buttonTitle="Currency" label="submit" press="{!c.submit}"/> <br/>
    your Currency value is: <ui:outputCurrency aura:id="outCurrency" value="{!m.currency}"/> <br/>
    <br/>

</aura:application>
