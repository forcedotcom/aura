({
    /**
     * Verify the default loading box defined in the template is present and visible on load and not visible
     * after load is complete.
     * 
     * Note that verification logic for the loading box being visible on load is in the template itself.
     */
    testLoadingBoxPresentOnLoad: {
        test: function(cmp) {
            var loadingBox = document.getElementById("auraLoadingBox");
            var visible = loadingBox.offsetHeight > 0 && loadingBox.offsetWidth > 0;
            $A.test.assertFalse(visible, "Loading box should not be visible after load complete");
        }
    }
})
