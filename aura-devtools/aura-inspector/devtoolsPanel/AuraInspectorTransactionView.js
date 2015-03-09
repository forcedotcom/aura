function AuraInspectorTransactionView(devtoolsPanel) {
	var outputList;
	var clearButton;
	var queuedData = [];

	var markup = [
		'<div class="aura-panel panel-status-bar">',
		// '	<button class="record-profile-status-bar-item status-bar-item" title="Record">',
		// '		<div class="glyph"></div><div class="glyph shadow"></div>',
		// '	</button>',
		'	<button class="clear-status-bar-item status-bar-item" title="Clear">',
		'		<div class="glyph"></div><div class="glyph shadow"></div>',
		'	</button> ',
		'</div>',
		'<div class="transactions" id="trs">',
		'	<table>',
		'		<thead>',
		'			<th>Id</th>',
		'			<th>StartTime</th>',
		'			<th>Duration(ms)</th>',
		'			<th>Context</th>',
		'			<th>InTransaction</th>',
		'		</thead>',
		'		<tbody>',
		'		</tbody>',
		'	</table>',
		'</div>'
	].join('');

	function OutputListTable_OnClick(event) {
		var id = event.target.dataset.id;
		if(id!==undefined) {
			var command = "console.log($A.metricsService.getTransaction('" + id + "'))";
	        chrome.devtools.inspectedWindow.eval(command, function (payload, exception) {
	            if (exception) {
	            	console.log('ERROR, CMD:', command, exception);
	            }
	        });
	    }
	}

	function ClearTable_OnClick(event) {
		if(outputList) {
			var tbody = outputList.querySelector('tbody');

			while (tbody.firstChild) {
	    		tbody.removeChild(tbody.firstChild);
			}
		}
	}

	function addTableRow(rowData) {
		var tbody = outputList.querySelector('tbody');
		var tr = document.createElement('tr');
		// <th>Id</th>
		// <th>StartTime</th>
		// <th>Duration</th>
		// <th>Context</th>
		// <th>Marks</th>
		tr.innerHTML = [
			'<td class="id"><a href="javascript:void(0)" data-id="'+rowData.id + ':' + Math.floor(rowData.ts) +'">' + rowData.id + '</a></td>',
			'<td class="ts">' + Math.floor(rowData.ts * 1000) / 1000 +'</td>',
			'<td class="dur">' + Math.floor(rowData.duration * 1000) / 1000 +'</td>',
			'<td class="ctx">' + JSON.stringify(rowData.context, null, '\t') + '</td>',
			'<td class="it"> ' + !!(rowData.context && rowData.context.inTransaction) + '</td>'
		].join('');

		tbody.appendChild(tr);
	}

	this.init = function(tabBody) {
		tabBody.innerHTML = markup;
		tabBody.classList.add("trans-panel");
		
		console.log('initializing AuraInspectorTransaction');
	};

	this.render = function() {
		// Already rendered
		if (outputList) {
			while(queuedData.length) {
				this.addTransactions(queuedData.pop());			
			}
			return;
		}

		outputList = document.getElementById('trs');
		clearButton = document.querySelector('#tab-body-transaction .clear-status-bar-item');
        
        //this.recordButton = document.querySelector('.trans-panel .record-profile-status-bar-item');
        outputList.addEventListener('click', OutputListTable_OnClick.bind(this), false);
        clearButton.addEventListener('click', ClearTable_OnClick.bind(this), false);
		devtoolsPanel.hideSidebar();
	};

	this.addTransactions = function (rowData) {
		if(!outputList) {
			queuedData.push(rowData);
			return;
		}

		addTableRow(rowData);
	};
}