<aura:application>
  <aura:import library="lockerPerformance:harness" property="harness"/>

  <aura:import library="lockerPerformance:testHarness" property="testHarness"/>
  <aura:import library="lockerPerformance:testJS" property="testJS"/>
  <aura:import library="lockerPerformance:testDOM" property="testDOM"/>
  <aura:import library="lockerPerformance:testAura" property="testAura"/>
  <aura:import library="lockerPerformance:testLibs" property="testLibs"/>
  <!-- <aura:import library="lockerPerformance:testLWC" property="testLWC"/> -->

  <aura:attribute name="plan" type="Object[]"/>

  <aura:handler name="init" value="{!this}" action="{!c.init}"/>

  <article>
    <h1>LockerService Key Performance Indicators</h1>

    <lockerPerformance:grid aura:id="grid" plan="{!v.plan}"/>
  </article>

</aura:application>
