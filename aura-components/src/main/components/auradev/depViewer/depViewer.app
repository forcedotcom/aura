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
<aura:application controller="java://org.auraframework.components.perf.DependenciesController">
    <aura:attribute name="app" type="String"/>
    <aura:attribute name="appDepsSize" type="String"/>
    <aura:attribute name="nodes" type="Map"/>
    <aura:attribute name="message" type="String"/>

    <aura:attribute name="paths" type="String[]"/>
    <aura:attribute name="uniqueDeps" type="Map"/>

    <aura:handler name="init" value="{!this}" action="{!c.getDeps}"/>

    <header>
        <h2>Application: {!v.app} </h2>
        <h3>Total App Dependencies Size: {!v.appDepsSize}</h3>

        <div>
        Usage:
        <code>
            /auradev/depViewer.app?app=markup://foo:bar<br/>
        </code>
        </div>
    </header>

    <aura:if isTrue="{!v.nodes}">
        <section>
            <ui:inputText aura:id="consumedCmp" placeholder="Component Descriptor" label="Find all caller paths "/>
            <ui:button label="Find" press="{!c.findAllCallerPaths}"/>
        </section>
        <section>
            <ui:button label="Show All Deps" press="{!c.findAllUniqueDeps}"/>
            <ui:inputCheckbox aura:id="uniqDepsOnly" label="Unique Dependencies Only" value="true"/>
        </section>
        <section>
            <ui:button label="Show All Client Library Deps" press="{!c.showClientLibraryDependencies}"/>
        </section>

        <section>
            {!v.message}
        </section>

        <table width="100%">
            <tbody aura:id="uniqDepsTable">
                <aura:iteration items="{!v.uniqueDeps}" var="item" indexVar="index">
                    <tr>
                        <td>{!index}</td>
                        <td>{!item.type}</td>
                        <td>{!item.descriptor}</td>
                        <td>{!item.ownSize}</td>
                        <td>{!item.uniqDepsSize}</td>
                        <td>{!item.uniqDeps}</td>
                    </tr>
                </aura:iteration>
            </tbody>
        </table>

        <ol>
            <aura:iteration items="{!v.paths}" var="path">
                <li>{!path}</li>
            </aura:iteration>
        </ol>

        <aura:set attribute="else">
            <ui:message aura:id="message" title="Loading (Reeeeeeaaaaaally hard)"></ui:message>
        </aura:set>

    </aura:if>

</aura:application>
