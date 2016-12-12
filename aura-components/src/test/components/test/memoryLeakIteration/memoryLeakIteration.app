<aura:application description="TODO">
    <aura:attribute name="items" type="String[]"/>

    <div>
        <ui:button label="New Items" press="c.newItems" />
        <ui:button label="Change Item 0" press="c.changeItem0" />
    </div>
    <aura:iteration items="{!v.items}" var="item">
       <test:memoryLeakItem item="{!item}" />
    </aura:iteration>
</aura:application>
