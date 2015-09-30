<aura:application access="global" implements="performance:test">

    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:import library="performance:perfLib" property="lib" />

    <section aura:id="container">
        <div style="margin: 10px; padding:10px; border: 1px solid black">
            <p>Runner App Example Performance Test!</p>
            <ui:image aura:id="image" src="/auraFW/resources/aura/auralogo.png" alt="logo"/>
            <p>Loaded async component:  <span style="color:green">{!v.loaded}</span> </p>
        </div>
    </section>
</aura:application>