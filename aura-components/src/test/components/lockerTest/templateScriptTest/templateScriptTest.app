<aura:application template="lockerTest:templateScriptTestTemplate" implements="aura:requireLocker">
    <aura:attribute name="testUtils" type="Object" description="Test utility with assert methods defined" />

    <aura:method name="testScriptInAppIsBlocked"/>
    <aura:method name="testScriptsInTemplateExecuted"/>
    <aura:method name="testScriptsInTemplatePreInitBlock"/>

     <!--  this will get blocked by CSP rules-->
    <script>window._appWindow = window + ""</script>

    <div aura:id="appHtml">In .app</div>

</aura:application>
