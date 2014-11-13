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
<aura:application model="java://org.auraframework.component.ui.MenuTestModel">
<aura:attribute name="eventBubbled" type="boolean"/>
<aura:attribute name="stopClickPropagation" type="Boolean"/>
<div style="display:inline-block;width:50%;vertical-align:top;" onclick="{!c.clickPress}">
        <h2>Event bubbling is sets</h2>
        <ui:menu aura:id="uiMenu" class="clubMenu">
            <ui:menuTriggerLink class="trigger" aura:id="trigger" label="Please pick your favorite soccer club" stopClickPropagation="{!v.stopClickPropagation}"/>
            <ui:menuList class="actionMenu" aura:id="actionMenu">
                <ui:actionMenuItem class="actionItem1" aura:id="actionItem1" label="Bayern München" click="{!c.updateTriggerLabel}" hideMenuAfterSelected="{!v.hideMenuAfterSelected}"/>
                <ui:actionMenuItem class="actionItem2" aura:id="actionItem2" label="FC Barcelona" click="{!c.updateTriggerLabel}" disabled="true"/>
                <ui:actionMenuItem class="actionItem3" aura:id="actionItem3" label="Inter Milan" click="{!c.updateTriggerLabel}" hideMenuAfterSelected="{!v.hideMenuAfterSelected}"/>
                <ui:actionMenuItem class="actionItem4" aura:id="actionItem4" label="Manchester United" click="{!c.updateTriggerLabel}"/>
            </ui:menuList>
        </ui:menu> 
</div>
<hr/>
<ui:outputText aura:id="outputStatus" value="Event Propogation To Parent Div did not happen"/> <br/><br/>
<ui:button label="Toggle stopClickPropagation" press="{!c.toggle}"/>
</aura:application>