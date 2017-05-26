
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
<aura:application template="moduleTest:bootstrapTemplate" access="global" useAppcache="false">
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:attribute name="branch" type="Boolean" default="true" access="GLOBAL" />
    <aura:attribute name="test" type="String" default="I'm v.test" access="GLOBAL" />
    <aura:attribute name="test2" type="String" default="I'm v.test2" access="GLOBAL" />
    <aura:attribute name="test3" type="String" default="I'm v.test3" access="GLOBAL"/>
    <aura:attribute name="privItems" type="List" default="[{ label: '1' }, { label: '2' }]" access="GLOBAL"/>

    <aura:dependency resource="markup://moduleTest:testLib" type="LIBRARY"/>
    <aura:import library="moduleTest:simpleLib" property="simpleLib"/>
    <aura:import library="moduleTest:simpleCmp" property="simpleModule"/>
    <section>
        <ui:button aura:id="y" class="button-toggle" label="Toggle if - first modules container" press="{!c.toggle}" />
        <br/>
        <ui:button aura:id="t1" class="button-set1" label="Set v.test" buttonTitle="x" press="{!c.updateTest}" />
        <ui:button aura:id="t2" class="button-set2" label="Set v.test2" buttonTitle="x" press="{!c.updateTest2}" />
        <ui:button aura:id="t3" class="button-set3" label="Set v.test3" buttonTitle="x" press="{!c.updateTest3}" />
        <module:marker></module:marker>
        
        <section style="margin: 10px; border: 1px solid # ">
            <h3>Aura land!</h3>
            <p>[v.test]: <span class="a-res1">{!v.test}</span></p>
            <p>[v.test2]: <span class="a-res2">{!v.test2}</span></p>
            <p>[v.test3]: <span class="a-res3">{!v.test3}</span></p>
            <p>[expression]: <span class="a-expr">{! v.test3 + '!!' }</span></p>
        </section>
        
        <aura:if isTrue="{!v.branch}">
            <section class="aura" aura:id="container">
                <moduleTest:simpleCmp
                    aura:id="simple" 
                    literal="Hi!"
                    bound="{!v.test}"
                    nested="{!v.privItems[0].label}"
                    unbound="{#v.test2}"
                    expression="{! v.test3 + '!!' }"
                    callbackaction="{!c.cbAction}"
                    onpress="{!c.cbEvent}"
                />
            </section>
        </aura:if>

        <section class="aura">
            <moduleTest:compositeCmp
                aura:id="composite"
                literal="Hi2!"
                bound="{!v.test}"
                unbound="{#v.test2}"
                expression="{! v.test3 + '!!' }"
                callbackaction="{!c.cbAction}"
                onpress="{!c.cbEvent}"

            />
        </section>

        <p>Iteration:</p>

        <section class="aura">
             <aura:iteration items="{!v.privItems}" var="item">
                <moduleTest:simpleCmp
                    literal="{!item.label}" 
                    callbackaction="{!c.cbAction}"
                    onpress="{!c.cbEvent}"
                />
                <!-- <ui:button label="{!item.label}"></ui:button> -->
             </aura:iteration>
        </section>
    </section>
</aura:application>
