({
    /**
     * Verify ability to set loading box text, keeping style of box itself as the default.
     * 
     * Note that verification logic for the loading box being visible on load is in the template itself.
     */
    testCustomLoadingBoxPresentOnLoad: {
        test: function(cmp) {
            var loadingBox = document.getElementById("auraLoadingBox");
            var visible = loadingBox.offsetHeight > 0 && loadingBox.offsetWidth > 0;
            $A.test.assertFalse(visible, "Loading box should not be visible after load complete");
        }
    }
})
