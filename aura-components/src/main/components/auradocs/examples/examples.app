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
<aura:application template="auradocs:examplesTemplate" access="global">
	<aura:attribute name="name" type="String"/>
	
	<ui:message title="Usage:" severity="info">
		<pre>
		Use name attribute to specify what examples you wish to see. 
		
		Specific component/app:        name=NAMESPACE:COMPONENT-NAME
		Components with common prefix: name=NAMESPACE:COMPONENT-PREFIX*
		Specific namespace:            name=NAMESPACE:*
		Everything:                    name=*:*
		
		Example: /auradocs/examples.app?name=ui:*, /auradocs/examples.app?name=ui:input*
		Note: Please be patient when using wildcards, as it may take a while to process everything.
		</pre>
	</ui:message>

	<auradocs:examplesc name="{!v.name}" aura:load="lazy"/>
    
    <footer>Copyright &copy; 2013 salesforce.com, inc.</footer>
</aura:application>
