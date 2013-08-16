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
<aura:application preload="auradev" model="java://org.auraframework.impl.admin.AdminModel" controller="java://org.auraframework.impl.admin.AdminController" securityProvider="java://org.auraframework.impl.admin.AdminSecurityProvider">
<aura:attribute name="mbeans" type="boolean"/>
<div>
<h2>Aura Administration console</h2>
Running in <em>{!m.mode}</em> mode
<p>
<button class="clearButton" onclick="{!c.clearAll}">Clear all caches</button>
# of registries: {!m.registryData.length}
<br/><br/>
Caches
<br class="clear"/>
<auraadmin:cacheView data="{!m.defsData}" name="Definitions" showDefs="true" />
<auraadmin:cacheView data="{!m.existsData}" name="Existence" />
<auraadmin:cacheView data="{!m.stringsData}" name="Strings" />
<auraadmin:cacheView data="{!m.descriptorFilterData}" name="Descriptor Filter" />
</p>
<p>
Non-caching Registries
<br/>
<aura:foreach var="reg" items="{!m.registryData}">
<auraadmin:registryView registry="{!reg}"/>
</aura:foreach>
</p>

<p>
<button onclick="{!c.toggleMBeans}">{!v.mbeans ? 'Hide' : 'Show'} MBeans</button>
(Note bean values are retrieved at runtime in the middle of the lifecycle of a request);
<aura:renderif isTrue="{!v.mbeans}">
<auraadmin:counterBeans beans="{!m.beanData}"/>
</aura:renderif>
</p>
</div>
</aura:application>
