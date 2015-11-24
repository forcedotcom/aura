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
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>

    <aura:dependency resource="markup://uiExamples:modalContent" type="COMPONENT"/>
    <aura:dependency resource="markup://uiExamples:panelContent" type="COMPONENT"/>
    <aura:dependency resource="markup://uiExamples:panelFooter" type="COMPONENT"/>
    <aura:dependency resource="markup://uiExamples:panelHeader" type="COMPONENT"/>
    <aura:dependency resource="markup://ui:spinner" type="COMPONENT"/>

    <section class="viewport">
        <header class="header">
            <div class="container">
                <h1>Panels! Tooltips!</h1>
            </div>
        </header>
        <header class="site-masthead">
          <div class="container">
            <h1>Aura Panels &amp; Tooltips</h1>
          </div>
        </header>
        <div class="content container">
            <article>
                <h4>Panels</h4>
                <ui:button stateful="true" aura:flavor="flat" class="flat-btn" label="Modal" press="{!c.createModal}"></ui:button>
                <!-- <ui:button aura:flavor="flat" class="flat-btn" label="Full Screen Panel" press="{!c.createFullPanel}"/> -->
            </article>
            <article class="controls">
                <ui:button aura:flavor="flat" label="Large Modal (flavor)" class="flat-btn" press="{!c.createLargeModal}"/>
                <ui:button aura:flavor="flat" label="Lazy load content" class="flat-btn" press="{!c.lazyLoadPanel}"/>
                <ui:button aura:flavor="flat" label="Flavored Panel with a pointer" class='customer-header-button flat-btn' press="{!c.createPanelWithHeader}"/>
            </article>
            <article class="positioned">
                <h4>Positioned Panels</h4>
                <p>
                    <ui:button aura:flavor="flat" aura:id="southbutton" stateful="true" class="positioned-target flat-btn" label="South" press="{!c.openNotification}"/>
                </p>
                <p>
                    <ui:button aura:flavor="flat" class="positioned-target-east flat-btn" label="East" press="{!c.openEastPanel}"/>
                </p>
                <p class="west">
                    <ui:button aura:flavor="flat" class="positioned-target-west flat-btn" label="West" press="{!c.openWestPanel}"/>
                </p>
                <p>
                    <ui:button aura:flavor="flat" class="positioned-target-north flat-btn" label="North" press="{!c.openNorthPanel}"/>
                </p>
            </article>
            <article>
                <h4>Tooltips</h4>
                <p>This is a paragraph with a <ui:tooltip advanced="false" triggerClass="my-tt" tabIndex="-1" tooltipBody="This is a CSS-only tooltip, perfect for long lists. (long tooltips are ok too)" fadeInDuration="400">word</ui:tooltip> that has a tooltip on it.</p>
                <p><ui:tooltip aura:flavor="pop" triggerClass="my-tt" advanced="true" tooltipBody="The position adjusts to fit the viewport.">Here</ui:tooltip> is a tooltip that barely fits</p>
                <p><ui:tooltip fadeInDuration="500" fadeOutDuration="500" triggerClass="my-tt" advanced="true" direction="east" trigger="click" tooltipBody="Also it fades in!">This one</ui:tooltip> you trigger with a click</p>
                <p>This one is <ui:tooltip aura:flavor="pop" fadeInDuration="500" fadeOutDuration="500" direction="east" triggerClass="my-tt" advanced="true" tooltipBody="This is tooltip goes to the east, also supported: south and west!">east</ui:tooltip></p>
            </article>
        </div>
    </section>

    <section class="manager container">
        <ui:containerManager />
        <ui:panelManager2 aura:id="pm">
            <aura:set attribute="registeredPanels">
                <ui:panel alias="panel"/>
                <ui:modal alias="modal"/>
            </aura:set>
        </ui:panelManager2>
    </section>

</aura:application>
