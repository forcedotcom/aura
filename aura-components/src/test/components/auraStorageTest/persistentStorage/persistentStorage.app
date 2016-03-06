<aura:application>
    <aura:attribute name="log" type="String" default="" description="Required attribute by auraStorageTest:iframeTestLib:iframeTest.js" />

    <aura:attribute name="secure" type="Boolean" default="false" />
    <aura:attribute name="key" type="String" default="default key"/>
    <aura:attribute name="value" type="String" default="default value" />
    <aura:attribute name="return" type="String" default="No value"/>
    <aura:attribute name="status" type="String" default="Waiting"/>

    <aura:handler name="init" value="{!this}" action="{!c.init}"/>

    <aura:method name="addToStorage" action="c.addToStorage"/>
    <aura:method name="getFromStorage" action="c.getFromStorage"/>
    <aura:method name="resetStorage" action="c.resetStorage"/>
    <aura:method name="deleteStorage" action="c.deleteStorage"/>

    <aura:method name="setEncryptionKey">
        <aura:attribute type="String" name="encryptionKey"/>
    </aura:method>

    Status: <span aura:id="status">{!v.status}</span><br/>
    Storage output: <span aura:id="output">{!v.return}</span>
</aura:application>
