<aura:application template="auraStorageTest:versionTemplate">

    <aura:attribute name="defaultExpiration" type="Integer" default="50"/>
    <aura:attribute name="defaultAutoRefreshInterval" type="Integer" default="60"/>
    <aura:attribute name="persistent" type="Boolean" default="false"/>
    <aura:attribute name="version" type="String" default=""/>

    <!--Control the values per test case-->
    <auraStorage:init debugLoggingEnabled="true"
        name="cmpStorage"
        secure="true"
        persistent="{!v.persistent}"
        defaultExpiration="{!v.defaultExpiration}"
        defaultAutoRefreshInterval="{!v.defaultAutoRefreshInterval}"
        version="{!v.version}"/>
</aura:application>