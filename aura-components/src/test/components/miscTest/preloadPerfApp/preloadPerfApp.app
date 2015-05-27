<aura:application render="client">
    <aura:dependency resource="miscTest:*" />
    <ui:button label="Push component to page" press="{!c.pushComponent}"/>
    <div aura:id="placeHolder" class="placeholder"/>
</aura:application>
