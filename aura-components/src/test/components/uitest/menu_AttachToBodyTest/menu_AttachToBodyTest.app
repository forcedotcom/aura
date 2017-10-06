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
<aura:application model="java://org.auraframework.components.ui.MenuItemsTestModel">
<aura:attribute name="expandEventFired" type="boolean" default="false"/>
<aura:attribute name="collapseEventFired" type="boolean" default="false"/>
<div style="display:inline-block;width:50%;vertical-align:top;overflow:hidden;">
        <h2>Attach MenuList To Body - Test Keyboard Interaction</h2>
        <ui:menu aura:id="uiMenu" class="clubMenu">
            <ui:menuTriggerLink class="trigger" aura:id="trigger" label="Please pick your favorite soccer club"/>
            <ui:menuList class="actionMenu" aura:id="actionMenu" attachToBody="true">
                <ui:actionMenuItem class="actionItem1" aura:id="actionItem1" label="Bayern München" click="{!c.updateTriggerLabel}"/>
                <ui:actionMenuItem class="actionItem2" aura:id="actionItem2" label="FC Barcelona" click="{!c.updateTriggerLabel}" disabled="true"/>
                <ui:actionMenuItem class="actionItem3" aura:id="actionItem3" label="Inter Milan" click="{!c.updateTriggerLabel}"/>
                <ui:actionMenuItem class="actionItem4" aura:id="actionItem4" label="Manchester United" click="{!c.updateTriggerLabel}"/>
            </ui:menuList>
        </ui:menu>  
</div>
<hr/>
<p/>
	<ui:block aura:id="overflowHidden">
		<aura:set attribute="right">
		<div style="display:inline-block;vertical-align:top;overflow:hidden;">
        <h2>Attach MenuList To Body - Test Menu Position</h2>
        <ui:menu aura:id="uiMenuAttachToBody" class="uiMenuAttachToBody">
            <ui:menuTriggerLink class="triggerAttachToBody" aura:id="triggerAttachToBody" label="Please pick your favorite soccer club"/>
            <ui:menuList class="actionMenuAttachToBody" aura:id="actionMenuAttachToBody" attachToBody="true">
                <ui:actionMenuItem class="actionItemAttachToBody1" aura:id="actionItemAttachToBody1" label="Bayern München" click="{!c.updateTriggerLabelForAttachToBody}"/>
                <ui:actionMenuItem class="actionItemAttachTBody2" aura:id="actionItemAttachToBody2" label="FC Barcelona" click="{!c.updateTriggerLabelForAttachToBody}" disabled="true"/>
                <ui:actionMenuItem class="actionItemAttachToBody3" aura:id="actionItemAttachToBody3" label="Inter Milan" click="{!c.updateTriggerLabelForAttachToBody}"/>
                <ui:actionMenuItem class="actionItemAttachToBody4" aura:id="actionItemAttachToBody4" label="Manchester United" click="{!c.updateTriggerLabelForAttachToBody}"/>
            </ui:menuList>
        </ui:menu> 
		</div>
		 </aura:set>
	 		<div id="bodyBlockDiv">div in block body</div>
	</ui:block>
    <div style="margin-top:99vh;">
        <ui:block aura:id="longList">
            <ui:menu aura:id="uiLongMenuOpenTop" class="uiLongMenuOpenTop">
                <ui:menuTriggerLink aura:id="triggerUILongMenuOpenTop" label="Please pick your favorite soccer club"/>
                <ui:menuList class="actionUILongMenuOpenTop" aura:id="actionUILongMenuOpenTop" attachToBody="true">
                    <ui:actionMenuItem label="Bayern München" />
                    <ui:actionMenuItem label="FC Barcelona"  />
                    <ui:actionMenuItem label="Inter Milan" />
                    <ui:actionMenuItem label="Manchester United" />
                    <ui:actionMenuItem label="Bayern München" />
                    <ui:actionMenuItem label="FC Barcelona"  />
                    <ui:actionMenuItem label="Inter Milan" />
                    <ui:actionMenuItem label="Manchester United" />
                    <ui:actionMenuItem label="Bayern München" />
                    <ui:actionMenuItem label="FC Barcelona"  />
                    <ui:actionMenuItem label="Inter Milan" />
                </ui:menuList>
            </ui:menu>
        </ui:block>
    </div>
    <div>
        <ui:block aura:id="longList">
            <aura:set attribute="right">
                <ui:menu aura:id="uiLongMenuOpenBottom" class="uiLongMenuOpenBottom">
                    <ui:menuTriggerLink aura:id="triggerUILongMenuOpenBottom" label="Please pick your favorite soccer club"/>
                    <ui:menuList class="actionUILongMenuOpenBottom" aura:id="actionUILongMenuOpenBottom" attachToBody="true">
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                        <ui:actionMenuItem label="Manchester United" />
                        <ui:actionMenuItem label="Bayern München" />
                        <ui:actionMenuItem label="FC Barcelona"  />
                        <ui:actionMenuItem label="Inter Milan" />
                    </ui:menuList>
                </ui:menu>
            </aura:set>
        </ui:block>
    </div>
</aura:application>
