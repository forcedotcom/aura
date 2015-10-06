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
    <aura:attribute name="systemErrorHandled" type="Boolean" default="false"/>
    <aura:attribute name="setFriendlyErrorHandled" type="Boolean" default="true"/>
    <aura:attribute name="useFriendlyErrorMessageFromData" type="Boolean" default="false"/>
    <aura:attribute name="handleSystemErrorEvent" type="Boolean" default="true"/>
    <aura:attribute name="errorCode" type="String" default="8675309" />

    <aura:handler event="aura:systemError" action="{!c.handleSystemError}"/>

    <ui:button label="Throw Error" press="{!c.throwError}" class="errorButton" />
    <ui:button label="Failing Assert" press="{!c.failAssert}" class="assertButton" />
    <ui:button label="Throw Friendly Error" press="{!c.throwFriendlyError}" class="friendlyErrorButton" />
    <ui:button label="Throw Friendly Error with errorCode" press="{!c.throwErrorWithCode}" class="errorCodeButton" />
</aura:application>
