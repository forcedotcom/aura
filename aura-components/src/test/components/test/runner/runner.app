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
<aura:application>
    <aura:attribute name="scope" type="String"/>
    <aura:attribute name="keyword" type="String"/>
    <aura:attribute name="testStatus" type="List" default="[ { type:'none', count:'0' } ]"/>
    <aura:attribute name="testCount" type="Integer"/>
    <aura:attribute name="pageState" type="String" default="Loading, First load might be slow..." />
    <aura:attribute name="runStatus" type="String" default="Idle" />

    <div class="viewport">
        <header>
            <span class="icon-rocket"></span>
            <span class="title">
                <aura:if isTrue="{!v.scope == 'perf'}">
                    <span>Perf Test Runner | </span>
                    <a class="pt" href="?scope=func">Func</a>
                <aura:set attribute="else">
                    <span>Func Test Runner | </span>
                    <a class="pt" href="?scope=perf">Perf</a>
                </aura:set>    
                </aura:if>
                <span id="pageState">{!v.pageState}</span>
            </span>
        </header>
        <section class="center">
            <test:runnerContainer aura:id="container" scope="{!v.scope}" keyword="{!v.keyword}"
                status="{!v.pageState}" count="{!v.testCount}" testStatus="{!v.testStatus}"
                runStatus="{!v.runStatus}"/>
        </section>
        <footer>
            <span class="status-bar">{!v.runStatus}</span>
            <span id="test-stat">
                <aura:iteration items="{!v.testStatus}" var="i">
                    <b>Type: {!i.type}</b><span>{!i.count}</span>
                </aura:iteration>
            </span>
            <span id="count_test_selected"><b>Selected count:</b>{!v.testCount}</span>
        </footer>
    </div>
</aura:application>
