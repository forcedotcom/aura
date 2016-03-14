<aura:application implements="ui:inputFileInterface">

    <aura:handler name="change" event="ui:inputFileChangeEvent" action="{! c.handleChange }" />
    <aura:attribute name="count" type="Integer" default="0" access="private" />

    <form name="myForm" action="" method="post" enctype="multipart/form-data">
        <ui:inputFile name="myInputFile" accept="{! v.accept }" maxSizeAllowed="{! v.maxSizeAllowed }"
                      multiple="{! v.multiple }" aura:id="inputFile"/>
    </form>
</aura:application>
