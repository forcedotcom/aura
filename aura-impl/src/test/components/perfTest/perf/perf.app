<aura:application preload="aura,ui,perf,perfTest">
	<aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:handler event="aura:locationChange" action="{!c.locationChange}" />

    <div class="container" aura:id="container"/>

</aura:application>