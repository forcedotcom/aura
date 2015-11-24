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
<aura:application template="auraStorageTest:componentDefStorageEvictionTemplate">
    <aura:attribute name="load" type="String" default="ui:tab"/>
    <aura:attribute name="status" type="String" default="Waiting"/>
    <aura:attribute name="output" type="Aura.Component"/>
    <aura:attribute name="defStorageContents" type="String[]" default=""/>

    <aura:method name="fetchCmp" action="c.fetchCmp" />
    <aura:method name="createComponentDeprecated" action="c.createComponentDeprecated" />
    <aura:method name="clearActionAndDefStorage" action="c.clearActionAndDefStorage" />

    <aura:handler event="auraStorage:modified" action="{!c.storageModified}"/>

    <br/>
    <div aura:id="status">{!v.status}</div><br/>
    <div aura:id="output">{!v.output}</div>

</aura:application>
