({
    getLoadedScriptMessage: function() {
        return "aura:library loaded and attached to the helper via the 'libraryDoc' property."
            + " The result of invoking libraryDoc.MyLib.getValue() is: \"" + 
            this.libraryDoc.MyLib.getValue() + "\"";
    }
})