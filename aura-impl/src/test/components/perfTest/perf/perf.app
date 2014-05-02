<aura:application preload="aura,ui,perfTest">
	<aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:handler event="aura:locationChange" action="{!c.locationChange}" />
    <aura:handler event="aura:doneRendering" action="{!c.doneRendering}" />

    <div class="container" aura:id="container"/>

</aura:application>