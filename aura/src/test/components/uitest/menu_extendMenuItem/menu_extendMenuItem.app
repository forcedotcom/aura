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
            <h2>Extends menuItem - Focus Test</h2>
            <ui:menu aura:id="uiMenu" class="clubMenu">
                <ui:menuTriggerLink class="trigger" aura:id="trigger" label="Please pick your favorite soccer club"/>
                <ui:menuList class="actionMenu" aura:id="actionMenu">
                    <uitest:menuItem_extend zclass="actionItem1" zlabel="Bayern München" aura:id="actionItem1" />
                    <uitest:menuItem_extend zclass="actionItem2" zlabel="FC Barcelona" aura:id="actionItem2"/>
                	<uitest:menuItem_extend zclass="actionItem3" zlabel="Inter Milan" aura:id="actionItem3"/>
                	<uitest:menuItem_extend zclass="actionItem4" zlabel="Manchester United" aura:id="actionItem4"/>
                </ui:menuList>
            </ui:menu>
    </div>
</aura:application>
