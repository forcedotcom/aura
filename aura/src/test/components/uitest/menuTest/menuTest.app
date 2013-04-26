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
<div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Check Menu Position Test</h2>
        <ui:menu aura:id="uiMenu" class="checkPositionMenu">
            <ui:menuTriggerLink class="triggercheckPosition" aura:id="triggercheckPosition" label="Please pick your favorite soccer club"/>
            <ui:menuList class="checkPosition" aura:id="checkPosition">
                <ui:actionMenuItem class="checkPositionItem1" aura:id="checkPositionItem1" label="Bayern München" click="{!c.updateTriggerLabel}"/>
                <ui:actionMenuItem class="checkPositionItem2" aura:id="checkPositionItem2" label="FC Barcelona" click="{!c.updateTriggerLabel}" disabled="true"/>
                <ui:actionMenuItem class="checkPositionItem3" aura:id="checkPositionItem3" label="Inter Milan" click="{!c.updateTriggerLabel}"/>
                <ui:actionMenuItem class="checkPositionItem4" aura:id="checkPositionItem4" label="Manchester United" click="{!c.updateTriggerLabel}"/>
            </ui:menuList>
        </ui:menu> 
    </div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Your favorite soccer club</h2>
        <ui:menu aura:id="uiMenu" class="clubMenu">
            <ui:menuTriggerLink class="trigger" aura:id="trigger" label="Please pick your favorite soccer club"/>
            <ui:menuList class="actionMenu" aura:id="actionMenu">
                <ui:actionMenuItem class="actionItem1" aura:id="actionItem1" label="Bayern München" click="{!c.updateTriggerLabel}"/>
                <ui:actionMenuItem class="actionItem2" aura:id="actionItem2" label="FC Barcelona" click="{!c.updateTriggerLabel}" disabled="true"/>
                <ui:actionMenuItem class="actionItem3" aura:id="actionItem3" label="Inter Milan" click="{!c.updateTriggerLabel}"/>
                <ui:actionMenuItem class="actionItem4" aura:id="actionItem4" label="Manchester United" click="{!c.updateTriggerLabel}"/>
            </ui:menuList>
        </ui:menu> 
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Action menu source codes:</h2>
        <ui:outputText value='&#60;ui:menu&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink aura:id="trigger" label="Please pick your favorite soccer club"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menuList aura:id="actionMenu"&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem aura:id="actionItem1" label="Bayern München" click="{&#160;&#33;c.updateTriggerLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem aura:id="actionItem2" label="FC Barcelona" click="{&#160;&#33;c.updateTriggerLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem aura:id="actionItem3" label="Inter Milan" click="{&#160;&#33;c.updateTriggerLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem aura:id="actionItem4" label="Manchester United" click="{&#160;&#33;c.updateTriggerLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;/ui:menuList&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:menu&#62;'/>      
    </div>
</div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Your favorite football teams</h2>
        <ui:menu>
            <ui:menuTriggerLink class="checkboxMenuLabel" aura:id="checkboxMenuLabel" label="NFC West Teams"/>
            <ui:menuList aura:id="checkboxMenu" class="checkboxMenu">
                <ui:checkboxMenuItem class="checkboxItem1" aura:id="checkboxItem1" label="San Francisco 49ers"/>
                <ui:checkboxMenuItem class="checkboxItem2" aura:id="checkboxItem2" label="Seattle Seahawks"/>
                <ui:checkboxMenuItem class="checkboxItem3" aura:id="checkboxItem3" label="St. Louis Rams"/>
                <ui:checkboxMenuItem class="checkboxItem4" aura:id="checkboxItem4" label="Arizona Cardinals" disabled="true" selected="true"/>
            </ui:menuList>
        </ui:menu> 
        <p/>
        <ui:button class="checkboxButton" aura:id="checkboxButton" press="{!c.getMenuSelected}" label="Check the selected menu items"/>
        <p/>
        <ui:outputText class="result" aura:id="result" value="Which items get selected"/>
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Checkbox menu source codes:</h2>
        <ui:outputText value='&#60;ui:menu&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink aura:id="checkboxMenuLabel" label="NFC West Teams"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menuList aura:id="checkboxMenu"&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMenuItem aura:id="checkboxItem1" label="San Francisco 49ers"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMnuItem aura:id="checkboxItem2" label="Seattle Seahawks"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMenuItem aura:id="checkboxItem3" label="St. Louis Rams"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMenuItem aura:id="checkboxItem4" label="Arizona Cardinals" disabled="true" selected="true"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;/ui:menuList&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:menu&#62;'/>  
        <br/>
        <ui:outputText value='&#60;ui:button aura:id="checkboxButton" press="{&#160;!c.getMenuSelected}" label="Check the selected menu items"/&#62;'/>
        <br/>
        <ui:outputText value='&#60;ui:outputText aura:id="result" value="Which items get selected"/&#62;'/>    
    </div>
