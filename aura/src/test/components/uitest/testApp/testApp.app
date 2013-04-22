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

    <div>Input Checkbox</div>
    click Checkbox: <ui:inputCheckbox aura:id="inCheckbox" value="{!m.checked}"/> <br/>
    <ui:button buttonTitle="Checkbox" label="submit" press="{!c.submit}"/> <br/>
    your Checkbox value is: <ui:outputText aura:id="outCheckbox" value=""/> <br/>
    <br/>

    <div>Input Currency</div>
    enter Currency: <ui:inputCurrency aura:id="inCurrency" value="{!m.currency}"/> <br/>
    <ui:button buttonTitle="Currency" label="submit" press="{!c.submit}"/> <br/>
    your Currency value is: <ui:outputText aura:id="outCurrency" value=""/> <br/>
    <br/>

    <div>Input Date</div>
    enter Date: <ui:inputDate aura:id="inDate" value="{!m.dateOnly}"/> <br/>
    <ui:button buttonTitle="Date" label="submit" press="{!c.submit}"/> <br/>
    your Date value is: <ui:outputText aura:id="outDate" value=""/> <br/>
    <br/>

    <div>Input DateTime</div>
    enter DateTime: <ui:inputDateTime aura:id="inDateTime" value="{!m.dateTime}"/> <br/>
    <ui:button buttonTitle="DateTime" label="submit" press="{!c.submit}"/> <br/>
    your DateTime value is: <ui:outputText aura:id="outDateTime" value=""/> <br/>
    <br/>

    <div>Input Email</div>
    enter Email: <ui:inputEmail aura:id="inEmail" value="{!m.email}"/> <br/>
    <ui:button buttonTitle="Email" label="submit" press="{!c.submit}"/> <br/>
    your Email value is: <ui:outputText aura:id="outEmail" value=""/> <br/>
    <br/>

    <div>Input Number</div>
    enter Number: <ui:inputNumber aura:id="inNumber" value="{!m.number}"/> <br/>
    <ui:button buttonTitle="Number" label="submit" press="{!c.submit}"/> <br/>
    your Number value is: <ui:outputText aura:id="outNumber" value=""/> <br/>
    <br/>

    <div>Input Option</div>
    check Option: <ui:inputOption aura:id="inOption" value="{!m.option}"/> <br/>
    <ui:button buttonTitle="Option" label="submit" press="{!c.submit}"/> <br/>
    your Option value is: <ui:outputText aura:id="outOption" value=""/> <br/>
    <br/>

    <div>Input Percent</div>
    enter Percent: <ui:inputPercent aura:id="inPercent" value="{!m.percent}"/> <br/>
    <ui:button buttonTitle="Percent" label="submit" press="{!c.submit}"/> <br/>
    your Percent value is: <ui:outputText aura:id="outPercent" value=""/> <br/>
    <br/>

    <div>Input Phone</div>
    enter Phone: <ui:inputPhone aura:id="inPhone" value="{!m.phone}"/> <br/>
    <ui:button buttonTitle="Phone" label="submit" press="{!c.submit}"/> <br/>
    your Phone value is: <ui:outputText aura:id="outPhone" value=""/> <br/>
    <br/>

    <div>Input Picklist</div>
    select Picklist: <ui:inputPicklist aura:id="inPicklist"/> <br/>
    <ui:button buttonTitle="Picklist" label="submit" press="{!c.submit}"/> <br/>
    your Picklist value is: <ui:outputText aura:id="outPicklist" value=""/> <br/>
    <br/>

    <div>Input Search</div>
    enter Search: <ui:inputSearch aura:id="inSearch" value="{!m.search}"/> <br/>
    <ui:button buttonTitle="Search" label="submit" press="{!c.submit}"/> <br/>
    your Search value is: <ui:outputText aura:id="outSearch" value=""/> <br/>
    <br/>

    <div>Input Secret</div>
    enter Secret: <ui:inputSecret aura:id="inSecret" value="{!m.secret}"/> <br/>
    <ui:button buttonTitle="Secret" label="submit" press="{!c.submit}"/> <br/>
    your Secret value is: <ui:outputText aura:id="outSecret" value=""/> <br/>
    <br/>

    <div>Input Select</div>
    choose Select: <ui:inputSelect aura:id="inSelect" options="{!m.select}"/> <br/>
    <ui:button buttonTitle="Select" label="submit" press="{!c.submit}"/> <br/>
    your Select value is: <ui:outputText aura:id="outSelect" value=""/> <br/>
    <br/>

    <div>Input SelectOption</div>
    check SelectOption: <ui:inputSelectOption aura:id="inSelectOption" value="{!m.selectOption}"/> <br/>
    <ui:button buttonTitle="SelectOption" label="submit" press="{!c.submit}"/> <br/>
    your SelectOption value is: <ui:outputText aura:id="outSelectOption" value=""/> <br/>
    <br/>

    <div>Input Text</div>
    enter Text: <ui:inputText aura:id="inText" value="{!m.text}" maxlength="10"/> <br/>
    <ui:button buttonTitle="Text" label="submit" press="{!c.submit}"/> <br/>
    your Text is: <ui:outputText aura:id="outText" value=""/> <br/>
    <br/>

    <div>Input TextArea</div>
    enter Text: <ui:inputTextArea aura:id="inTextArea" value="{!m.textAreaText}"/> <br/>
    <ui:button buttonTitle="TextArea" label="submit" press="{!c.submit}"/> <br/>
    your Text value is: <ui:outputText aura:id="outTextArea" value=""/> <br/>
    <br/>

    <div>Input Url</div>
    enter Url: <ui:inputURL aura:id="inUrl" value="{!m.url}"/> <br/>
    <ui:button buttonTitle="Url" label="submit" press="{!c.submit}"/> <br/>
    your Url value is: <ui:outputText aura:id="outUrl" value=""/> <br/>
    <br/>

    <div>Input Select (multi)</div>
    enter Selection (multiple):<ui:inputSelect size="{!m.selectOptions.length}" value="option1" multiple="true" aura:id="inSelectMulti" options="{!m.selectOptions}"/> <br/>
    <ui:button buttonTitle="SelectMulti" label="submit" press="{!c.submit}"/> <br/>
    your Secltion value is: <ui:outputText aura:id="outSelectMulti" value=""/> <br/>
    <br/>

</aura:application>
