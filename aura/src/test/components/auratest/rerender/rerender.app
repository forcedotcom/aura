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
<aura:application model="java://org.auraframework.impl.java.model.TestJavaModel">
    <aura:attribute name="whichArray" type="String" default="v.emptyArray"/>
    <aura:attribute name="emptyArray" type="Aura.Component[]"/>

    <ui:outputURL aura:id="linkDef" label="#def" value="#def"/><br/>
    <ui:outputURL aura:id="linkDeath" label="#death" value="#death"/><br/>
    <ui:outputURL aura:id="linkEmpty" label="#empty" value="#empty"/><br/>

    which array: <ui:inputText value="{!v.whichArray}"/>
    <ui:button aura:id="pushText" label="push text" press="{!c.pushText}"/>
    <ui:button aura:id="pushComponent" label="push component" press="{!c.pushComponent}"/>
    <ui:button aura:id="reverse" label="reverse" press="{!c.reverse}"/>
    <ui:button aura:id="pop" label="pop" press="{!c.pop}"/>
    <ui:button aura:id="clear" label="clear" press="{!c.clear}"/>

    <auratest:rerenderChild aura:id="emptyArrayContainer" title="emptyArray = ">
        {!v.emptyArray}
    </auratest:rerenderChild>

    <auratest:rerenderChild aura:id="child1" title="child1">
        <auratest:rerenderChild aura:id="grandchild1" title="grandchild1">
            <br/><div class="boxed" aura:id="layoutTarget"/>
        </auratest:rerenderChild>
    </auratest:rerenderChild>

    <auratest:rerenderChild aura:id="child2" title="child2">
        <auratest:rerenderChild aura:id="grandchild2" title="grandchild2">
        </auratest:rerenderChild>
    </auratest:rerenderChild>
</aura:application>
