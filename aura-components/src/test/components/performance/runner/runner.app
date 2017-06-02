<aura:application access="Global">
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:handler event="aura:locationChange" action="{!c.locationChange}" />
    <aura:handler name="finish" event="performance:testFinish" action="{!c.finish}"/>
    <aura:method name="run"/>
    <aura:method name="setup"/>
    <aura:import library="performance:perfLib" property="lib" />

    <div class="container" aura:id="container"/>
</aura:application>
