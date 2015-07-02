<aura:application render="client">
    <aura:import library="auraStorageTest:storageTestLib" property="lib" />

    <aura:dependency resource="markup://auraStorageTest:indexedDBCmp"/>
    <div aura:id="content" />

    <div aura:id="iframeContainer" />
</aura:application>
