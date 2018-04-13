<!-- is an app to prevent client-side creation -->
<aura:application>
	<aura:attribute name="todayLabel" type="String" default="{!$Label.Related_Lists.task_mode_today}"/>
	<p>Original today label: <span>{!v.todayLabel}</span></p>
    <moduleTest:schemaLabel aura:id="schema-label"></moduleTest:schemaLabel>
</aura:application>