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
<aura:application model="java://org.auraframework.components.auraadmin.CatalogModel" preload="auraadmin">
	<table>
		<thead>
			<tr>
				<th></th>
				<th>Name</th>
				<th>Support</th>
				<th>JS Tests</th>
			</tr>
		</thead>
		<tbody>
		    <aura:iteration items="{!m.components}" var="cmp" indexVar="index">
		    	<tr class="{!cmp.support}">
		    		<td>{!index}</td>
		    		<td>{!cmp.name}</td>
		    		<td >{!cmp.support}</td>
		    		<td >{!cmp.tests}</td>
		    	</tr>
		    </aura:iteration>
		</tbody>
    </table>
</aura:application>
