<aura:application template="uriAddressable:uriAppTemplate">
    <aura:attribute name="dynamic" type="Aura.Component"/>
    <aura:attribute name="dynamic2" type="Aura.Component"/>
    <aura:attribute name="dynamicallyCreatedValue" type="String" default="Some text"/>
    <aura:attribute name="dynamicallyCreatedDescriptor" type="String" default="uriAddressable:dynamicallyCreated"/>
    <div aura:id="dynamicRendered">
        {!v.dynamic}
    </div>
    <script src="/auraCmpDef?_uid=LATEST&amp;_def=markup://uriAddressable:externallyCreated&amp;aura.app=markup://uriAddressable:uriApp"/>
    <hr/>

    <div>Load dynamic component</div>
    <div>Value: <ui:inputText value="{!v.dynamicallyCreatedValue}" /></div>
    <div>Descriptor: <ui:inputText value="{!v.dynamicallyCreatedDescriptor}" /></div>
    <ui:button label="Create component with framework" press="{!c.createComponent}"/>
    <ui:button label="Create component with action" press="{!c.createComponentAction}"/>
    <div aura:id="dynamicRendered2">
        {!v.dynamic2}
    </div>
</aura:application>
