<aura:application access="public" render="client">
    <aura:clientLibrary name="endofBody" url="http://likeaboss.com/topOfBody.js" type="JS"/>
    <clientLibraryTest:testChild/>
    <clientLibraryTest:testInterface implNumber="1"/>
    <clientLibraryTest:testFacet/>
    <clientLibraryTest:testFacet/> <!--Duplicate facet -->
    
    <!-- aura:clientLibrary tag cannot be used inside a aura:renderIf-->
    
    <aura:clientLibrary name="endofBody" url="http://likeaboss.com/endOfBody.js" type="JS"/>
    <aura:clientLibrary name="duplicate" url="http://likeaboss.com/duplicate.js" type="JS"/>

    <!-- test modes -->
    <aura:clientLibrary url="http://likeaboss.com/mode.js" type="JS" modes="PTEST" />
</aura:application>