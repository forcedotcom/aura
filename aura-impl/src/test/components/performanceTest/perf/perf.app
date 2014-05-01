<aura:application preload="aura,ui,performanceTest">
    <aura:handler event="aura:locationChange" action="{!c.locationChange}" />
    <aura:handler event="aura:doneRendering" action="{!c.doneRendering}" />

    <div class="container" aura:id="container"/>

</aura:application>