var AuraPerfPanel = function (initialData, containerId, options) {
    this.initialData = initialData;
    this.containerId = containerId;
    this.opts = options;
     this.init();
};

AuraPerfPanel.prototype = {
    init: function () {
        this.recording = false;
        this.commands = {
            'clearMarks': '$A.PerfDevTools.clearMarks()',
            'getCmpCreation': '$A.PerfDevTools.getComponentCreationProfile()'
        };
        this._bind();
        this.bootstrapWebInspectorPanel();
    },
    bootstrapWebInspectorPanel: function () {
        var id = this.containerId;
        var data = this.initialData;
        var options = this.options;

        // BOOTSTRAP WEBINSPECTOR
        var inspector = new WebInspector.Main(id, options || {});
        inspector._loaded();

        // Probably there is a way to do this without the setTimeout, 
        // but reverse engineer the hole WebInspector is painful...
        if(data) {
            setTimeout(function(){
                this._setWebInspectorData(data);
            }.bind(this), 100);
        }
    },
    _setWebInspectorData: function (data) {
        var type    = new WebInspector.CPUProfileType();
        var header  = new WebInspector.CPUProfileHeader(type);
        header.setProtocolProfile(data);
        WebInspector.panels.profiles.showProfile(header);
    },
    runOnInspectedWindow: function (command, callback) {
        callback || (callback = function () {console.log('runInspectedWindow:fakeCallback');});
        if (chrome.devtools) {
            chrome.devtools.inspectedWindow.eval(command, callback.bind(this));
        } else {
            callback.call(this, null, 'Devtools API not available');
        }
    },
    _bind: function () {
        this.recordButton = document.querySelector('.perf-tab .record-profile-status-bar-item');
        this.clearButton  = document.querySelector('.perf-tab .clear-status-bar-item');
        this.statsButton  = document.querySelector('.perf-tab .timeline-frames-status-bar-item');

        this.recordButton.addEventListener('click', this._toggleRecord.bind(this), false);
        this.clearButton.addEventListener('click', this._clearCPUProfile.bind(this), false);
        this.statsButton.addEventListener('click', this._showStats.bind(this), false);
    },
    _showStats: function () {
        this.runOnInspectedWindow(this.commands.getCmpCreation, function (data, exception) {
                if (!exception) {
                    this._setWebInspectorData(data);
                } else {
                    console.log(exception);
                    alert('Error getting marks inspected window');
                }
            });
    },
    _toggleRecord: function () {
        this.recordButton.classList.toggle('toggled-on');
        if (this.recording) {
            this.recording = false;
            this.runOnInspectedWindow(this.commands.getCmpCreation, function (data, exception) {
                if (!exception) {
                    this._setWebInspectorData(data);
                } else {
                    console.log(exception);
                    alert('Error getting marks inspected window');
                }
            });

        } else {
            // Start recording -> clear marks
            this.recording = true;
            this.runOnInspectedWindow(this.commands.clearMarks, function (result, exception) {
                if (exception) {
                    console.log(exception);
                    alert('Error clearing marks on inspected window');
                }
            });
        }
    },
    _clearCPUProfile: function () {
        WebInspector.panels.profiles.closeVisibleView();
    }
};