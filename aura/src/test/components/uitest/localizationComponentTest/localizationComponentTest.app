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
<aura:application access="public" controller="java://org.auraframework.impl.java.controller.TestControllerLocalization" model="java://org.auraframework.impl.java.model.TestModelLocalization">
    <aura:attribute name="hardCoded" type="String" default="Values hard coded on server.." description="Description"/>
    <aura:attribute name="submitCount" type="number"/>
    <aura:registerevent name="press" type="ui:press"/>
    <script type="text/javascript">
        document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    </script>

    <div id="outSubmitCountDiv" class="banner top">
        Submit count: <ui:outputText aura:id="outSubmitCount" value="0"/>
    </div>
    <div id="localeDataDiv" class="banner down">
        <u>Locale data</u> (You can change your browser locale from browser's language settings)<br/>
        <aura:forEach items="{!m.localeData}" var="i">
            <ui:outputText aura:id="currentLocale" value="{!i}"/><br/>
        </aura:forEach>
    </div>


    <!-- components -->
    <!-- Input Number -->
    <div class="container">
        <div class="title">Input Number</div>

        <span class="bText">Enter Number in System Locale: <ui:inputNumber aura:id="inNumber" value="{!m.numberBigDecimal}"/></span>
        <ui:button buttonTitle="Number" label="Submit" class="custom" press="{!c.submitCmp}"/> <br/>

        <div class="bText">Your Localized Number value:
            <div aura:id="cmpCtrNumber" class="bText opt">- -</div>
        </div>
        <div class="bText">Your Non-Localized Number value: <ui:outputText aura:id="outNumber" value=""/></div>
    </div>

    <!-- Output Number -->
    <ui:message severity="info">{!v.hardCoded}</ui:message>
    <aura:forEach items="{!m.numbers}" var="i">
        <div class="container">
            <div class="title">Output Number</div>
            <div class="bText">Number: <ui:outputNumber value='{!i}'/></div>
        </div>
    </aura:forEach>
    <br/>


    <!-- Input Date -->
    <div class="container">
        <div class="title">Input Date</div>

        <span class="bText">Enter Date: <ui:inputDate aura:id="inDate" value="{!m.date}"/></span>
        <ui:button buttonTitle="Date" label="Submit" class="custom" press="{!c.submitCmp}"/><br/>

        <div class="bText">Your Localized Date value:
            <div aura:id="cmpCtrDate" class="bText opt">- -</div>
        </div>

        <div class="bText">Your Non-Localized Date value: <ui:outputText aura:id="outDate" value=""/></div>
    </div>

    <!-- Output Date -->
    <ui:message severity="info">{!v.hardCoded}</ui:message>
    <aura:forEach items="{!m.dates}" var="i">
        <div class="container">
            <div class="title">Output Date</div>
            <div class="bText">Date: <ui:outputDate value='{!i}'/></div>
        </div>
    </aura:forEach>
    <br/>


    <!-- Input Time -->
    <div class="container">
        <div class="title">Input Time</div>

        <span class="bText">Enter Time: <ui:inputTime aura:id="inTime" value="{!m.time}"/></span>
        <ui:button buttonTitle="Time" label="Submit" class="custom" press="{!c.submitCmp}"/><br/>

        <div class="bText">Your Localized Time value:
            <div aura:id="cmpCtrTime" class="bText opt">- -</div>
        </div>

        <div class="bText">Your Non-Localized Time value: <ui:outputText aura:id="outTime" value=""/></div>
    </div>

    <!-- Output Time -->
    <!-- Here we are actually using outputDateTime component -->
    <ui:message severity="info">{!v.hardCoded}</ui:message>
    <aura:forEach items="{!m.times}" var="i">
        <div class="container">
            <div class="title">Output Date Time</div>
            <div class="bText">Date Time: <ui:outputDateTime value='{!i}'/></div>
        </div>
    </aura:forEach>
    <br/>



    <!-- Input Date Time -->
    <div class="container">
        <div class="title">Input Date Time</div>

        <span class="bText">Enter Date Time: <ui:inputDateTime aura:id="inDateTime" value="{!m.dateTime}"/></span>
        <ui:button buttonTitle="DateTime" label="Submit" class="custom" press="{!c.submitCmp}"/><br/>

        <div class="bText">Your Localized Date Time value:
            <div aura:id="cmpCtrDateTime" class="bText opt">- -</div>
        </div>

        <div class="bText">Your Non-Localized Date Time value: <ui:outputText aura:id="outDateTime" value=""/></div>
    </div>
    <br/>


    <!-- Input Percent -->
    <div class="container">
        <div class="title">Input Percent</div>
        <span class="bText">Enter Percent: <ui:inputPercent aura:id="inPercent" value="{!m.percent}"/></span>
        <ui:button buttonTitle="Percent" label="Submit" class="custom" press="{!c.submitCmp}"/><br/>

        <div class="bText">Your Localized Percent value:
            <div aura:id="cmpCtrPercent" class="bText opt">- -</div>
        </div>
        <div class="bText">Your Non-Localized Percent value: <ui:outputText aura:id="outPercent" value=""/></div>
    </div>

    <!-- Output Percent -->
    <ui:message severity="info">{!v.hardCoded}</ui:message>
    <aura:forEach items="{!m.percentages}" var="i">
        <div class="container">
            <div class="title">Output Percent</div>
            <div class="bText">Percent: <ui:outputPercent value='{!i}'/></div>
        </div>
    </aura:forEach>
    <br/>


    <!-- Input Currency -->
    <div class="container">
        <div class="title">Input Currency</div>
        <span class="bText">Enter Currency: <ui:inputCurrency aura:id="inCurrency" value="{!m.currency}"/></span>
        <ui:button buttonTitle="Currency" label="Submit" class="custom" press="{!c.submitCmp}"/><br/>

        <div class="bText">Your Localized Currency value:
            <div aura:id="cmpCtrCurrency" class="bText opt">- -</div>
        </div>
        <div class="bText">Your Non-Localized Currency value: <ui:outputText aura:id="outCurrency" value=""/></div>
    </div>

    <!-- Output Currency -->
    <ui:message severity="info">{!v.hardCoded}</ui:message>
    <aura:forEach items="{!m.currencies}" var="i">
        <div class="container">
            <div class="title">Output Currency</div>
            <div class="bText">Currency: <ui:outputCurrency value='{!i}'/></div>
        </div>
    </aura:forEach>
    <br/>


    <a href="#" class="underline">Unlocalized Components</a>

    <!-- Input Text -->
    <div class="container">
        <div class="title">Input Text</div>
        <span class="bText">Enter Text: <ui:inputText aura:id="inText" value="{!m.text}" maxlength="10"/></span>
        <ui:button buttonTitle="Text" label="Submit" class="custom" press="{!c.submit}"/><br/>
        <div class="bText">Your Text: <ui:outputText aura:id="outText" value=""/></div>
    </div>

    <!-- Output Text -->
    <ui:message severity="info">{!v.hardCoded}</ui:message>
    <aura:forEach items="{!m.strings}" var="i">
        <div class="container">
            <div class="title">Output Text</div>
            <div class="bText">Text: <ui:outputText value="{!i}"/></div>
        </div>
    </aura:forEach>
    <br/>

</aura:application>
