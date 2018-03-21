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
    useAppcache="false">


    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
        
    <aura:attribute name="def" type="String"/>
    <aura:attribute name="dependencies" type="List"/>
    <aura:attribute name="processing" type="Boolean" default="false"/>
    <aura:attribute name="error" type="String"/>
    <aura:attribute name="metrics" type="Map"/>
    <aura:attribute name="state" type="Map" default="{}"/>

    <header>
        <h1>Trace Dependencies App </h1>
        <blockquote>
            <h3>
                Usage
            </h3>
            <code>
                /auradev/traceDependencies.app?def=markup://foo:bar<br/>
                /auradev/traceDependencies.app?def=js://foo:bar@HELPER<br/>
            </code>
        </blockquote>
        <div class="error">{!v.error}</div>


        <aura:if isTrue="{! !empty(v.def) }">        
            <h2>
                Showing ({! v.dependencies.length }) Dependencies for: <span>{!v.def}</span>
            </h2>
        </aura:if>
        <aura:if isTrue="{! !empty(v.metrics) }">
            <table>
            <aura:iteration items="{!v.metrics.counts}" var="item">
                <tr>
                    <td>{!item.defType}</td>
                    <td>{!item.count}</td>
                </tr>
            </aura:iteration>
            </table>
        </aura:if>

    </header>
        
    <section class="container" aura:id="container"> 
             <aura:if isTrue="{! !v.processing &amp;&amp; !empty(v.def) &amp;&amp; empty(v.dependencies) }">
                <div class="error"><b>No dependencies detected for {!v.def}</b></div>
            </aura:if>

            <table width="100%">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Dependency</th>
                        <th>uid</th>
                        <th>ownHash</th>
                        <th>bundle</th>
                        <th>error</th>
                    </tr>
                </thead>
                <tbody aura:id="table">
                    <aura:iteration items="{!v.dependencies}" var="item">
                        <tr>
                            <td>{!item.defType}</td>
                            <td><a href="{! '?def=' + item.descriptor + '@' + item.defType}">{#item.descriptor}</a></td>
                            <td>{!item.uid}</td>
                            <td>{!item.hash}</td>
                            <td>{!item.bundleName}</td>
                            <td>{!item.error}</td>
                        </tr>
                    </aura:iteration>
                    

                </tbody>
            </table>
        
    </section>
</aura:application>
