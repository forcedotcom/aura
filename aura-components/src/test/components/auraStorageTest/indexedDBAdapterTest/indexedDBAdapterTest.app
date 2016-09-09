<aura:application render="client">
    <aura:import library="auraStorageTest:storageTestLib" property="storageLib" />
    <aura:import library="auraStorageTest:iframeTestLib" property="iframeLib" />
    <aura:dependency resource="markup://auraStorageTest:persistentStorage" type="APPLICATION"/>
    <div aura:id="content" />

    <div aura:id="iframeContainer" />
</aura:application>
