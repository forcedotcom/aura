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
<aura:application  model="java://org.auraframework.components.ui.listView.ListViewTestModel">

    Empty list, generated columns
    <ui:listView id="test-empty-list-generated-columns" aura:id="test-empty-list-generated-columns"/>
    <hr/>

    List, generated columns
    <ui:listView id="test-list-generated-columns" aura:id="test-list-generated-columns" items="{!m.generatedlistdata}"/>
    <hr/>

    Empty list, specified columns
    <ui:listView id="test-empty-list-specified-columns" aura:id="test-empty-list-specified-columns">
        <ui:column type="" title="Type:Empty String" fieldName="type:empty string"/>
        <ui:column title="Type:Undefined" fieldName="type:undefined"/>
        <ui:column type="Text" title="Type:Text" fieldName="type:text"/>
        <ui:column type="Email" title="Type:Email" fieldName="type:email"/>
        <ui:column type="Checkbox" title="Type:Checkbox" fieldName="type:checkbox"/>
        <ui:column type="Link" title="Type:Link" fieldName="type:link"/>
        <ui:column type="Index" title="Type:Index" fieldName="type:index"/>
        <ui:column type="Html" title="Type:Html" fieldName="type:html"/>
    </ui:listView>
    <hr/>

    List, data does not map to specified columns
    <ui:listView id="test-list-data-does-not-map-to-specified-columns" aura:id="test-list-data-does-not-map-to-specified-columns" items="{!m.specifiedlistdata}">
        <ui:column type="Text" title="Non-matching column" fieldName="non-matching column"/>
    </ui:listView>
    <hr/>

    List, data partially maps to specified columns
    <ui:listView id="test-list-data-partially-maps-to-specified-columns" aura:id="test-list-data-partially-maps-to-specified-columns" items="{!m.specifiedlistdata}">
        <ui:column type="Text" title="Non-matching column" fieldName="non-matching column"/>
        <ui:column type="Text" title="Type:Text" fieldName="type:text"/>
    </ui:listView>
    <hr/>

    List, data fully maps to specified columns
    <ui:listView id="test-list-specified-columns" aura:id="test-list-specified-columns" items="{!m.specifiedlistdata}">
        <ui:column type="" title="Type:Empty String" fieldName="type:empty string"/>
        <ui:column title="Type:Undefined" fieldName="type:undefined"/>
        <ui:column type="Text" title="Type:Text" fieldName="type:text"/>
        <ui:column type="Email" title="Type:Email" fieldName="type:email"/>
        <ui:column type="Checkbox" title="Type:Checkbox" fieldName="type:checkbox"/>
        <ui:column type="Link" title="Type:Link" fieldName="type:link"/>
        <ui:column type="Index" title="Type:Index" fieldName="type:index"/>
        <ui:column type="Html" title="Type:Html" fieldName="type:html"/>
    </ui:listView>
    <hr/>

    List, data fully maps to nested, specified columns
    <ui:listView id="test-list-nested-columns" aura:id="test-list-nested-columns" items="{!m.nestedcolumnslistdata}">
        <ui:column title="First Row 0" fieldName="first row 0">
            <ui:column title="Second Row 0"  fieldName="second row 0">
                <ui:column title="Third Row 0, Leaf 0" fieldName="third row 0, leaf 0"/>
            </ui:column>
            <ui:column title="Second Row 1" fieldName="second row 1">
                <ui:column title="Third Row 1, Leaf 1" fieldName="third row 1, leaf 1"/>
                <ui:column title="Third Row 2, Leaf 2" fieldName="third row 2, leaf 2"/>
            </ui:column>
            <ui:column title="Second Row 2, Leaf 3"  fieldName="second row 2, leaf 3"/>
        </ui:column>
        <ui:column title="First Row 1, Leaf 4" fieldName="first row 1, leaf 4"/>
    </ui:listView>
    <hr/>

    List, data maps from non-leaf-node columns and should not appear in list
    <ui:listView id="test-list-nested-columns-fields-map-from-non-leaf-columns" aura:id="test-list-nested-columns-fields-map-from-non-leaf-columns" items="{!m.nestedcolumnsfieldsmapsfromnonleafnodecolumnslistdata}">
        <ui:column title="First Row 0" fieldName="first row 0">
            <ui:column title="Second Row 0"  fieldName="second row 0">
                <ui:column title="Third Row 0, Leaf 0" fieldName="third row 0, leaf 0"/>
            </ui:column>
            <ui:column title="Second Row 1" fieldName="second row 1">
                <ui:column title="Third Row 1, Leaf 1" fieldName="third row 1, leaf 1"/>
                <ui:column title="Third Row 2, Leaf 2" fieldName="third row 2, leaf 2"/>
            </ui:column>
            <ui:column title="Second Row 2, Leaf 3"  fieldName="second row 2, leaf 3"/>
        </ui:column>
        <ui:column title="First Row 1, Leaf 4" fieldName="first row 1, leaf 4"/>
    </ui:listView>
    <hr/>

    <ui:listView id="test-fireEvents-number" aura:id="test-fireEvents-number" items="{!m.generatedlistdata}" />
    <hr/>
    <ui:listView id="test-list-events-webdriver-test" aura:id="test-list-events-webdriver-test"
        items="{!m.generatedlistdata}"
        oncellclick="{!c.cellClickHandler}"
        onheaderclick="{!c.headerClickHandler}"
    ></ui:listView>
    <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
    <hr/>

</aura:application>
