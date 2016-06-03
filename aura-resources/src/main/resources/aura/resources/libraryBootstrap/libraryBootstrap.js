(function () {
    window.Aura || (window.Aura = {});
    window.Aura.frameworkLibrariesReady = true;
    if (window.Aura.afterLibrariesLoaded && window.Aura.afterLibrariesLoaded.length) {
        for (var i = 0; i < window.Aura.afterLibrariesLoaded.length; i++) {
            window.Aura.afterLibrariesLoaded[i]();
        }
    }
}());