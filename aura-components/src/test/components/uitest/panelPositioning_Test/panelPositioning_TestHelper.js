({
	handleMouseMove: function (evt) {
		
		var el = this.mover;
        el.style.left = evt.clientX + 'px';
        el.style.top = evt.clientY + 'px';
        this.positioningLib.panelPositioning.reposition();
	},

	handleMouseDown: function (cmp, evt) {
        cmp._movehandle = this.handleMouseMove.bind(this);
        cmp._uphandle = this.handleMouseUp.bind(this);
        this.mover = evt.target;
        this.cmp = cmp;
        document.addEventListener('mouseup', cmp._uphandle);
        document.addEventListener('mousemove', cmp._movehandle);
	},

	handleMouseUp: function (evt) {
		document.removeEventListener('mouseup', this.cmp._uphandle);
		document.removeEventListener('mousemove', this.cmp._movehandle);
	}
})