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
<aura:application>
    <aura:attribute name="titleExpr" type="String" default="from expression"/>
    <aura:handler event="aura:layoutChange" action="{!c.layoutChanged}"/>
    <aura:handler event="aura:titleChange" action="{!c.titleChanged}"/>
    <div aura:id="ready"/>
    <div aura:id="lastLayoutTitle"/>
    <div aura:id="currLayoutTitle"/>
    <div aura:id="lastTitle"/>
    <div aura:id="currTitle"/>
</aura:application>
