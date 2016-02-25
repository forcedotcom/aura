<aura:application access="public" render="client">
    <aura:clientLibrary name="CkEditor" type="JS" />
    <clientLibraryTest:testInterface implNumber="1"/>
    
    <!-- test modes -->
    <aura:clientLibrary name="random1" type="JS" modes="PTEST" />
    <aura:clientLibrary name="random2" type="JS" modes="PTEST" />
</aura:application>
