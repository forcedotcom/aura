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
                <ui:button label="Modal" press="{!c.createModal}"></ui:button>
                <ui:button label="Full Screen Panel" press="{!c.createFullPanel}"/>
            </article>
            <article class="positioned">
                <h4>Positioned Panels</h4>
                <p>
                    <ui:button class="positioned-target" label="South" press="{!c.openNotification}"/>
                </p>
                <p>
                    <ui:button class="positioned-target-east" label="East" press="{!c.openEastPanel}"/>
                </p>
                <p class="west">
                    <ui:button class="positioned-target-west" label="West" press="{!c.openWestPanel}"/>
                </p>
                <p>
                    <ui:button class="positioned-target-north" label="North" press="{!c.openNorthPanel}"/>
                </p>
            </article>
            <article>
                <h4>Tooltips</h4>
                <p>This is a paragraph with a <ui:tooltip triggerClass="my-tt" tooltipBody="This is a CSS-only tooltip, perfect for long lists. (long tooltips are ok too)">word</ui:tooltip> that has a tooltip on it.</p>
                <p><ui:tooltip triggerClass="my-tt" advanced="true" tooltipBody="The position adjusts to fit the viewport.">Here</ui:tooltip> is a tooltip that barely fits</p>
                <p><ui:tooltip fadeInDuration="500" fadeOutDuration="500" triggerClass="my-tt" advanced="true" trigger="click" tooltipBody="Also it fades in!">This one</ui:tooltip> you trigger with a click</p>
                <p>This one is <ui:tooltip fadeInDuration="500" fadeOutDuration="500" direction="east" triggerClass="my-tt" advanced="true" trigger="click" tooltipBody="This is tooltip goes to the east, also supported: south and west!">east</ui:tooltip></p>
            </article>
        </div>
    </section>

    <section class="manager container">
        <ui:panelManager2 aura:id="pm">
            <aura:set attribute="registeredPanels">
                <ui:panel alias="panel"/>
                <ui:modal alias="modal"/>
            </aura:set>
        </ui:panelManager2>
    </section>

</aura:application>
