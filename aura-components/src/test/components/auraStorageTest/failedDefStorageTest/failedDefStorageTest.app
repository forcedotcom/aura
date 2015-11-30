<aura:application template="auraStorageTest:failedDefStorageTemplate">
    <aura:attribute name="dynamicallyCreated" type="Aura.Component[]"/>

    <!-- Dependency necessary to test client-side component creation that stays on the client -->
    <aura:dependency resource="markup://attributesTest:parent" type="COMPONENT"/>

    <ui:outputURL aura:id="outputUrl" label="Fake link" value="#clicked"/>
</aura:application>
