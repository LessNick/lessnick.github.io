/*
 * *************************************************************************************
 * @class Toolbar
 * *************************************************************************************
*/
Toolbar = newClass(null, {
	id: '',
	parent: undefined,
	toolbarDiv: undefined,
	buttons: [],
	groups: [],
	pushers: [],
	btnWidth: 0,
	
	constructor: function(id, parent, btnWidth) {
		var t = this;
		t.id = id;
		t.parent = parent;
		t.btnWidth = btnWidth;
		t.btnHeight = btnWidth;
		t.buttons = [];
		t.groups = [];
		t.pushers = [];

		t.toolbarDiv = $('<div class="winToolbar"></div>');
		t.parent.append(t.toolbarDiv);
	},

	addButtonPush: function(id, imgPos, title, titlePushed, isPushed = false, isDisabled = false) {
		var t = this;
		var bgPosX = imgPos * t.btnWidth;
		t.pushers[id] = $(
			'<div pushed="' + isPushed + '" id="' + id + '" disabled="' + isDisabled +
			'" class="toolbarButton" style="background-position-x:-' + bgPosX +
			'px" title="' + title + '" title2="' + titlePushed + '"></div>');
		t.toolbarDiv.append(t.pushers[id]);

		if (isPushed) {
			t.pushers[id].css('background-position-y', '-' + (t.btnHeight*2) + 'px');
		}

		t.pushers[id].on("mouseover", function() {
			if ($(this).attr('disabled') != 'true' && $(this).attr('pushed') != 'true') {
				$(this).css('background-position-y', '-' + t.btnHeight + 'px');
			}
		});
		t.pushers[id].on("mouseout", function() {
			if ($(this).attr('disabled') != 'true' && $(this).attr('pushed') != 'true') {
				$(this).css('background-position-y', '0');
			}
		});
		t.pushers[id].on("mousedown", function() {
			if ($(this).attr('disabled') != 'true') {
				$(this).css('background-position-y', '-' + t.btnHeight*2 + 'px');
			}
		});
		t.pushers[id].on("mouseup", function() {
			if ($(this).attr('disabled') != 'true' && $(this).attr('pushed') != 'true') {
				if ($(this).is(':hover')) {
					$(this).css('background-position-y', '-' + t.btnHeight + 'px');
				} else {
					$(this).css('background-position-y', '0');
				}
			}
		});
		t.pushers[id].on("click", function() {
			if ($(this).attr('disabled') != 'true') {
				var title = $(this).attr('title');
				var title2 = $(this).attr('title2');

				if ($(this).attr('pushed') == 'true') {
					$(this).attr('pushed', false);
					$(this).css('background-position-y', '0');
					
				} else {
					$(this).attr('pushed', true);
					$(this).css('background-position-y', '-' + (t.btnHeight*2) + 'px');
				}

				$(this).attr('title', title2);
				$(this).attr('title2', title);

				gEvent.fireEvent(null, t.id, 'buttonClick', {
					'id': $(this).attr('id'),
					'pushed': $(this).attr('pushed')
				});
			}
		});
	},

	addButton: function(id, imgPos, title, isDisabled) {
		var t = this;
		var bgPosX = imgPos * t.btnWidth;
		t.buttons[id] = $('<div id="' + id + '" disabled="' + isDisabled + '" class="toolbarButton" style="background-position-x:-' + bgPosX + 'px" title="' + title + '"></div>');
		t.toolbarDiv.append(t.buttons[id]);
		t.buttons[id].on("mouseover", function() {
			if ($(this).attr('disabled') != 'true') {
				$(this).css('background-position-y', '-' + t.btnHeight + 'px');
			}
		});
		t.buttons[id].on("mouseout", function() {
			if ($(this).attr('disabled') != 'true') {
				$(this).css('background-position-y', '0');
			}
		});
		t.buttons[id].on("mousedown", function() {
			if ($(this).attr('disabled') != 'true') {
				$(this).css('background-position-y', '-' + t.btnHeight*2 + 'px');
			}
		});
		t.buttons[id].on("mouseup", function() {
			if ($(this).attr('disabled') != 'true') {
				if ($(this).is(':hover')) {
					$(this).css('background-position-y', '-' + t.btnHeight + 'px');
				} else {
					$(this).css('background-position-y', '0');
				}
			}
		});
		t.buttons[id].on("click", function() {
			if ($(this).attr('disabled') != 'true') {
				gEvent.fireEvent(null, t.id, 'buttonClick', {'id': $(this).attr('id')});
			}
		});
	},

	addPadding: function(id, padSize, isBorder) {
		var t = this;
		var c = isBorder == true ? 'toolbarPaddingB' : 'toolbarPadding';
		var div = $('<div id="' + id + '" class="' + c + '" style="width:' + padSize + 'px"></div>');
		t.toolbarDiv.append(div);
	},

	addButtonSwitch: function(groupId, items, isDisabled) {
		var t = this;
		for (var i=0; i<items.length; i++) {
			var id = items[i][0];
			var groupId = groupId;
			var imgPos = items[i][1];
			var title = items[i][2];
			var selected = items[i][3] == true;

			var bgPosX = imgPos * t.btnWidth;
			t.groups[id] = $('<div selected="' + (selected == true? 'true': 'false') +'" groupId="' + groupId + '" id="' + id + '" disabled="' + isDisabled + '" class="toolbarButton" style="background-position-x:-' + bgPosX + 'px" title="' + title + '"></div>');
			t.toolbarDiv.append(t.groups[id]);

			if (selected) {
				t.groups[id].css('background-position-y', '-' + (t.btnHeight*2) + 'px');
			}

			t.groups[id].on("mouseover", function() {
				if ($(this).attr('disabled') != 'true' && $(this).attr('selected') != 'true') {
					$(this).css('background-position-y', '-' + t.btnHeight + 'px');
				}
			});
			t.groups[id].on("mouseout", function() {
				if ($(this).attr('disabled') != 'true' && $(this).attr('selected') != 'true') {
					$(this).css('background-position-y', '0');
				}
			});
			t.groups[id].on("mousedown", function() {
				if ($(this).attr('disabled') != 'true') {
					$(this).css('background-position-y', '-' + t.btnHeight*2 + 'px');
				}
			});
			t.groups[id].on("mouseup", function() {
				if ($(this).attr('disabled') != 'true' && $(this).attr('selected') != 'true') {
					if ($(this).is(':hover')) {
						$(this).css('background-position-y', '-' + t.btnHeight + 'px');
					} else {
						$(this).css('background-position-y', '0');
					}
				}
			});
			t.groups[id].on("click", function() {
				if ($(this).attr('disabled') != 'true' && $(this).attr('selected') != 'true') {
					var prevItem = $('div[selected="true"][groupId="' + $(this).attr('groupId') + '"]');
					prevItem.attr('selected', false);
					prevItem.css('background-position-y', '0px');

					$(this).attr('selected', true);
					$(this).css('background-position-y', '-' + (t.btnHeight*2) + 'px');

					gEvent.fireEvent(null, t.id, 'buttonClick', {
						'id': $(this).attr('id'),
						'groupId': $(this).attr('groupId')
					});
				}
			});
		}
	}
	
});
