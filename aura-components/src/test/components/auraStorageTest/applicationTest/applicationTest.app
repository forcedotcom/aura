<aura:application template="auraStorageTest:indexedDBtemplate">

    <aura:attribute name="status" type="String" default="Waiting" />
    <aura:attribute name="refreshed" type="String" default="NO" />
    <aura:attribute name="actionComplete" type="Boolean" default="false"/>

    <aura:handler event="aura:applicationRefreshed" action="{!c.handleRefreshed}"/>
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>

    <aura:method name="addToStorage" action="c.addToStorage"/>
    <aura:method name="clearStoredAction" action="c.clearStoredAction"/>

    <div aura:id="iframeContainer" />

    Status: <span aura:id="status">{!v.status}</span><br/>
    Refreshed: <span aura:id="refreshed">{!v.refreshed}</span><br/>
    Action Complete: <span aura:id="actionComplete">{!v.actionComplete}</span><br/>
</aura:application>