<aura:application>
    <aura:attribute name="log" type="String" default="" description="Required attribute by auraStorageTest:iframeTestLib:iframeTest.js" />

    <aura:attribute name="secure" type="Boolean" default="false" />
    <aura:attribute name="storageName" type="String" default="persistentStorageCmp" />

    <aura:handler name="init" value="{!this}" action="{!c.init}"/>

    Target Storage: <span>{!v.storageName}</span><br/>
    Secure: <span>{!v.secure}</span>
</aura:application>
