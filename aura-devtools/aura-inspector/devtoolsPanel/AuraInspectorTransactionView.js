function AuraInspectorTransactionView(devtoolsPanel) {
	var initialLoad = false;
	this.init = function() {
		console.log('initializing AuraInspectorTransaction');
	};
	this.setContainer = function () {
		this.container = document.getElementById('trs');
	};

	this.render = function() {
		if (!initialLoad) {
	        initialLoad = true;
	        this.setContainer();
	        this.bind();
	        this.container.addEventListener('click', this._onTransactionClick.bind(this), false);
		}
	};

	this.bind = function () {
		//this.recordButton = document.querySelector('.trans-panel .record-profile-status-bar-item');
        this.clearButton = document.querySelector('.trans-panel .clear-status-bar-item');
        this.clearButton.addEventListener('click', this._clearTable.bind(this), false);
	};

	this._onTransactionClick = function (e) {
		var id = e.target.dataset.id;
		var command = "console.log($A.metricsService.getTransaction('" + id + "'))";
        chrome.devtools.inspectedWindow.eval(command, function (payload, exception) {
            if (exception) {
            	console.log('ERROR, CMD:', command, exception);
            }
        });
	};

	this.update = function (t) {
		this.addRow(t);
	};

	this._clearTable = function (e) {
		var container = this.container;
		var tbody = container.querySelector('tbody');

		while (tbody.firstChild) {
    		tbody.removeChild(tbody.firstChild);
		}
	};

	this.addRow = function (t) {
		var container = this.container;
		var tbody = container.querySelector('tbody');
		var tr = document.createElement('tr');
		// <th>Id</th>
		// <th>StartTime</th>
		// <th>Duration</th>
		// <th>Context</th>
		// <th>Marks</th>
		tr.innerHTML = [
			'<td class="id"><a href="javascript:void(0)" data-id="'+t.id + ':' + Math.floor(t.ts) +'">' + t.id + '</a></td>',
			'<td class="ts">' + Math.floor(t.ts * 1000) / 1000 +'</td>',
			'<td class="dur">' + Math.floor(t.duration * 1000) / 1000 +'</td>',
			'<td class="ctx">' + JSON.stringify(t.context, null, '\t') + '</td>',
			'<td class="it"> ' + !!(t.context && t.context.inTransaction) + '</td>'
		].join('');

		tbody.appendChild(tr);
	};
}