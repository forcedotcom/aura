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
<!-- this is for testing outputURL with hash(#) in its value , it will trigger locationChange event when clicking --> 
<aura:application locationChangeEvent="auratest:locationChange">
    <aura:attribute name="locationChangeCountPeach" type="Integer" default="0"/>
    <aura:attribute name="locationChangeCount" type="Integer" default="0"/>
    <aura:attribute name="locationTokenOrange" type="String" default="EMPTY"/>
    <aura:attribute name="locationToken" type="String" default="EMPTY2"/>
    <aura:attribute name="clickCount" type="Integer" default="0"/>
    
    <aura:handler event="auratest:locationChange" action="{!c.locationChanged}"/>
    
    <div>location change count: {!v.locationChangeCount}</div>
    <div>location change count Peach: {!v.locationChangeCountPeach}</div>
    <div>location token: {!v.locationToken}</div>
    <div>location token Orange: {!v.locationTokenOrange}</div>
    <div>click count: {!v.clickCount}</div>
    
    <br/><br/>
    <!-- value with hash, won't change -->
    <ui:outputURL value="#APPLE" label="hashLinkApple" aura:id="hashLinkA" linkClick="{!c.clickApple}"/><br/><br/>
    <!-- value with hash in a broken way, won't change -->
    <ui:outputURL value="{!'#' + BANANA}" label="hashLinkBanana" aura:id="hashLinkB" linkClick="{!c.clickBanana}"/><br/><br/>
    <!-- value with hash, change with locationToken in click handler-->
    <ui:outputURL value="{!'#' + v.locationTokenOrange}" label="hashLinkOrange" aura:id="hashLinkO" linkClick="{!c.clickOrange}"/><br/><br/>
    <!-- value with hash, change with locationChangeCount in locationChanged handler-->
    <ui:outputURL value="{!'#' + v.locationChangeCountPeach}" label="hashLinkPeach" aura:id="hashLinkP" linkClick="{!c.clickPeach}"/><br/><br/>
</aura:application>
