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
<aura:application
    template="auradocs:template"
    controller="java://org.auraframework.docs.DocsController"
    securityProvider="java://org.auraframework.docs.DocsSecurityProvider"
    useAppcache="true"
    preload="auradocs"
    locationChangeEvent="auradocs:locationChange">

    <aura:handler event="aura:waiting" action="{!c.waiting}"/>
    <aura:handler event="aura:doneWaiting" action="{!c.doneWaiting}"/>

	<auraStorage:init implementation="memory" maxSize="1024" defaultExpiration="86400" 
		defaultAutoRefreshInterval="86400" debugLoggingEnabled="false"/>
	
    <auradocs:nav aura:id="navbar"/>

    <div class="container" aura:id="container">
        <aside aura:id="sidebar" class="sidebar"></aside>
        <article aura:id="content" class="content"></article>
    </div>
    <footer>Copyright &copy; 2012 salesforce.com, inc.</footer>
</aura:application>
