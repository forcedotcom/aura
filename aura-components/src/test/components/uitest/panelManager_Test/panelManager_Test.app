<aura:application>
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:dependency resource="markup://uitest:panel2Content" type="COMPONENT"/>
    <div class="container" aura:id="container">

        <section class="viewport">
            <ui:panelManager2 aura:id="pm">
                <aura:set attribute="registeredPanels">
                    <uitest:panel2 alias="myPanel2"/>
                </aura:set>
            </ui:panelManager2>
        </section>
        <section class="controls">
            <ui:button label="Create panelType: myPanel2" press="{!c.createP2}"/>
        </section>
        <section aura:id="test"/>
    </div>
</aura:application>
