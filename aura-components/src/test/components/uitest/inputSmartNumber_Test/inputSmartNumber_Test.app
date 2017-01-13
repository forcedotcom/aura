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
<aura:application access="unauthenticated">

    <aura:attribute name="testInputCmp" type="string" default="none"/>

    <aura:attribute name="eventFired" type="Object" />
    <aura:attribute name="eventList" type="Object[]" default="[]" />
    <aura:attribute name="eventListLen" type="Integer" default="20"/>

    <aura:attribute name="value" type="Decimal" default=""/>

    <aura:attribute name="max" type="Decimal" default="99999999999999"/>
    <aura:attribute name="min" type="Decimal" default="-99999999999999"/>
    <aura:attribute name="disabled" type="Boolean" default="false"/>
    <aura:attribute name="setValueToZeroDuringInit" type="Boolean" default="false"/>

    <aura:handler name="init" value="{! this }" action="{! c.init }" />

    <!-- Handy links to set test input cmp for manual tests -->
    <ul>
        <li><a href="/uitest/inputSmartNumber_Test.app?testInputCmp=inputNumber">inputNumber</a></li>
        <li><a href="/uitest/inputSmartNumber_Test.app?testInputCmp=inputCurrency">inputCurrency</a></li>
        <li><a href="/uitest/inputSmartNumber_Test.app?testInputCmp=inputPercent">inputPercent</a></li>
    </ul>

    <aura:if isTrue="{! v.testInputCmp != 'none'}">
    <div style="margin:15px;">

        <aura:if isTrue="{! v.testInputCmp == 'inputNumber' }">
            <ui:inputNumber
                    aura:id="input" label="inputNumber" labelPosition="top"
                    disabled="{! v.disabled }" max="{! v.max }" min="{! v.min }" value="{!v.value}"/>
        </aura:if>
        <aura:if isTrue="{! v.testInputCmp == 'inputCurrency' }">
            <ui:inputCurrency
                    aura:id="input" label="inputCurrency" labelPosition="top"
                    disabled="{! v.disabled }" max="{! v.max }" min="{! v.min }"  value="{!v.value}"/>
        </aura:if>
        <aura:if isTrue="{! v.testInputCmp == 'inputPercent' }">
            <ui:inputPercent
                    aura:id="input" label="inputPercent" labelPosition="top"
                    disabled="{! v.disabled }" max="{! v.max }" min="{! v.min }"  value="{!v.value}"/>
        </aura:if>

        <div>
            <ui:button class="disableBtn" label="{! v.disabled ? 'Enable' : 'Disable' }" press="c.toggleDisabled"/>
            <ui:button class="submitBtn"  label="Submit" press="c.setValue"/>
            v.value: <span class="vvalue">{! v.value }</span>
        </div>

        <div>
            <ui:button class="clearEventsBtn"  label="Clear Events" press="c.clearEvents"/>
            <h1>List of fired events</h1>
            <ul aura:id="eventList" class="eventList">
                <aura:iteration items="{! v.eventList }" var="event">
                    <li>{! event.type }</li>
                </aura:iteration>
            </ul>
        </div>
    </div>
    </aura:if>
</aura:application>
