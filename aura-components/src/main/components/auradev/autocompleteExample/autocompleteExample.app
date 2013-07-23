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
    <ui:autocomplete aura:id="autoComplete" optionVar="row" 
        matchDone="{!c.handleMatchDone}"
        inputChange="{!c.handleInputChange}" 
        selectListOption="{!c.handleSelectOption}">
        <aura:set attribute="dataProvider">
            <auradev:testDataProvider/>
            <auradev:testDataProvider2/>
        </aura:set>
        <aura:set attribute="listOption">
            <ui:autocompleteOption label="{!row.label}" keyword="{!row.keyword}" value="{!row.value}" visible="{!row.visible}"/>     
        </aura:set>
    </ui:autocomplete>
    <p/>
    <div>Some other element</div>
    <input type="text"/>
</aura:application>