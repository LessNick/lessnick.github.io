/*
 * *************************************************************************************
 * @class ModalWindow
 * *************************************************************************************
*/
ModalWindow = newClass(null, {
	id: '',
	parent: undefined,
	window: undefined,
	contentDiv: undefined,
	footerDiv: undefined,

	withDimmer: true,
	clouseClickOut: true,
	actionButtons: [],

	callBack: undefined,

	constructor: function(id, title, parent, withDimmer, clouseClickOut) {
		var t = this;
		t.id = id;
		t.title = title;
		t.withDimmer = withDimmer;
		t.clouseClickOut = clouseClickOut;

		t.actionButtons = [];

		if (withDimmer == true) {
			parent.append('<div class="modalDimmer"></div>');
			$('.modalDimmer').on('click', function(e) {
				if (t.clouseClickOut == true) {
					t.closeWindow();
				};
				setTimeout( function() {
					gEvent.fireEvent(null, t.id, 'buttonAction', {id: t.id});
				}, 5);
			});
		}
		parent.append('<div id="' + t.id + '" class="modalWindow"></div>');
		t.window = $('#' + t.id);
		t.window.append('<div class="modalHeader noselect"><div class="modalTitleBg"></div><div class="modalTitle">' + t.title + '</div></div>');
		t.window.append('<div class="modalContent noselect"></div>');
		t.window.append('<div class="modalFooter noselect"></div>');

		t.contentDiv = t.window.find('.modalContent');
		t.footerDiv = t.window.find('.modalFooter');

		document.addEventListener('keyup', function(e) {
			if (e.key == 'Escape') {
				t.closeWindow();
				setTimeout( function() {
					gEvent.fireEvent(null, t.id, 'buttonAction', {id: t.id});
				}, 5);
			}
		}, true);
	},
	
	closeWindow: function() {
		var t = this;
		$('.modalDimmer').remove();
		t.window.remove();
	},
	
	addActionButtons: function(buttons) {
		var t = this;
		for (var i=0; i<buttons.length; i++) {
			var item = buttons[i];
			var className = '';
			if (item.class != undefined && item.class != '') className = ' ' + item.class;

			t.actionButtons[item.id] = $('<button type="' + item.type + '" id="' + item.id + '" class="modalFooterButton' + className + '">' + item.name + '</button>');
			t.footerDiv.append(t.actionButtons[item.id]);
			
			t.actionButtons[item.id].on('click', function(e) {
				var sendData = {
					'id':		$(e.target).attr('id'),
					'type':		$(e.target).attr('type'),
					'caller_id':	t.id
				};
				if ($(e.target).attr('type') == 'ok') {
					var formDataArray = t.contentDiv.find('form').serializeArray();
					var formObject = {};
					$.each(formDataArray, function(i, field) {
						formObject[field.name] = field.value;
					});
					sendData.data = formObject;
				}
				if ($(e.target).attr('type') == 'ok' || $(e.target).attr('type') == 'cancel') {
					t.closeWindow();
				}
				setTimeout( function() {
					gEvent.fireEvent(null, t.id, 'buttonAction', sendData);
				}, 5);
			});

		}
	}, 
	addContent: function(contentList) {
		var t = this;
		var form = $('<form></form>');
		t.contentDiv.append(form);
		for (var i=0; i<contentList.length; i++) {
			var item = contentList[i];
			switch(item.type){
				case 'legend':
					form.append('<fieldset><legend id="' + item.id + '" class="modalContentLegend">' + item.text + '</legend></fieldset>');
					break;
				case 'radio':
					var name = '';
					if (item.group != undefined && item.group != '') name = ' name="' + item.group + '"';
					var newContent = '<input id="' + item.id + '"' + name + ' type="radio" value="' + item.value +'"' + (item.checked?' checked':'') + (item.disabled?' disabled':'') + '> \
					<label for="' + item.id + '" class="' + (item.disabled?' disabled':'') + '">' + item.label + '</label>';
					if (item.legend != undefined && item.legend != '') {
						if (item.line == true) {
							$('legend[id="' + item.legend + '"]').parent().append('<div class="modalContentRadio">' + newContent + '</div>');
						} else {
							$('legend[id="' + item.legend + '"]').parent().append(newContent);
						}
					} else {
						form.append('<div class="modalContentRadio">' + newContent + '</div>');
					}
					break;
				case 'checkbox':
					var newContent = '<input id="' + item.id + '" name="' + item.name + '" type="checkbox" value="' + item.value +'"' + (item.checked?' checked':'') + (item.disabled?' disabled':'') + '> \
					<label for="' + item.id + '" class="' + (item.disabled?' disabled':'') + '">' + item.label + '</label>';
					form.append('<div class="modalContentRadio">' + newContent + '</div>')
					break;
			} 
		}

		$('input[type="radio"]').on('click', function(e) {
			gEvent.fireEvent(null, t.id, 'formChanged', {
				'id': $(e.target).prop('id'),
				'name': $(e.target).prop('name'),
				'value': $(e.target).attr('value'),
				'caller_id': t.id
			});
		});
		
	},
	chooseContents: function(itemArray) {
		var t = this;
		for (var i=0; i<itemArray.length; i++) {
			t.chooseContent(itemArray[i]);
		}
	},
	chooseContent: function(itemId) {
		var t = this;
		$('#' + itemId).prop('checked', true);
	},
	enableContents: function(itemArray) {
		var t = this;
		for (var i=0; i<itemArray.length; i++) {
			t.enableContent(itemArray[i]);
		}
	},
	enableContent: function(itemId) {
		var t = this;
		$('#' + itemId).removeAttr('disabled');
		$('label[for="' + itemId + '"]').removeClass('disabled');
	},
	disableContents: function(itemArray) {
		var t = this;
		for (var i=0; i<itemArray.length; i++) {
			t.disableContent(itemArray[i]);
		}
	},
	disableContent: function(itemId) {
		var t = this;
		$('#' + itemId).attr('disabled', 'disabled');
		$('label[for="' + itemId + '"]').addClass('disabled');
	}
});
