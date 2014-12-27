<aura:application>
    <aura:dependency resource="aura:*" />
    <aura:dependency resource="ui:*" />
    <aura:dependency resource="perf:*" />
    <aura:dependency resource="perfTest:*" />
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:handler event="aura:locationChange" action="{!c.locationChange}" />

    <div class="container" aura:id="container"/>
</aura:application>
