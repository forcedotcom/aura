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
<aura:application preload="provider" render="client" securityProvider="java://org.auraframework.components.security.SecurityProviderAlwaysAllows">
    <aura:attribute name="newDescriptor" type="String" default="markup://provider:clientProvider"/>
    <aura:attribute name="newAttributes" type="String" default="{value:&quot;{componentDef:'markup://aura:text',attributes:{value:'breadwinner'}}&quot;}"/>

    <div>descriptor: <ui:inputText value="{!v.newDescriptor}" size="128"/></div>
    <div>attributes: <ui:inputText value="{!v.newAttributes}" size="128"/></div>
    <ui:button aura:id="create" press="{!c.createComponent}" label="create component"/>

    <div aura:id="creations">
        {!v.body}
    </div>
</aura:application>
