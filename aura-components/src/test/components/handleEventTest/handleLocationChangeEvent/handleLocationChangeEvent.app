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
<aura:application locationChangeEvent="auratest:locationChange">
    <aura:attribute name="clickCount" type="Integer" default="0"/>
    <aura:attribute name="locationChangeCount" type="Integer" default="0"/>

    <aura:attribute name="order" type="String" default=""/>
    <aura:attribute name="results" type="String[]" default=""/>
    <aura:attribute name="hideLocationChangeTimes" type="Integer" default="2"/>

    <aura:handler event="auratest:locationChange" action="{!c.locationChange}"/>

    <div>Click count: {!v.clickCount}</div><br/>
    <div>Location Change count: {!v.locationChangeCount}</div><br/>

    <aura:iteration items="{!v.results}" var="item">
        <div>{!item}</div><br/>
    </aura:iteration>

    <ui:outputURL value="{!'#' + v.locationChangeCount}" label="Add one" aura:id="hashLink" click="{!c.click}"/>
</aura:application>
