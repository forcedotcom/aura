<aura:application> 
    <aura:attribute name="output" type="String" default="Ready, push any button please"/>

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
    
    <!-- aura clientLibrary, name is case sensitive -->
    <!-- <aura:clientLibrary name="clTestAppJS" type="JS" /> -->
    <!-- this won't load as we register the lib with name: CkEditor -->
    <aura:clientLibrary name="ckEDITOR" type="JS" />
    
	<ui:button press="{!c.tryOutMarkup}" label="press me to test markup" class="button_tryOutMarkup"/> 
	<ui:button press="{!c.tryOutDependency}" label="press me to test dependency" class="button_tryOutDependency"/> 
	<ui:button press="{!c.tryOutLibs}" label="press me to test Libs" class="button_tryOutLibs"/>
	<ui:button press="{!c.tryOutClientLibs}" label="press me to test ClientLibs" class="button_tryOutClientLibs"/> 
	
	<div class="div_output">
	   {!v.output}
	</div>
</aura:application>
