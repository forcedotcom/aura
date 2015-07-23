<aura:application template="auraStorageTest:noGetApplicationCacheTemplate">
    <aura:attribute name="status" type="String" default="Waiting" />
    <aura:attribute name="fromStorage" type="String" default="Waiting" />

    <aura:handler name="init" value="{!this}" action="{!c.init}"/>

    <div aura:id="iframeContainer" />

    Status: <span aura:id="status">{!v.status}</span><br/>
</aura:application>