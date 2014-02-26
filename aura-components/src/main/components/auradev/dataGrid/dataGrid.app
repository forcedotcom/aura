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
<aura:application preload="ui" model="js://auradev.dataGrid">
	<aura:attribute name="selectedItems" type="List"/>

	<ui:dataGrid items="{!m.data}" selectedItems="{!v.selectedItems}">
		<aura:set attribute="columns">
			<ui:dataGridSelectionColumn/>
			
			<ui:dataGridColumn label="Id" name="Id" sortable="true" filterable="true"/>				
			<ui:dataGridColumn label="Subject" name="Subject" sortable="true" filterable="true"/>
			<ui:dataGridColumn label="Name" name="Who.Name" sortable="true" filterable="true"/>
			<ui:dataGridColumn label="Related To" name="What.Name" sortable="true" filterable="true"/>
			<ui:dataGridColumn label="Due Date" name="ActivityDate" sortable="true" filterable="true"/>
			
			<ui:dataGridActionColumn label="Actions">
				<ui:actionButton name="delete" label="Del" index="{!index}"/>
				<ui:actionButton name="edit" label="Edit" index="{!index}"/>
			</ui:dataGridActionColumn>
		</aura:set>

		<aura:set attribute="actionDelegate">
			<ui:actionDelegate onaction="{!c.handleAction}"/>
		</aura:set>
	</ui:dataGrid>

</aura:application>
