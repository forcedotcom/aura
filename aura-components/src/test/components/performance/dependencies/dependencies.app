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
<aura:application
    controller="java://org.auraframework.components.perf.DependenciesController"
    access="GLOBAL"
    useAppcache="false">


    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:handler name="press" event="ui:press" action="{!c.getCmpDependency}"/>
    <aura:attribute name="items" type="Object[]"/>
    <aura:attribute name="def" type="String"/>
    <aura:attribute name="cmpFilter" type="Boolean" default="true"/>
    <aura:attribute name="eventFilter" type="Boolean" default="true"/>
    <aura:attribute name="intfFilter" type="Boolean" default="true"/>
    <aura:attribute name="libFilter" type="Boolean" default="true"/>
    
    <section class="container" aura:id="container"> 
        <h1 style="padding: 5px; text-align: center;">Dependencies App </h1>
        <h3 style="text-align:center; margin: 20px 0">
            <code>$A.dependencies.list(['ui:button','ui:scroller'], {COMPONENT: true, LIBRARY: true, ...}, function (d) {console.log(d);})</code><br/>
        </h3>
        <p>
            <ui:button label="Get all descriptors (filters tests)" press="{!c.getAllCmpDescriptors}" /> | 
            <ui:button disabled="{!v.items.length == 0}" label="Get all dependencies (fetches one by one)" press="{!c.getCmpDependencies}" /> 
            <ui:inputCheckbox label="CMP" value="{!v.cmpFilter}"/>
            <ui:inputCheckbox label="EVENT" value="{!v.eventFilter}"/>
            <ui:inputCheckbox label="INTF" value="{!v.intfFilter}"/>
            <ui:inputCheckbox label="LIB" value="{!v.libFilter}"/>
        </p>

            <ui:virtualList aura:id="list" itemVar="item" items="{!v.items}">
                <aura:set attribute="itemTemplate">
                    <performance:dependencyItem index="{!item.index}" def="{!item.def}" dependencies="{!item.dependencies}" isOpen="{!item.isOpen}" />
                </aura:set>
                <ul class="deflist"/>
            </ui:virtualList>
    </section>
</aura:application>