</div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Your favorite baseball teams</h2>
        <ui:menu>
            <ui:menuTriggerLink class="radioMenuLabel" aura:id="radioMenuLabel" label="National League West"/>
            <ui:menuList class="radioMenu" aura:id="radioMenu">
                <ui:radioMenuItem class="radioItem1" aura:id="radioItem1" label="San Francisco"/>
                <ui:radioMenuItem class="radioItem2" aura:id="radioItem2" label="LA Dodgers"/>
                <ui:radioMenuItem class="radioItem3" aura:id="radioItem3" label="Arizona"/>
                <ui:radioMenuItem class="radioItem4" aura:id="radioItem4" label="Diego" disabled="true"/>
                <ui:radioMenuItem class="radioItem5" aura:id="radioItem5" label="Colorado"/>
            </ui:menuList>
        </ui:menu>
        <p/>
        <ui:button class="radioButton" aura:id="radioButton" press="{!c.getRadioMenuSelected}" label="Check the selected menu items"/>
        <p/>
        <ui:outputText class="radioResult" aura:id="radioResult" value="Which items get selected"/> 
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Radio menu source codes:</h2>
        <ui:outputText value='&#60;ui:menu&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink aura:id="radioMenuLabel" label="National League West"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menuList aura:id="radioMenu"&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem aura:id="radioItem1" label="San Francisco"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMnuItem aura:id="radioItem2" label="LA Dodgers"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem aura:id="radioItem3" label="Arizona"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem aura:id="radioItem4" label="Diego" disabled="true"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem aura:id="radioItem5" label="Colorado"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;/ui:menuList&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:menu&#62;'/>    
        <br/>
        <ui:outputText value='&#60;ui:button aura:id="radioButton" press="{&#160;!c.getRadioMenuSelected}" label="Check the selected menu items"/&#62;'/>
        <br/>
        <ui:outputText value='&#60;ui:outputText aura:id="radioResult" value="Which items get selected"/&#62;'/>  
    </div>
</div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Example: Menu Item using Iteration</h2>
               		<ui:menu>
					  <ui:menuTriggerLink aura:id="iterationTrigger" label="iterationTrigger"/>
					  <ui:menuList aura:id="iterationRadioMenu">
					    <aura:iteration items="{!m.iterationItems}" var="item">
					        <ui:radioMenuItem label="{!item.label}" value="{!item.value}"/>
					    </aura:iteration>
					  </ui:menuList>
					</ui:menu>
        	<p/>
        <ui:button class="radioIterationButton" aura:id="radioIterationButton" press="{!c.getRadioIterationMenuSelected}" label="Check the selected menu items"/>
        <p/>
        <ui:outputText class="radioIterationResult" aura:id="radioIterationResult" value="Which items get selected"/> 
   	</div>
   	<div style="display:inline-block;width:50%;">
        <h2>Radio menu using Iteration source codes:</h2>
        <ui:outputText value='&#60;ui:menu&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink aura:id="iterationTrigger" label="iterationTrigger"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menuList aura:id="iterationRadioMenu"&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;aura:iteration items="{&#160;!m.iterationItems}" var="item"&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem label="{&#160;!item.label}" value="{&#160;!item.type} aura:id="{&#160;!item.auraId}/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;/aura:iteration&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;/ui:menuList&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:menu&#62;'/>    
        <br/>
        <ui:outputText value='&#60;ui:button aura:id="radioIterationButton" press="{&#160;!c.getRadioIterationMenuSelected}" label="Check the selected menu items"/&#62;'/>
        <br/>
        <ui:outputText value='&#60;ui:outputText aura:id="radioIterationResult" value="Which items get selected"/&#62;'/>  
    </div>
</div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>All together</h2>
        <ui:menu>
            <ui:menuTriggerLink aura:id="mytrigger" label="All teams"/>
            <ui:menuList>
                <ui:actionMenuItem label="Bayern München" click="{!c.updateLabel}"/>
                <ui:actionMenuItem label="FC Barcelona" click="{!c.updateLabel}"/>
                <ui:actionMenuItem label="Inter Milan" click="{!c.updateLabel}"/>
                <ui:actionMenuItem label="Manchester United" click="{!c.updateLabel}"/>
                <ui:menuItemSeparator/>
                <ui:checkboxMenuItem label="San Francisco 49ers"/>
                <ui:checkboxMenuItem label="Seattle Seahawks"/>
                <ui:checkboxMenuItem label="St. Louis Rams"/>
                <ui:checkboxMenuItem label="Arizona Cardinals"/>
                <ui:menuItemSeparator/>
                <ui:radioMenuItem label="San Francisco"/>
                <ui:radioMenuItem label="LA Dodgers"/>
                <ui:radioMenuItem label="Arizona"/>
                <ui:radioMenuItem label="San Diego"/>
                <ui:radioMenuItem label="Colorado"/>
            </ui:menuList>
        </ui:menu> 
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Mixed menu source codes:</h2>
        <ui:outputText value='&#60;ui:menu&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink label="All teams"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menuList&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem label="Bayern München" click="{&#160;&#33;c.updateLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem label="FC Barcelona" click="{&#160;&#33;c.updateLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem label="Inter Milan" click="{&#160;&#33;c.updateLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem label="Manchester United" click="{&#160;&#33;c.updateLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:menuItemSeparator/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMenuItem label="San Francisco 49ers"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMnuItem label="Seattle Seahawks"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMenuItem label="St. Louis Rams"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMenuItem label="Arizona Cardinals"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:menuItemSeparator/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem label="San Francisco 49ers"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMnuItem label="San Francisco Giants"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem label="Oakland As"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem label="Golden State Warriors"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;/ui:menuList&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:menu&#62;'/>      
    </div>
</div>
</aura:application>
