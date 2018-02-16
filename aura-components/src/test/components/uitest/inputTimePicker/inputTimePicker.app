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
    <aura:attribute name="timeFormat" type="String" description="The java.text.SimpleDateFormat style format for the time."/>
    <aura:attribute name="interval" type="Integer" default="30" description="The interval in minutes."/>
    <aura:attribute name="visible" type="Boolean" default="false" description="Indicates if this time picker list is displayed. Defaults to false."/>

    <ui:inputTimePicker aura:id="target" visible="{!v.visible}" interval="{!v.interval}" timeFormat="{!v.timeFormat}" />
</aura:application>

