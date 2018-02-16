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
<aura:application access="UNAUTHENTICATED" support="GA" description="Execute specified jstest on a dynamically created instance of the target component.">
    <aura:attribute name="descriptor" access="GLOBAL" type="String" description="The target component to test."/>
    <aura:attribute name="testName" access="GLOBAL" type="String" description="The test to execute."/>
    <aura:attribute name="timeout" access="GLOBAL" type="Integer" default="30" description="The maximum number of seconds to wait for the test to complete."/>

    <aura:attribute name="target" type="Aura.Component" />

    <aura:handler name="init" value="{!this}" action="{!c.init}"/>

    <script src="{!'/aura?aura.tag=' + v.descriptor + '&amp;aura.format=JS&amp;aura.testTimeout=' + v.timeout + '&amp;aura.jstestrun=' + v.testName}"/>

    {!v.target}
</aura:application>
