<aura:application template="auraStorageTest:failedDefStorageTemplate">
    <aura:attribute name="dynamicallyCreated" type="Aura.Component[]"/>

    <aura:import library="auraStorageTest:storageTestLib" property="storageTestLib" />

    <!-- Dependency necessary to test client-side component creation that stays on the client -->
    <aura:dependency resource="markup://ui:button" type="COMPONENT"/>

    <ui:outputURL aura:id="outputUrl" label="Fake link" value="#clicked"/>
</aura:application>
