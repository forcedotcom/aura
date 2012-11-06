<!--

    Copyright (C) 2012 salesforce.com, inc.

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
<aura:application abstract="true"
         extensible="true"
         locationChangeEvent="aura:locationChange"
         template="aura:template"
         renderer="js://aura.component, java://org.auraframework.renderer.ComponentRenderer"
         access="public"
         securityProvider="java://org.auraframework.components.DefaultSecurityProvider"
         implements="aura:rootComponent"
         support="GA"
         useAppcache="false"
         description="The root of the application hierarchy.">
    <aura:attribute name="body" type="Aura.Component[]" description="The components to render within this application."/>
</aura:application>
