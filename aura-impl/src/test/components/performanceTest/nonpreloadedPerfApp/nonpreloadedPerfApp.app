<aura:application render="client" securityProvider="java://org.auraframework.java.securityProvider.LaxSecurityProvider">
    <ui:button label="Push component to page" press="{!c.pushComponent}"/>
    <div aura:id="placeHolder" class="placeholder"/>
</aura:application>