<aura:application> 
    <!-- markup is case non-sensitive, this will include hasBody -->
	<componentTest:HASBody/>
	
	<!-- however the namespace is case sensitive, IF we haven't cache it with right case already -->
	<componentTEST:hasBody/>
	<auraTEST:TESTMarkupCaseSensitivityOuterCmp/>

    <!-- dependency is case non-sensitive, this will load the 'correct' dependency withpreload -->
    <aura:dependency resource="appCache:WITHPRELOAD" type="APPLICATION"/> 

    <!-- aura:import library, library name is case sensitive , property name is case sensitive --> 
    <!-- 
        W-2890141: load this first, then open test_Library.lib, change *ALL* "basicFirst" to "BAsicFirst", it works fine
        however, stop the server, do above, then start the server, load this app, it won't load at all.
    -->
    <aura:import library="test:test_Library" property="importED" /> 
    <aura:import library="test:TEST_Library" property="importedWithWrongCase" /> 
    
    <!-- aura clientLibrary, name is case sensitive, url is case sensitive -->
    <aura:clientLibrary name="clTestAppJS" url="js://clientLibraryTest.clientLibraryTest" type="JS" />
    <aura:clientLibrary name="clTestAppCSS" url="css://clientLibraryTest.clientLibraryTest" type="CSS" combine="true" />
    <aura:clientLibrary name="CkEditor" type="JS" />
    <!-- this won't load as we register the lib as UIPerf -->
    <aura:clientLibrary name="uiPerf" type="JS" />
    
    
	<ui:button press="{!c.tryOutMarkup}" label="press me to test markup"/> 
	<ui:button press="{!c.tryOutDependency}" label="press me to test dependency"/> 
	<ui:button press="{!c.tryOutLibs}" label="press me to test Libs"/>
	<ui:button press="{!c.tryOutClientLibs}" label="press me to test ClientLibs"/> 
</aura:application>