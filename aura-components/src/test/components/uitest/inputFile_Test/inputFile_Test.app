<aura:application implements="ui:inputFileInterface">

    <aura:handler name="change" event="ui:inputFileChangeEvent" action="{! c.handleChange }" />

    <aura:attribute name="count"               type="Integer" default="0" access="private" />
    <aura:attribute name="lastChangeEvent"     type="Object"              access="private" />
    <aura:attribute name="includeFormInsideOf" type="Boolean" default="false"              />

    <aura:if isTrue="{! v.includeFormInsideOf }">
        <!--version with form element inside -->
        <ui:inputFile name="myInputFile" accept="{! v.accept }" maxSizeAllowed="{! v.maxSizeAllowed }"
                      multiple="{! v.multiple }" includeFormElement="{! v.includeFormInsideOf }" aura:id="inputFile"/>

        <aura:set attribute="else">
            <!-- version with form element outside -->
            <form name="myForm" action="" method="post" enctype="multipart/form-data">
                <ui:inputFile name="myInputFile" accept="{! v.accept }" maxSizeAllowed="{! v.maxSizeAllowed }"
                              multiple="{! v.multiple }" includeFormElement="{! v.includeFormInsideOf }" aura:id="inputFile">
                    <!--inputFile body facet defined, that means custom inner content -->
                    <h1>My custom inputFile</h1>
                    <hr />
                    <div class="extraContainer">
                        <uitest:inputFileCustomBody />
                    </div>
                    <ui:inputFileOpenBrowse>
                        <a>Open here too !!!</a>
                    </ui:inputFileOpenBrowse>
                    <uitest:inputFileCustomBody />
                </ui:inputFile>
            </form>
            <ui:button label="Reset" press="{! c.clear }"/>
        </aura:set>
    </aura:if>

</aura:application>
