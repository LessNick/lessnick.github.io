/*
 * *************************************************************************************
 * @class AlertWindow
 * *************************************************************************************
*/
AlertWindow = newClass(ModalWindow, {
	id: '',
	parent: undefined,
	window: undefined,
	contentDiv: undefined,
	footerDiv: undefined,

	withDimmer: true,
	clouseClickOut: true,
	actionButtons: [],

	constructor: function(id, title, message, parent) {
		var t = this;
		t.id = id;
		t.title = title;
		t.withDimmer = true;
		t.clouseClickOut = true;

		t.actionButtons = [];
		parent.append('<div class="modalDimmer"></div>');
		if (t.clouseClickOut == true) {
			$('.modalDimmer').on('click', function(e) {
				t.closeWindow();
				setTimeout( function() {
					gEvent.fireEvent(null, t.id, 'buttonAction', {id: t.id});
				}, 5);
			});
		}

		var c = message.split('\n');
		var content = '';
		for (var i=0; i < c.length; i++) {
			content += '<div>' + (c[i] != '' ? c[i] : '&nbsp;') + '</div>';
		}

		t.window = $('<div class="alertWindow"></div>');
		parent.append(t.window);
		t.window.append('<div class="alertHeader noselect"><div class="alertTitleBg"></div><div class="alertTitle">' + t.title + '</div></div>');
		t.window.append('<div class="alertContent noselect">' + content + '</div>');
		t.window.append('<div class="alertFooter noselect"></div>');

		t.contentDiv = t.window.find('.alertContent');
		t.footerDiv = t.window.find('.alertFooter');

		t.addActionButtons([
			{id: 'closeButton', type:'cancel', name: 'CLOSE', class: 'red'}
		]);

		document.addEventListener('keyup', function(e) {
			if (e.key == 'Escape') {
				t.closeWindow();
				setTimeout( function() {
					gEvent.fireEvent(null, t.id, 'buttonAction', {id: t.id});
				}, 5);
			}
		}, true);
	}
});
