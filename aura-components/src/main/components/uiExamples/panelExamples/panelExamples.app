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
    <aura:dependency resource="markup://uiExamples:panelHeader" type="COMPONENT"/>
    <aura:dependency resource="markup://uiExamples:panelFooter" type="COMPONENT"/>
    <aura:dependency resource="markup://ui:spinner" type="COMPONENT"/>

    <section class="viewport">
        <header>
            <nav>
                <a aura:id="notification" onclick="{!c.openNotification}">Notification</a>
            </nav>
        </header>

        <div class="controls">
            <ui:button label="Create panelType: panel, flavor: custom" class='customer-header-button' press="{!c.createPanelWithHeader}"/>
            <ui:button label="Create panelType: panel, flavor: full screen" press="{!c.createFullPanel}"/>
            <ui:button label="Create panelType: modal" press="{!c.createModal}"/>
            <ui:button label="Create panelType: modal, flavor: large" press="{!c.createLargeModal}"/>
            <ui:button label="Update content after panel created" press="{!c.lazyLoadPanel}"/>
        </div>

        <footer/>

    </section>

    <section class="managerContainers">
        <ui:panelManager2 aura:id="pm" useSharedContainer="true">
            <aura:set attribute="registeredPanels">
                <ui:panel alias="panel"/>
                <ui:modal alias="modal"/>
            </aura:set>
        </ui:panelManager2>

        <ui:containerManager/>
    </section>

</aura:application>
