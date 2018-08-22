<aura:application implements="aura:URIDefinitionParameters">
    <aura:method name="getURIComponentDefinitionParameters" action="{!c.getParameters}"/>
    <aura:handler name="init" action="{!c.init}" value="{!this}"/>

    <span>Something here:</span>
    {!v.body}
</aura:application>