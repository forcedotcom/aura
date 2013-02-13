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
<aura:application model="java://org.auraframework.component.ui.MenuTestModel">
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Checkbox - Metadata driven menu</h2>
        <ui:dropdown>
            <ui:menuTriggerLink aura:id="metadatatrigger" label="Snow Resorts"/>
            <ui:menu menuItems="{!m.resorts}"/>
        </ui:dropdown>
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Checkbox - Metadata driven menu source codes:</h2>
        <ui:outputText value='&#60;ui:dropdown&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink aura:id="metadatatrigger" label="Snow Resorts"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menu menuItems="{&#160;!m.resorts}"/&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:dropdown&#62;'/>      
    </div>
</div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Actions - Metadata driven menu</h2>
        <ui:dropdown>
            <ui:menuTriggerLink class="trigger" aura:id="trigger" label="Please pick your favorite soccer club"/>
            <ui:menu class="actionMenu" menuItems="{!m.places}" menuSelect="{!c.pickPlace}"/>
        </ui:dropdown> 
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Actions - Metadata driven menu source codes:</h2>
        <ui:outputText value='&#60;ui:dropdown&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink aura:id="metadataAction" label="Pick a ski place"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menu menuItems="{&#160;!m.places}" menuSelect="{&#160;!c.pickPlace}"/&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:dropdown&#62;'/>      
    </div>
</div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Example: how to get menu selected values</h2>
        <ui:dropdown>
            <ui:menuTriggerLink class="checkboxMenuLabel" aura:id="checkboxMenuLabel" label="NFC West Teams"/>
            <ui:menu class="checkboxMenu" aura:id="checkboxMenu" menuItems="{!m.data}"/>
        </ui:dropdown>
        <p/>
        <ui:button class="checkboxButton" aura:id="checkboxButton" press="{!c.getMenuSelected}" label="Check the selected menu items"/>
        <p/>
        <ui:outputText class="result" aura:id="result" value="Which items get selected"/>
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Source codes:</h2>
        <ui:outputText value='&#60;ui:dropdown&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink aura:id="metadatatrigger" label="Snow Resorts"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menu aura:id="myMenu" menuItems="{&#160;!m.data}"/&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:dropdown&#62;'/>
        <br/>
        <ui:outputText value='&#60;ui:button press="{&#160;!c.getMenuSelected}" label="Check the selected menu items"/&#62;'/>
        <br/>
        <ui:outputText value='&#60;ui:outputText aura:id="result" value="Which items get selected"/&#62;'/>
    </div>
</div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Example: custom Image Menu Item</h2>
        <ui:dropdown>
            <ui:menuTriggerLink aura:id="imageTrigger" class="imageLink" label="Tiger"/>
            <ui:menu aura:id="tigerMenu" class="inline" menuItems="{!m.images}" menuSelect="{!c.pickTiger}"/>
        </ui:dropdown>
   </div>
</div>
</aura:application>
