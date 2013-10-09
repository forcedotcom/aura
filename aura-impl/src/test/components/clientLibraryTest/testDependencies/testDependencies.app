<aura:application render="client">
    <aura:attribute name="flipBit" default="true" type="boolean"/>
    <aura:clientLibrary name="endofBody" url="http://likeaboss.com/topOfBody.js" type="JS"/>
    <clientLibraryTest:testChild/>
    <clientLibraryTest:testInterface implNumber="1"/>
    <clientLibraryTest:testFacet/>
    <clientLibraryTest:testFacet/> <!--Duplicate facet -->
    
    <!-- It should be documented that aura:clientLibrary tag cannot be used inside a aura:renderIf-->
    <!--aura:renderIf isTrue="{!v.flipBit}">
        <aura:clientLibrary name="renderIf" url="http://likeaboss.com/renderIf.js" type="JS"/>
            <aura:set attribute="else">
                <aura:clientLibrary name="renderIfElse" url="http://likeaboss.com/renderIf/else.js" type="JS"/>
            </aura:set>
    </aura:renderIf-->
    
    <aura:clientLibrary name="endofBody" url="http://likeaboss.com/endOfBody.js" type="JS"/>
    <aura:clientLibrary name="duplicate" url="http://likeaboss.com/duplicate.js" type="JS"/>

    <!-- test modes -->
    <aura:clientLibrary url="http://likeaboss.com/mode.js" type="JS" modes="PTEST" />
</aura:application>