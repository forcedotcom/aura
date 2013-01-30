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
<aura:application>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Your favorite soccer club</h2>
        <ui:dropdown>
            <ui:menuTriggerLink aura:id="trigger" label="Please pick your favorite soccer club"/>
            <ui:menu>
                <ui:actionMenuItem label="Bayern München" click="{!c.updateTriggerLabel}" disabled="true"/>
                <ui:actionMenuItem label="FC Barcelona" click="{!c.updateTriggerLabel}" disabled="true"/>
                <ui:actionMenuItem label="Inter Milan" click="{!c.updateTriggerLabel}"/>
                <ui:actionMenuItem label="Manchester United" click="{!c.updateTriggerLabel}"/>
            </ui:menu>
        </ui:dropdown> 
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Action menu source codes:</h2>
        <ui:outputText value='&#60;ui:dropdown&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink label="Please pick your favorite soccer club"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menu&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem label="Bayern München" click="{&#160;&#33;c.updateTriggerLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem label="FC Barcelona" click="{&#160;&#33;c.updateTriggerLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem label="Inter Milan" click="{&#160;&#33;c.updateTriggerLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:actionMenuItem label="Manchester United" click="{&#160;&#33;c.updateTriggerLabel}"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;/ui:menu&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:dropdown&#62;'/>      
    </div>
</div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Your favorite football teams</h2>
        <ui:dropdown>
            <ui:menuTriggerLink label="NFC West Teams"/>
            <ui:menu>
                <ui:checkboxMenuItem label="San Francisco 49ers"/>
                <ui:checkboxMenuItem label="Seattle Seahawks"/>
                <ui:checkboxMenuItem label="St. Louis Rams"/>
                <ui:checkboxMenuItem label="Arizona Cardinals" disabled="true"/>
            </ui:menu>
        </ui:dropdown> 
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Checkbox menu source codes:</h2>
        <ui:outputText value='&#60;ui:dropdown&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink label="NFC West Teams"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menu&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMenuItem label="San Francisco 49ers"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMnuItem label="Seattle Seahawks"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMenuItem label="St. Louis Rams"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:checkboxMenuItem label="Arizona Cardinals"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;/ui:menu&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:dropdown&#62;'/>      
    </div>
</div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>Your favorite baseball teams</h2>
        <ui:dropdown>
            <ui:menuTriggerLink label="National League West"/>
            <ui:menu>
                <ui:radioMenuItem label="San Francisco"/>
                <ui:radioMenuItem label="LA Dodgers"/>
                <ui:radioMenuItem label="Arizona"/>
                <ui:radioMenuItem label="San Diego" disabled="true"/>
                <ui:radioMenuItem label="Colorado"/>
            </ui:menu>
        </ui:dropdown> 
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Radio menu source codes:</h2>
        <ui:outputText value='&#60;ui:dropdown&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink label="National League West"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menu&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem label="San Francisco"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMnuItem label="LA Dodgers"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem label="Arizona"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem label="San Diego"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#160;&#160;&#60;ui:radioMenuItem label="Colorado"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;/ui:menu&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:dropdown&#62;'/>      
    </div>
</div>
<hr/>
<p/>
<div style="margin:20px;">
    <div style="display:inline-block;width:50%;vertical-align:top;">
        <h2>All together</h2>
        <ui:dropdown>
            <ui:menuTriggerLink aura:id="mytrigger" label="All teams"/>
            <ui:menu>
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
            </ui:menu>
        </ui:dropdown> 
    </div>
    <div style="display:inline-block;width:50%;">
        <h2>Mixed menu source codes:</h2>
        <ui:outputText value='&#60;ui:dropdown&#62;'/>
        <br/>   
        <ui:outputText value='&#160;&#160;&#60;ui:menuTriggerLink label="All teams"/&#62;'/>
        <br/>
        <ui:outputText value='&#160;&#160;&#60;ui:menu&#62;'/>
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
        <ui:outputText value='&#160;&#160;&#60;/ui:menu&#62;'/>
        <br/>
        <ui:outputText value='&#60;/ui:dropdown&#62;'/>      
    </div>
</div>
</aura:application>
