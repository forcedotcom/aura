<aura:application render="client" useAppcache="true" access="global">

    <aura:clientLibrary name="CkEditor" type="JS" />

    <aura:clientLibrary name="clTestAppJS" url="js://clientLibraryTest.clientLibraryTest" type="JS" />
    <aura:clientLibrary name="clTestAppCSS" url="css://clientLibraryTest.clientLibraryTest" type="CSS" combine="true" />

    <div class='identifier clientLibraryTestStyle' />
    <div class='PerfCssIdentifier PerfAbsolute'/>

    <aura:clientLibrary name="UIPerfCsS" type="CSS" modes="STATS" />
</aura:application>