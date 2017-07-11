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
<aura:application access="unauthenticated"
        controller="java://org.auraframework.components.test.java.controller.TestController">
    <aura:attribute name="message" type="String"/>
    <aura:attribute name="severity" type="String"/>
    <aura:attribute name="errorId" type="String"/>
    <aura:attribute name="eventHandled" type="Boolean" default="false"/>
    <aura:attribute name="actionDone" type="Boolean" default="false"/>

    <!-- The following attributes can be passed in with url to perform tests -->
    <!-- set false when testing defult handler-->
    <aura:attribute name="handleSystemError" type="Boolean" default="false"/>
    <aura:attribute name="addAttributeMissingComponent" type="Boolean" default="false"/>
    <aura:attribute name="throwErrorFromInit" type="Boolean" default="false"/>
    <aura:attribute name="throwErrorFromRender" type="boolean" default="false"/>
    <aura:attribute name="throwErrorFromAfterRender" type="Boolean" default="false"/>
    <aura:attribute name="throwErrorInHandler" type="Boolean" default="false"/>

    <!-- The following attributes can be passed in with url and need to click button to perform tests -->
    <aura:attribute name="throwErrorFromRerender" type="Boolean" default="false" />
    <aura:attribute name="throwErrorFromUnrender" type="Boolean" default="false" />
    <aura:attribute name="useFriendlyErrorMessageFromData" type="Boolean" default="false"/>

    <!-- The following attributed will be passed into contained component -->
    <aura:attribute name="handleSystemErrorInContainedCmp" type="boolean" default="false"/>
    <aura:attribute name="throwErrorFromContainedCmpRender" type="boolean" default="false"/>
    <aura:attribute name="throwErrorFromContainedCmpAfterRender" type="boolean" default="false"/>

    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:handler event="aura:systemError" action="{!c.handleSystemError}"/>
    <aura:handler event="aura:serverActionError" action="{!c.noop}"/>

    <aura:registerEvent name="testEvt" type="auratest:testEvent"/>
    <aura:handler name="testEvt" action="{!c.nonExistingHandler}"/>

    <aura:method name="throwErrorFromClientController"
                 action="{!c.throwErrorFromClientController}"/>
    <aura:method name="throwErrorFromServerActionCallback"
                 action="{!c.throwErrorFromServerActionCallback}"/>

    <table class="errorFromAppTable">
    <caption> Errors from Application: </caption>
    <tr>
        <td>Error from Application Client Controller: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromClientController}"
                     class="errorFromClientControllerButton"
                     aura:id="errorFromClientControllerButton"/>
        </td>
    </tr>
    <tr>
        <td>Error from Application Server Action Callback: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromServerActionCallback}"
                     class="errorFromServerActionCallbackButton"/>
        </td>
    </tr>
    <tr>
        <td>Error from Application Server Action Callback wrapped in $A.getCallback(): </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromServerActionCallbackWrappedInGetCallback}"
                     aura:id="errorFromServerActionCallbackWrappedInGetCallbackButton"/>
        </td>
    </tr>
    <tr>
        <td>Error from CreateComponent Callback in Application: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromCreateComponentCallback}"
                     class="errorFromCreateComponentCallbackButton"
                     aura:id="errorFromCreateComponentCallbackButton"/>
        </td>
    </tr>
    <tr>
        <td>Error from Function Wrapped in GetCallback in Application: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromFunctionWrappedInGetCallback}"
                     class="errorFromFunctionWrappedInGetCallbackButton"/>
        </td>
    </tr>
    <tr>
        <td>Error From Application Rerender: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromRerender}"
                     class="errorFromRerenderButton"/>
        </td>
    </tr>
    <tr>
        <td>Error From Application Unrender: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromUnrender}"
                     class="errorFromUnrenderButton"/>
        </td>
    </tr>
    <tr>
        <td>Failing assert From Application Client Controller: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.failAssertInClientController}"
                     class="failAssertInClientControllerButton"/>
        </td>
    </tr>
    <tr>
        <td>AuraFriendlyError From Application Client Controller: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwAuraFriendlyErrorFromClientController}"
                     class="auraFriendlyErrorFromClientControllerButton"
                     aura:id="auraFriendlyErrorFromClientControllerButton"/>
        </td>
    </tr>
    <tr>
        <td>Error from aura:method handler: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromAuraMethodHandler}"
                     class="errorFromAuraMethodHandlerButton"
                     aura:id="errorFromAuraMethodHandlerButton"/>
        </td>
    </tr>
    <tr>
        <td>Error from contained component client controller: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromContainedCmpController}"
                     class="errorFromContainedCmpControllerButton"
                     aura:id="errorFromContainedCmpControllerButton"/>
        </td>
    </tr>
    <tr>
        <td>Error from Promise: </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromPromise}"
                     aura:id="errorFromPromiseButton"/>
        </td>
    </tr>
    <tr>
        <td>Error from $A.error(): </td>
        <td>
          <ui:button label="Throw"
                     press="{!c.throwErrorFromAError}"
                     class="errorFromAErrorButton"
                     aura:id="errorFromAErrorButton"/>
        </td>
    </tr>
    <tr>
        <td>Fire Test Event: </td>
        <td>
          <ui:button label="Fire"
                     press="{!c.fireTestEvent}"
                     aura:id="fireTestEventButton"/>
        </td>
    </tr>
    </table>

    systemError Event is handled on App: <div id="eventHandledOnApp">{!v.eventHandled}</div>
    <br/>
    <aura:if isTrue="{!v.eventHandled}">
    <h2>Error details:</h2><br/>
        Message: <div id="appErrorOutput"> {!v.message} </div><br/>
        Severity: <div id="appErrorSeverityOutput"> {!v.severity} </div><br/>
        Id: <div id="appErrorIdOutput"> {!v.errorId} </div><br/>
    </aura:if>

    <br/><br/>
    <aura:if isTrue="{!v.addAttributeMissingComponent}">
        <auratest:errorHandling/>
        <aura:set attribute="else">
            <auratest:errorHandling aura:id="containedCmp">
                <aura:set attribute="requiredAttribute" value="required"/>
                <aura:set attribute="throwErrorFromRender" value="{!v.throwErrorFromContainedCmpRender}"/>
                <aura:set attribute="throwErrorFromAfterRender" value="{!v.throwErrorFromContainedCmpAfterRender}"/>
                <aura:set attribute="handleSystemError" value="{!v.handleSystemErrorInContainedCmp}"/>
            </auratest:errorHandling>
        </aura:set>
    </aura:if>

    <br/>
    Client error is sent via Caboose Actions, force a foreground action to sent error to server:
    <ui:button label="Server Action" press="{!c.doServerAction}" class="serverActionButton"/>
    <div id="actionDone"> {!v.actionDone} </div>

</aura:application>
