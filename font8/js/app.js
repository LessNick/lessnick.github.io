/*
 * *************************************************************************************
 * Bitmap Font Editor
 * 2026 © Breeze / FishBone Crew
 * *************************************************************************************
*/

var gEvent = new Event();
var saveBase64Data = '';

var chars = {
	zx: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRTSUVWXYZ[\\]↑_£abcdefghijklmnopqrstuvwxyz{|}~©',
	ibm: ' ☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRTSUVWXYZ[\\]↑_£abcdefghijklmnopqrstuvwxyz{|}~⌂АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№¤■ ',
	atari: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_♥├│┘┤┐╱╲◢▗◣▝▘¯▂▖♣┌─┼•▄│┬┴▌└�↑↓←→♦abcdefghijklmnopqrstuvwxyz♠|�◀▶',
	atari_: '♥├🮇┘┤┐╱╲◢▗◣▝▘🮂▂▖♣┌─┼•▄▎┬┴▌└␛↑↓←→ !"#$%&\'()*+-,./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_♦abcdefghijklmnopqrstuvwxyz♠|🢰◀▶',
	arbitrary: ' ☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRTSUVWXYZ[\\]↑_£abcdefghijklmnopqrstuvwxyz{|}~⌂АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№¤■ ',
	c64: '@ABCDEFGHIJKLMNOPQRTSUVWXYZ[£]↑← !"#$%&\'()*+,-./0123456789:;<=>?─♠│����������\\/��•�♥��⨯○♣�♦�������������������������������������@ABCDEFGHIJKLMNOPQRTSUVWXYZ[£]↑← !"#$%&\'()*+,-./0123456789:;<=>?─♠│����������\\/��•�♥��⨯○♣�♦�������������������������������������'
}

AppCore = newClass(null, {
	ver: '1.0',
	id: '',
	title: '',
	workFileName: 'NoName.fnt',
	workspaceId: '',
	workspace: undefined,
	toolbar: undefined,
	editorLeft: undefined,
	editorCenter: undefined,
	editorRight: undefined,
	
	modalWindow: undefined,
	winFooter: undefined,

	fontType: '',

	fontWidth: 0,
	fontHeight: 0,

	isNewFile: false,
	readedArray: undefined,

	fileMode: '',

	toolsMode: 'char',
	shiftMode: 'single',

	currentChar: 0,

	copyBuffer: undefined,
	
	constructor: function(id, workspaceId, title) {
		var t = this;
		t.id = id;
		t.workspaceId = workspaceId;
		t.title = title;
		t.workspace = $('#' + t.workspaceId);
		t.workspace.append('<div class="winHeader noselect"><div class="winTitleBg"></div><div class="winTitle">' + t.title + '</div></div>');
		t.workspace.append('<div class="winFooter noselect">Ready</div>');

		t.winFooter = $('.winFooter');

		t.toolbar = undefined;
		t.editorLeft = undefined;
		t.editorCenter = undefined;
		t.editorRight = undefined;

		t.fontWidth = 8;
		t.fontHeight = 8;

		t.isNewFile = false;
		t.readedArray = undefined;

		t.fileMode = '';
		
		t.toolsMode = 'char';
		t.shiftMode = 'single';

		t.currentChar = 0;
		t.copyBuffer = undefined;
	
	},

	start: function() {
		var t = this;

		t.workspace.append('<input id="selectFile" type="file" class="hiddenElement" />');

		$('#selectFile').on('change', function(event) {
			const files = event.target.files;
			if (files.length === 0) {
				console.log('Файл не выбран');
				return;
			}

			const file = event.target.files[0];
			if (file) {
				try {
					const reader = new FileReader();
					reader.onload = (e) => {						
						if (t.fileMode == 'open') {						
							const regularArray = base64ToByteArray(e.target.result);
							t.readedArray = Array.from(regularArray);
							t.isNewFile = true;
							t.showFormatSelector('newFormatModal', 'Detect ' + t.readedArray.length + ' bytes');
						
						} else if (t.fileMode == 'import') {
							const img = new Image();
							img.crossOrigin = "Anonymous";
							img.src = e.target.result;

							img.onload = () => {
								var charWidth = img.width / 16;
								var charHeight = img.height / 16;
								var charPreset = charWidth + 'x' + charHeight;
								var charVariants =  ['8x8', '8x16', '16x16', '16x24', '16x32'];
								if (!charVariants.includes(charPreset)) {
									var msg = 'Detected font size (' + charWidth + 'x' + charHeight + ') not supported!\n\nAvailable variants:\n' + charVariants.join(', ');
									var id = 'alertWindowId';
									var alertWindow = new AlertWindow(id, 'Warning!', msg, $('body'));
									gEvent.removeListener(id, 'buttonAction');
									gEvent.addListener(id, 'buttonAction', function(e, args) {
										gEvent.removeListener(args.caller_id, 'buttonAction');
										t.importImage(img, charPreset);
									});
								}
							};
						
						}

					};
					reader.readAsDataURL(file);
				
				} catch (error) {				
					console.error('Ошибка чтения файла:', error);
				
				} finally {
					t.workFileName = file.name;
					event.target.value = '';
				}
			}			
		});

		t.toolbar = new Toolbar('winToolbar', t.workspace, 24);
		t.toolbar.addButton('newFont', 0, 'Create New Font', false);
		t.toolbar.addButton('openFont', 1, 'Open Font file', false);
		t.toolbar.addButton('openLib', 30, 'Open From lib', true);
		t.toolbar.addButton('saveFont', 2, 'Save Font file', false);
		t.toolbar.addButton('importFont', 3, 'Import from Image', false);
		t.toolbar.addButton('exportFont', 4, 'Export to Image', false);
		t.toolbar.addButton('exportHeader', 5, 'Export to Header', false);
		t.toolbar.addButton('changeFormat', 6, 'Change format', false);
		
		t.toolbar.addPadding('padding_1', 12, true);
		
		t.toolbar.addButtonSwitch('changeDrawMode', [
			['xor', 7, 'XOR mode', true],
			['erase', 8,  'Erase only mode'],
			['draw', 9 , 'Draw only mode']
		], false);
		
		t.toolbar.addPadding('padding_2', 12, true);

		t.toolbar.addButton('cutChar', 10, 'Cut Char', false);
		t.toolbar.addButton('copyChar', 11, 'Copy Char', false);
		t.toolbar.addButton('pasteChar', 12, 'Paste Char', false);
		
		t.toolbar.addPadding('padding_3', 12, true);

		t.toolbar.addButtonSwitch('changeToolsMode', [
			['char', 13, 'Apply to a single character', true],
			['font', 14,  'Apply to the entire font']
		], false);

		t.toolbar.addButton('clear', 15, 'clear', false);
		t.toolbar.addButton('bold', 16, 'bold', false);
		t.toolbar.addButton('italic', 17, 'Italic', false);
		t.toolbar.addButton('future', 18, 'future', false);
		t.toolbar.addButton('invert', 19, 'Invert', false);
		t.toolbar.addButton('outline', 20, 'Outline', false);
		t.toolbar.addButton('rotateCW', 21, 'Rotate Clockwise', false);
		t.toolbar.addButton('rotateCCW', 22, 'Rotate Counter Clockwise', false);
		t.toolbar.addButton('mirrorH', 23, 'Mirror Horizontal', false);
		t.toolbar.addButton('mirrorV', 24, 'Mirror Vertical', false);
		
		t.toolbar.addPadding('padding_4', 10);
		t.toolbar.addButtonPush('shiftMode', 25, 'Switch shift to Cycle Mode', 'Switch shift to Single Mode', false, false);
		
		t.toolbar.addButton('shiftLeft', 26, 'Shift Left', false);
		t.toolbar.addButton('shiftDown', 27, 'Shift Down', false);
		t.toolbar.addButton('shiftUp', 28, 'Shift Up', false);
		t.toolbar.addButton('shiftRight', 29, 'Shift Right', false);
		
		// t.toolbar.addButton('calcFont', 0, 'Calc Font', false);

		gEvent.addListener('winToolbar', 'buttonClick', function(e, args) {			
			t.toolbarAction(args);
		}, t);

		t.workspace.append('<div class="middleSelectorUp"></div>');
		var editorsDiv = $('<div class="middleEditors"></div>');
		t.workspace.append(editorsDiv);
		t.editorLeft = new PixelEditor('editorLeft', editorsDiv, t.fontWidth, t.fontHeight, '#f1f0f0');
		t.editorCenter = new PixelEditor('editorCenter', editorsDiv, t.fontWidth, t.fontHeight, '#fff', true);
		t.editorRight = new PixelEditor('editorRight', editorsDiv, t.fontWidth, t.fontHeight, '#f1f0f0');
		t.workspace.append('<div class="middleSelectorDown"></div>');

		t.currentChar = 0;
		t.fontShow = new FontShow('fontShow', t.workspace, workFont, t.fontWidth, t.fontHeight, '#f1f0f0', '#f5f5f5', t.currentChar);

		gEvent.addListener('fontShow', 'click', function(e, args) {			
			t.updateSelectedChar(args.charPos);
		}, t);
		
		gEvent.addListener('editorCenter', 'updated', function(e, args) {
			workFont[args.charPos] = args.charData;
			t.fontShow.drawChar(args.charPos, true);
		}, t);

		gEvent.addListener('editorLeft', 'updated', function(e, args) {
			workFont[args.charPos] = args.charData;
			t.fontShow.drawChar(args.charPos);
		}, t);

		gEvent.addListener('editorRight', 'updated', function(e, args) {
			workFont[args.charPos] = args.charData;
			t.fontShow.drawChar(args.charPos);
		}, t);

		t.fontType = 'ZX';
		
		t.updateSelectedChar(t.currentChar);
		t.updateFooter(t.currentChar);

		$('body').on('click',  function(e) {
			if (e.target === document.body) {
				var alertWindow = new AlertWindow('alertWindowId', 'Information', 'Font Online Editor v' + t.ver + '\nby\nbreeze\\fishbone crew', $('body'));
			}
		});
	},

	updateFooter: function(selPos) {
		var t = this;
		var selCode = -1;
		var selHex = '';
		var selChar = '';
		t.currentChar = selPos;
		switch (t.fontType) {
			case 'ZX':
				selCode = (selPos + 32);
				selHex = '0x' + (selPos + 32).toString(16).padStart(2, '0');
				selChar = chars.zx.charAt(selPos);
				break;
			case 'IBM':
				selCode = selPos;
				selHex = '0x' + selPos.toString(16).padStart(2, '0');
				selChar = chars.ibm.charAt(selPos);
				break;
			case 'ATARI':
				selCode = (selPos + 32);
				selHex = '0x' + (selPos + 32).toString(16).padStart(2, '0');
				selChar = chars.atari.charAt(selPos);
				break;
			case 'C64':
				selCode = selPos;
				selHex = '0x' + selPos.toString(16).padStart(2, '0');
				selChar = chars.c64.charAt(selPos);
				break;
		};
		t.winFooter.html(t.workFileName + ' | ' + t.fontWidth + 'x' + t.fontHeight+' | ' + t.fontType + ' | «<span class="charPreview">' + selChar +'</span>» ' + selCode + ' (' + selHex + ') at ' + selPos);
	},

	updateSelectedChar: function(charPos) {
		var t = this;
		t.currentChar = charPos;

		t.editorLeft.updateSize(t.fontWidth, t.fontHeight);
		t.editorRight.updateSize(t.fontWidth, t.fontHeight);
		t.editorCenter.updateSize(t.fontWidth, t.fontHeight);

		var prevChar = t.currentChar - 1;
		if (prevChar < 0) prevChar = workFont.length - 1;
		t.editorLeft.loadChar(workFont[prevChar], prevChar);
		
		var nextChar = t.currentChar + 1;
		if (nextChar > workFont.length - 1) nextChar = 0;
		t.editorRight.loadChar(workFont[nextChar], nextChar);
		
		t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		t.updateFooter(t.currentChar);
	},

	toolbarAction: function (args) {
		var t = this;
		var id = args.id;
		if (args.groupId != undefined && args.groupId != '') {
			id = args.groupId;
		}
		switch (id) {
			case 'newFont':
				t.newFont();
				break;
			case 'openFont':
				t.fileMode = 'open';
				$('#selectFile').click();
				break;
			case 'saveFont':
				t.saveFont();
				break;
			case 'importFont':
				t.fileMode = 'import';
				$('#selectFile').click();
				break;
			case 'exportFont':
				t.exportFont();
				break;
			case 'exportHeader':
				t.exportHeader();
				break;
			case 'changeFormat':
				var id = 'alertWindowId';
				var alertWindow = new AlertWindow(
					id,
					'Warning!',
					'Since not all platforms share the same character set, only characters with the same appearance (or meaning) are converted; the rest are replaced by a question mark.',
					$('body')
				);
				gEvent.removeListener(id, 'buttonAction');
				gEvent.addListener(id, 'buttonAction', function(e, args) {
					gEvent.removeListener(args.caller_id, 'buttonAction');
					t.showFormatConverter();
				});
				break;
			case 'changeDrawMode':
				t.changeDrawMode(args.id);
				break;
			case 'changeToolsMode':
				t.toolsMode = args.id;
				break;
			case 'clear':
				t.toolClear();
				break;
			case 'bold':
				t.toolBold();
				break;
			case 'italic':
				t.toolItalic();
				break;
			case 'future':
				t.toolFuture();
				break;
			case 'invert':
				t.toolInvert();
				break;
			case 'outline':
				t.toolOutline();
				break;
			case 'rotateCW':
				t.toolRotateCW();
				break;
			case 'rotateCCW':
				t.toolRotateСCW();
				break;
			case 'mirrorH':
				t.toolMirrorH();
				break;
			case 'mirrorV':
				t.toolMirrorV();
				break;
			case 'shiftLeft':
				t.toolShift('left');
				break;
			case 'shiftRight':
				t.toolShift('right');
				break;
			case 'shiftUp':
				t.toolShift('up');
				break;
			case 'shiftDown':
				t.toolShift('down');
				break;
			case 'shiftMode':
				if (args.pushed == 'true') {
					t.shiftMode = 'cyclic';
				} else {
					t.shiftMode = 'single';
				};
				break;
			case 'cutChar':
				t.cutChar();
				break;
			case 'copyChar':
				t.copyChar();
				break;
			case 'pasteChar':
				t.pasteChar();
				break;
			default:
				console.log('Error: Unknow toolbar event «' + id + '»!' )
				break;
		}
	},

	newFont: function() {
		var t = this;
		var id = 'createNewFont';

		t.prepareModalForFormat(id, 'Create Font', true);

		gEvent.removeListener(id, 'buttonAction');
		gEvent.addListener(id, 'buttonAction', function(e, args) {
			if (args.type == 'ok') {
				var codepage = args.data.codepage;
				var amount = args.data.amount;
				var s = args.data.size.split('x');
				t.fontWidth = s[0] * 1;
				t.fontHeight = s[1] * 1;
				t.fontType = codepage.toUpperCase();
				
				if (codepage == 'zx') {
					if (amount == '96') {
						workFont = JSON.parse(JSON.stringify(zxFont));
					} else {
						workFont = JSON.parse(JSON.stringify(zxFontFull));
					}
				
				} else if (codepage == 'atari') {
					workFont = JSON.parse(JSON.stringify(atariFont));
				
				} else if (codepage == 'c64') {
					if (amount == '128') {
						workFont = JSON.parse(JSON.stringify(c64Font));
					} else {
						workFont = JSON.parse(JSON.stringify(c64FontFull));
					}
				
				} else if (codepage == 'ibm') {
					if (t.fontWidth == 8 && t.fontHeight == 8) {
						if (amount == '128') {
							workFont = JSON.parse(JSON.stringify(ibmFont_8x8_128));
						} else {
							workFont = JSON.parse(JSON.stringify(ibmFont_8x8_256));
						}
					
					} else if (t.fontWidth == 8 && t.fontHeight == 16) {
						if (amount == '128') {
							workFont = JSON.parse(JSON.stringify(ibmFont_8x16_128));
						} else {
							workFont = JSON.parse(JSON.stringify(ibmFont_8x16_256));
						}
					
					} else if (t.fontWidth == 16 && t.fontHeight == 16) {
						if (amount == '128') {
							workFont = JSON.parse(JSON.stringify(ibmFont_16x16_128));
						} else {
							workFont = JSON.parse(JSON.stringify(ibmFont_16x16_256));
						}
					} else if (t.fontWidth == 16 && t.fontHeight == 24) {
						if (amount == '128') {
							workFont = JSON.parse(JSON.stringify(ibmFont_16x24_128));
						} else {
							workFont = JSON.parse(JSON.stringify(ibmFont_16x24_256));
						}
					} else if (t.fontWidth == 16 && t.fontHeight == 32) {
						if (amount == '128') {
							workFont = JSON.parse(JSON.stringify(ibmFont_16x32_128));
						} else {
							workFont = JSON.parse(JSON.stringify(ibmFont_16x32_256));
						}
					}
					
				}
				
				t.currentChar = 0;
				t.fontShow.update(workFont, t.fontWidth, t.fontHeight);
			}
			gEvent.removeListener(args.caller_id, 'buttonAction');
		}, t);
	},

	drawLine: function(ctx, lineData, posX, posY) {
		var t = this;
		for (var x=0; x<8; x++) {
			if (((lineData >> x) & 1) > 0) {
				ctx.fillStyle = '#000';
			} else {
				ctx.fillStyle = '#fff';
			}
			ctx.fillRect(posX + (8 - x), posY, 1, 1);
		}
	},

	exportFont: function() {
		var t = this;

		const canvas = document.createElement('canvas');
		canvas.width = t.fontWidth * 16;
		canvas.height = t.fontHeight * Math.ceil(workFont.length/16);

		const ctx = canvas.getContext('2d');
		ctx.lineWidth = 1;
		ctx.lineCap = 'square';
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		var pX = 0;
		var pY = 0;
		var i = 1;
		for (var i=0; i<workFont.length; i++) {
			var charData = workFont[i];
			var charDataPos = 0;
			for (var y=0; y<t.fontHeight; y++) {
				var lineData = charData[charDataPos];
				t.drawLine(ctx, lineData, pX, pY + y);
				charDataPos++;

				if (t.fontWidth == 16) {
					lineData = charData[charDataPos];
					charDataPos++;
					t.drawLine(ctx, lineData, pX + 8, pY + y);
				}
			}

			pX += t.fontWidth;
			if (pX == t.fontWidth * 16) {
				pX = 0;
				pY += t.fontHeight;
			}
		}

		const link = document.createElement('a');
		link.download = t.workFileName + '.png';
		link.href = canvas.toDataURL('image/png');
		link.click();
		
	},

	cutChar: function() {
		var t = this;
		t.copyBuffer = [...workFont[t.currentChar]];
		workFont[t.currentChar] = new Array(workFont[t.currentChar].length).fill(0);
		t.fontShow.drawChar(t.currentChar, true);
		t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);
	},
	
	copyChar: function() {
		var t = this;
		t.copyBuffer = [...workFont[t.currentChar]];
	},

	pasteChar: function() {
		var t = this;
		workFont[t.currentChar] = [...t.copyBuffer];
		t.fontShow.drawChar(t.currentChar, true);
		t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);
	},

	toolUpdateEditors: function() {
		var t = this;
		t.fontShow.drawChar(t.currentChar, true);
		var prevChar = t.currentChar;
		if (prevChar < 0) prevChar = workFont.length - 1;
		t.editorLeft.loadChar(workFont[prevChar], prevChar);
		var nextChar = t.currentChar + 1;
		if (nextChar > workFont.length - 1) nextChar = 0;
		t.editorRight.loadChar(workFont[nextChar], nextChar);
	},

	makeShift: function(workChar, direction) {
		var t = this;
		if (t.fontWidth == 8) {
			workChar = shiftBitmap8x8(workChar, direction, t.shiftMode == 'cyclic');
		
		} else if (t.fontWidth == 16) {
			if (t.fontHeight == 16) {
				workChar = shiftBitmap16x16(workChar, direction, t.shiftMode == 'cyclic');
			} else {
				workChar = shiftBitmap16xH(workChar, direction, t.shiftMode == 'cyclic');				
			}
		}
		return workChar;
	},

	toolShift: function(direction) {
		var t = this;
		var t = this;
		if (t.toolsMode == 'char') {
			var workChar = t.makeShift(workFont[t.currentChar], direction);
			workFont[t.currentChar] = workChar;
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			for (var i=0; i<workFont.length; i++) {
				var workChar = t.makeMirrorV(workFont[i]);
				workFont[i] = workChar;
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}
			t.toolUpdateEditors();
		}
	},

	makeMirrorV: function(workChar) {
		var t = this;
		if (t.fontWidth == 8) {
			workChar = mirrorBitmap8x8(workChar, 'vertical');
		
		} else if (t.fontWidth == 16) {
			if (t.fontHeight == 16) {
				workChar = mirrorBitmap16x16(workChar, 'vertical');
			} else {
				workChar = mirrorBitmap16xH(workChar, 'vertical');				
			}
		}
		return workChar;
	},

	toolMirrorV: function() {
		var t = this;
		var t = this;
		if (t.toolsMode == 'char') {
			var workChar = t.makeMirrorV(workFont[t.currentChar]);
			workFont[t.currentChar] = workChar;
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			for (var i=0; i<workFont.length; i++) {
				var workChar = t.makeMirrorV(workFont[i]);
				workFont[i] = workChar;
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}
			t.toolUpdateEditors();
		}
	},

	makeMirrorH: function(workChar) {
		var t = this;
		if (t.fontWidth == 8) {
			workChar = mirrorBitmap8x8(workChar, 'horizontal');
		
		} else if (t.fontWidth == 16) {
			var tmpChar = workChar;
			if (t.fontHeight == 16) {
				workChar = mirrorBitmap16x16(workChar, 'horizontal');
			} else {
				workChar = mirrorBitmap16xH(workChar, 'horizontal');				
			}
		}
		return workChar;
	},

	toolMirrorH: function() {
		var t = this;
		var t = this;
		if (t.toolsMode == 'char') {
			var workChar = t.makeMirrorH(workFont[t.currentChar]);
			workFont[t.currentChar] = workChar;
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			for (var i=0; i<workFont.length; i++) {
				var workChar = t.makeMirrorH(workFont[i]);
				workFont[i] = workChar;
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}
			t.toolUpdateEditors();
		}
	},

	makeRotateСCW: function(workChar) {
		var t = this;
		if (t.fontWidth == 8) {
			workChar = rotate90CounterClockwise(workChar);
		
		} else if (t.fontWidth == 16) {
			var tmpChar = workChar;
			if (t.fontHeight == 16) {
				workChar = rotate16x16CounterClockwise(workChar);
			} else {
				var N = Math.ceil((t.fontHeight-16)/2);
				var M = N + 16;
				var tmpChar = workChar.slice(N*2, M*2 + 1);
				tmpChar = rotate90CounterClockwise(tmpChar);
				workChar = new Array(N*2).fill(0);
				workChar = workChar.concat(Array.from(tmpChar));
				workChar = workChar.concat(new Array(N*2).fill(0));
			}
		}
		return workChar;
	},

	toolRotateСCW: function() {
		var t = this;
		var t = this;
		if (t.toolsMode == 'char') {
			var workChar = t.makeRotateСCW(workFont[t.currentChar]);
			workFont[t.currentChar] = workChar;
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			for (var i=0; i<workFont.length; i++) {
				var workChar = t.makeRotateСCW(workFont[i]);
				workFont[i] = workChar;
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}
			t.toolUpdateEditors();
		}
	},

	makeRotateCW: function(workChar) {
		var t = this;
		if (t.fontWidth == 8) {
			workChar = rotate90Clockwise(workChar);
		
		} else if (t.fontWidth == 16) {
			var tmpChar = workChar;
			if (t.fontHeight == 16) {
				workChar = rotate16x16Clockwise(workChar);
			} else {
				var N = Math.ceil((t.fontHeight-16)/2);
				var M = N + 16;
				var tmpChar = workChar.slice(N*2, M*2 + 1);
				tmpChar = rotate16x16Clockwise(tmpChar);
				workChar = new Array(N*2).fill(0);
				workChar = workChar.concat(Array.from(tmpChar));
				workChar = workChar.concat(new Array(N*2).fill(0));
			}
		}
		return workChar;
	},

	toolRotateCW: function() {
		var t = this;
		var t = this;
		if (t.toolsMode == 'char') {
			var workChar = t.makeRotateCW(workFont[t.currentChar]);
			workFont[t.currentChar] = workChar;
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			for (var i=0; i<workFont.length; i++) {
				var workChar = t.makeRotateCW(workFont[i]);
				workFont[i] = workChar;
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}
			t.toolUpdateEditors();
		}
	},

	makeOutline: function(workChar) {
		var t = this;
		if (t.fontWidth == 8) {
			workChar = createOutline8x8(workChar, false);
		
		} else if (t.fontWidth == 16) {
			var tmpChar = workChar;
			if (t.fontHeight == 16) {
				tmpChar = createOutline16x16(bytesToUint16BE(workChar), false);
				workChar = uint16ToBytesBE(tmpChar);
			} else {
				workChar = createOutline16xNBytes(workChar, false);
			}
		}
		return workChar;
	},

	toolOutline: function() {
		var t = this;
		var t = this;
		if (t.toolsMode == 'char') {
			var workChar = t.makeOutline(workFont[t.currentChar]);
			workFont[t.currentChar] = workChar;
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			for (var i=0; i<workFont.length; i++) {
				var workChar = t.makeOutline(workFont[i]);
				workFont[i] = workChar;
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}
			t.toolUpdateEditors();
		}
	},

	makeInvert: function(workChar) {
		var t = this;
		for (var y=0; y<workChar.length; y+=t.fontWidth/8) {
			if (t.fontWidth == 8) {
				workChar[y] = workChar[y] ^ 0xFF;
			} else if (t.fontWidth == 16) {
				var value = workChar[y]*256 + workChar[y+1];
				value = value ^ 0xFFFF;
				workChar[y] = (value >> 8) & 0x00FF;
				workChar[y+1] = value & 0x00FF;
			}
		}
		return workChar;
	},

	toolInvert: function() {
		var t = this;
		var t = this;
		if (t.toolsMode == 'char') {
			var workChar = t.makeInvert(workFont[t.currentChar]);
			workFont[t.currentChar] = workChar;
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			for (var i=0; i<workFont.length; i++) {
				var workChar = t.makeInvert(workFont[i]);
				workFont[i] = workChar;
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}
			t.toolUpdateEditors();
		}
	},

	makeFuture: function(workChar) {
		var t = this;
		for (var y=workChar.length/2; y<workChar.length; y+=t.fontWidth/8) {
			if (t.fontWidth == 8) {
				workChar[y] = workChar[y] | workChar[y] >> 1;
			} else if (t.fontWidth == 16) {
				var value = workChar[y]*256 + workChar[y+1];
				value = value | value >> 1;
				workChar[y] = (value >> 8) & 0x00FF;
				workChar[y+1] = value & 0x00FF;
			}
		}
		return workChar;
	},

	toolFuture: function() {
		var t = this;
		var t = this;
		if (t.toolsMode == 'char') {
			var workChar = t.makeFuture(workFont[t.currentChar]);
			workFont[t.currentChar] = workChar;
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			for (var i=0; i<workFont.length; i++) {
				var workChar = t.makeFuture(workFont[i]);
				workFont[i] = workChar;
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}
			t.toolUpdateEditors();
		}

	},

	makeItalic: function(workChar, stepY, startY, endY) {
		var t = this;

		for (var y=0; y<startY*stepY; y+=stepY) {
			if (t.fontWidth == 8) {
				workChar[y] = workChar[y] >> (startY - y)/2;

			} else if (t.fontWidth == 16) {
				var value = workChar[y]*256 + workChar[y+1];
				value = value >> (startY - (y/stepY))/2;
				workChar[y] = (value >> 8) & 0x00FF;
				workChar[y+1] = value & 0x00FF;
			}
		}

		for (var y=endY*stepY; y<workChar.length; y+=stepY) {
			if (t.fontWidth == 8) {
				workChar[y] = (workChar[y] << (y - endY + 1)/2) & 0xFF;

			} else if (t.fontWidth == 16) {
				var value = workChar[y]*256 + workChar[y+1];
				value = (value << ((y/stepY) - endY + 1)/2) & 0xFFFF;
				workChar[y] = (value >> 8) & 0x00FF;
				workChar[y+1] = value & 0x00FF;
			}
		}

		return workChar;
	},

	toolItalic: function() {
		var t = this;
		if (t.toolsMode == 'char') {
			
			var stepY = t.fontWidth/8;
			var startY = Math.ceil(t.fontHeight/3);
			var endY = t.fontHeight - startY;

			var workChar = t.makeItalic(workFont[t.currentChar], stepY, startY, endY);

			workFont[t.currentChar] = workChar;
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			var stepY = t.fontWidth/8;
			var startY = Math.ceil(t.fontHeight/3);
			var endY = t.fontHeight - startY;
			
			for (var i=0; i<workFont.length; i++) {
				var workChar = t.makeItalic(workFont[i], stepY, startY, endY);
				workFont[i] = workChar;
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}

			t.toolUpdateEditors();
		}
	},

	makeBold: function(workChar) {
		var t = this;
		for (var y=0; y<workChar.length; y+=t.fontWidth/8) {
			if (t.fontWidth == 8) {
				workChar[y] = workChar[y] | workChar[y] >> 1;
			} else if (t.fontWidth == 16) {
				var value = workChar[y]*256 + workChar[y+1];
				value = value | value >> 1;
				workChar[y] = (value >> 8) & 0x00FF;
				workChar[y+1] = value & 0x00FF;
			}
		}
		return workChar;
	},

	toolBold: function() {
		var t = this;
		if (t.toolsMode == 'char') {
			var workChar = t.makeBold(workFont[t.currentChar]);
			workFont[t.currentChar] = workChar;
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			for (var i=0; i<workFont.length; i++) {
				var workChar = t.makeBold(workFont[i]);
				workFont[i] = workChar;
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}
			t.toolUpdateEditors();
		}
	},

	toolClear: function() {
		var t = this;
		if (t.toolsMode == 'char') {
			workFont[t.currentChar] = new Array(t.fontWidth/8 * t.fontHeight).fill(0);
			t.fontShow.drawChar(t.currentChar, true);
			t.editorCenter.loadChar(workFont[t.currentChar], t.currentChar);

		} else if (t.toolsMode == 'font') {
			for (var i=0; i<workFont.length; i++) {
				workFont[i] = new Array(t.fontWidth/8 * t.fontHeight).fill(0);
				t.fontShow.drawChar(i, i == t.currentChar);
				t.editorCenter.loadChar(workFont[i], i);
			}
			t.toolUpdateEditors();
		}
	},

	changeDrawMode: function(mode) {
		var t = this;
		t.editorCenter.setDrawMode(mode);
		t.editorLeft.setDrawMode(mode);
		t.editorRight.setDrawMode(mode);
	},

	calcFont: function() {
		var t = this;
		var propData = [];
		for (var i=0; i<workFont.length; i++) {
			var charData = workFont[i];
			var maxWidth = 4;
			for (var k=0; k < charData.length; k++) {
				var c = 8 - countTrailingZeros(charData[k]);
				if (c + 1 > maxWidth) {
					maxWidth = c + 1;
					if (maxWidth > 8) maxWidth = 8;
				}
			}
			propData[i] = maxWidth;			
		}
		return propData;
	},

	saveFont: function() {
		var t = this;
		saveBase64Data = 'data:application/octet-stream;base64,' + matrixToBase64(workFont);
		t.downloadFile('fontfile.bin', saveBase64Data);
	},

	exportHeader: function() {
		var t = this;
		var id = 'exportHeaderModal';
		t.modalWindow = new ModalWindow(id, 'Export font',  $('body'), true, true);
		t.modalWindow.addContent([	
			{id:'legend_type', type: 'legend', text: 'Format file data'},
			{id:'type_zx', legend: 'legend_type', value:'zx', type: 'radio', group:'type', label: 'ZX Spectrum (*.asm file)', checked: true, line: true},
			{id:'type_atari', legend: 'legend_type', value:'atari', type: 'radio', group:'type', label: 'Atari 800 (*.asm file)', line: true},
			{id:'type_c64', legend: 'legend_type', value:'c64', type: 'radio', group:'type', label: 'Commodore 64 (*.asm file)', line: true},
			{id:'type_millfork', legend: 'legend_type', value:'millfork', type: 'radio', group:'type', label: 'MillFork (*.mfk file)', line: true},
			{id:'type_js', legend: 'legend_type', value:'js', type: 'radio', group:'type', label: 'JavaScript (*.js file)', line: true},
			{id:'type_arduino', legend: 'legend_type', value:'arduino', type: 'radio', group:'type', label: 'Arduino IDE (*.h file)', line: true},
			{id:'type_python', legend: 'legend_type', value:'python', type: 'radio', group:'type', label: 'Python (*.py file)', line: true},

			{id:'inc_sizes', name:'inc_sizes', value:'true', type: 'checkbox', label: 'Including a table of character sizes', checked: true, line: true}
		]);

		t.modalWindow.addActionButtons([
			{id: 'okButton', type:'ok', name: 'OK', class: 'green'},
			{id: 'cancelButton', type:'cancel', name: 'CANCEL', class: 'red'},
		]);

		gEvent.removeListener(id, 'buttonAction');
		gEvent.addListener(id, 'buttonAction', function(e, args) {		
			if (args.type == 'ok') {
				gEvent.removeListener(args.caller_id, 'buttonAction');
				t.exportHeaderA(args.data.type, args.data.inc_sizes == 'true');
			}
		});
	},

	exportHeaderA: function(exportType, includeSizes) {
		var t = this;
		var hb1 = he1 = hb2 = he2 = hbb1 = hee1 = hbb2 = hee2 = comm = '';

		switch (exportType) {
			case 'zx':
				hb1 = 'charsWidth\n';
				he1 = '\n\n';
				hb2 = 'font_' + t.fontWidth + 'x' + t.fontHeight + '\n';
				he2 = '\n';
				hbb1 = '\tdb\t';
				hee1 = '\n';
				hbb2 = '\tdb\t';
				hee2 = '\n';
				hee2last = '\n';
				ext = '.asm';
				hex = '#';
				comm = '; ';
				break;

			case 'atari':
				hb1 = 'charsWidth\n';
				he1 = '\n\n';
				hb2 = 'fontData\n';
				he2 = '\n';
				hbb1 = '\t.byte\t';
				hee1 = '\n';
				hbb2 = '\t.byte\t';
				hee2 = '\n';
				hee2last = '\n';
				ext = '.asm';
				hex = '$';
				comm = '; ';
				break;

			case 'c64':
				hb1 = 'charsWidth\n';
				he1 = '\n\n';
				hb2 = 'fontData\n';
				he2 = '\n';
				hbb1 = '\t.byte\t';
				hee1 = '\n';
				hbb2 = '\t.byte\t';
				hee2 = '\n';
				hee2last = '\n';
				ext = '.asm';
				hex = '$';
				comm = '; ';
				break;

			case 'millfork':
				hb1 = 'array(byte) charsWidth = [\n';
				he1 = '\n]\n\n';
				hb2 = 'array(byte) fontData = [\n';
				he2 = ']\n';
				hbb1 = '\t';
				hee1 = ',\n';
				hbb2 = '\t';
				hee2 = ',\n';
				hee2last = ' \n';
				ext = '.mfk';
				hex = '0x';
				comm = '// ';
				break;

			case 'js':
				hb1 = 'var charsWidth = [\n';
				he1 = '\n];\n\n';
				hb2 = 'var fontData = [\n';
				he2 = '];\n';
				hbb1 = '\t';
				hee1 = ',\n';
				hbb2 = '\t[ ';
				hee2 = ' ],\n';
				hee2last = ' ] \n';
				ext = '.js';
				hex = '0x';
				comm = '// ';
				break;

			case 'arduino':
				hb1 = 'const uint8_t charsWidth[' + workFont.length + '] PROGMEM = {\n';
				he1 = '\n};\n\n';
				hb2 = 'const uint8_t fontData[' + workFont.length + '][' + t.fontWidth/8* t.fontHeight + '] PROGMEM = {\n';
				he2 = '};\n';
				hbb1 = '\t';
				hee1 = ',\n';
				hbb2 = '\t{ ';
				hee2 = ' },\n';
				hee2last = ' } \n';
				ext = '.h';
				hex = '0x';
				comm = '// ';
				break;

			case 'python':
				hb1 = 'charsWidth = [\n';
				he1 = '\n];\n\n';
				hb2 = 'fontData = [\n';
				he2 = '];\n';
				hbb1 = '\t';
				hee1 = ',\n';
				hbb2 = '\t[ ';
				hee2 = ' ],\n';
				hee2last = ' ] \n';
				ext = '.py';
				hex = '0x';
				comm = '# ';
				break;

		}
		var cp = t.fontType.toLowerCase();
		var charNames = chars[cp];
		var headerData = comm + ' Font «' + t.workFileName + '» size ' + t.fontWidth + 'x' + t.fontHeight + ' with codepage: ' + cp + '\n\n';
		
		if (includeSizes) {
			headerData += hb1;
			var c = t.calcFont();
			var lineC = comm + '\t\t';
			var lineD = hbb1;
			for (var i=0; i<c.length; i++) {
				lineC += charNames[i];
				lineD += c[i].toString();
				if (i < c.length-1) {
					if (((i+1) & 15) === 0) {
						lineD += hee1;
						headerData += lineC + '\n';
						headerData += lineD;
						if (i+1 < c.length) {
							lineD = hbb1;
							lineC = comm + '\t\t';
						} else {
							lineD = '';
							lineC = '';
						}
					} else {
						lineD += ',';
						lineC += ' ';
					}
				}
			}
			headerData += he1;
		}
		
		headerData += hb2;
		for (var i=0; i<workFont.length; i++) {
			var charData = workFont[i];
			headerData += hbb2;
			for (var k=0; k < charData.length; k++) {
				headerData += hex + (charData[k]).toString(16).padStart(2, '0');
				if (k < charData.length-1) {
					headerData += ',';
				}
			}
			if (i+1 == workFont.length) {
				headerData += hee2last.replace('\n', '\t' + comm + charNames[i] +'\n');
			} else {
				headerData += hee2.replace('\n', '\t' + comm + charNames[i] +'\n');
			}
		}
		headerData += he2;

		var blob = new Blob([headerData], { type: 'text/plain;charset=utf-8' });
		var headerData = URL.createObjectURL(blob);

		t.downloadFile(t.workFileName + ext, headerData);
	},

	downloadFile: function(fileName, fileContent) {
		var t = this;

		const link = document.createElement('a');
		link.class = 'hiddenElement';
		link.href = fileContent;
		link.download = fileName; 
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	},

	importImage: function(img, charPreset) {
		var t = this;
		var id = 'newImportModal';
		t.prepareModalForFormat(id, 'Import image ' + img.width + 'x' + img.height + 'px');
		t.setModalFofAll();

		t.modalWindow.chooseContent('size_' + charPreset);

		gEvent.removeListener(id, 'buttonAction');
		gEvent.addListener(id, 'buttonAction', function(e, args) {
			if (args.type == 'ok') {
				var s = args.data.size.split('x');
				t.fontWidth = s[0] * 1;
				t.fontHeight = s[1] * 1;
				t.fontType = args.data.codepage.toUpperCase();

				var charWidth = t.fontWidth;
				var charHeight = t.fontHeight;

				var countX = img.width / charWidth;
				var countY = args.data.amount / countX;
				var arrayData = Array.from({ length: countX * countY }, () => new Array((charWidth/8) * charHeight).fill(0));
				
				for (var cy=0; cy<countY; cy++) {
					for (var cx=0; cx<countX; cx++) {
						var bytes = imageToByteArray(img, cx*charWidth, cy*charHeight, charWidth, charHeight, 128);
						arrayData[cy * countX + cx] = bytes;
					}
				}

				t.editorLeft.setSize(t.fontWidth, t.fontHeight);
				t.editorCenter.setSize(t.fontWidth, t.fontHeight);
				t.editorRight.setSize(t.fontWidth, t.fontHeight);								

				workFont = arrayData;
				t.fontShow.update(workFont, t.fontWidth, t.fontHeight);

				gEvent.removeListener(args.caller_id, 'buttonAction');
			}
		});

	},

	prepareModalForFormat: function(id, title, noUnknown = false) {
		var t = this;

		t.modalWindow = new ModalWindow(id, title,  $('body'), true, true);
		var content = [
			{id:'legend_size', type: 'legend', text: 'Choose Font Size'},
			{id:'size_8x8', legend: 'legend_size', value:'8x8', type: 'radio', group:'size', label: '8x8', checked: true,},
			{id:'size_8x16', legend: 'legend_size', value:'8x16', type: 'radio', group:'size', label: '8x16', disabled: true},
			{id:'size_16x16', legend: 'legend_size', value:'16x16', type: 'radio', group:'size', label: '16x16', disabled: true},
			{id:'size_16x24', legend: 'legend_size', value:'16x24', type: 'radio', group:'size', label: '16x24', disabled: true},
			{id:'size_16x32', legend: 'legend_size', value:'16x32', type: 'radio', group:'size', label: '16x32', disabled: true},
			
			{id:'legend_amount', type: 'legend', text: 'Choose amount font chars'},
			{id:'chars_96', legend: 'legend_amount', value:'96', type: 'radio', group:'amount', label: '96 chars', checked: true,},
			{id:'chars_128', legend: 'legend_amount', value:'128', type: 'radio', group:'amount', label: '128 chars', disabled: true},
			{id:'chars_256', legend: 'legend_amount', value:'256', type: 'radio', group:'amount', label: '256 chars'},
			
			{id:'legend_codepage', type: 'legend', text: 'Choose font codepage'},
			{id:'cp_zx', legend: 'legend_codepage', value:'zx', type: 'radio', group:'codepage', label: 'ZX Spectrum', checked: true, line: true},
			{id:'cp_atari', legend: 'legend_codepage', value:'atari', type: 'radio', group:'codepage', label: 'Atari 800', line: true},
			{id:'cp_c64', legend: 'legend_codepage', value:'c64', type: 'radio', group:'codepage', label: 'Commodore 64', line: true},
			{id:'cp_ibm', legend: 'legend_codepage', value:'ibm', type: 'radio', group:'codepage', label: 'IBM DOS', line: true},
		];
		if (noUnknown == false) {
			content.push({id:'cp_arbitrary', legend: 'legend_codepage', value:'arbitrary', type: 'radio', group:'codepage', label: 'Arbitrary (Unknown)', line: true})
		}

		t.modalWindow.addContent(content);
		t.modalWindow.addActionButtons([
			{id: 'okButton', type:'ok', name: 'OK', class: 'green'},
			{id: 'cancelButton', type:'cancel', name: 'CANCEL', class: 'red'},
		]);

		gEvent.removeListener(id, 'formChanged');
		gEvent.addListener(id, 'formChanged', function(e, args) {
			if (args.name == 'codepage') {
				switch(args.value) {
					case 'zx':					
						t.setModalFofZX();
						break;

					case 'atari':
						t.setModalFofAtari();
						break;

					case 'c64':
						t.setModalFofC64();
						break;

					case 'ibm':
						t.setModalFofIBM();
						break;

					case 'arbitrary':
						t.setModalFofAll();
						break;
				}
			}
		});
	},

	showFormatConverter: function() {
		var t = this;
		var id = 'formatConverter';
		t.modalWindow = new ModalWindow(id, 'Format Converter',  $('body'), true, true);
		t.modalWindow.addContent([	
			{id:'legend_source', type: 'legend', text: 'From Source codepage'},
			{id:'src_zx', legend: 'legend_source', value:'zx', type: 'radio', group:'source', label: 'ZX Spectrum', checked: true, line: true},
			{id:'src_atari', legend: 'legend_source', value:'atari', type: 'radio', group:'source', label: 'Atari 800', line: true},
			{id:'src_c64', legend: 'legend_source', value:'c64', type: 'radio', group:'source', label: 'Commodore 64', line: true},
			{id:'src_ibm', legend: 'legend_source', value:'ibm', type: 'radio', group:'source', label: 'IBM DOS', line: true},

			{id:'legend_destination', type: 'legend', text: 'To Destination codepage'},
			{id:'dst_zx', legend: 'legend_destination', value:'zx', type: 'radio', group:'destination', label: 'ZX Spectrum', checked: true, line: true},
			{id:'dst_atari', legend: 'legend_destination', value:'atari', type: 'radio', group:'destination', label: 'Atari 800', line: true},
			{id:'dst_c64', legend: 'legend_destination', value:'c64', type: 'radio', group:'destination', label: 'Commodore 64', line: true},
			{id:'dst_ibm', legend: 'legend_destination', value:'ibm', type: 'radio', group:'destination', label: 'IBM DOS', line: true}

		]);

		t.modalWindow.addActionButtons([
			{id: 'okButton', type:'ok', name: 'OK', class: 'green'},
			{id: 'cancelButton', type:'cancel', name: 'CANCEL', class: 'red'},
		]);

		t.modalWindow.chooseContent('src_' + t.fontType.toLowerCase());

		gEvent.removeListener(id, 'buttonAction');
		gEvent.addListener(id, 'buttonAction', function(e, args) {
			
			if (args.type == 'ok') {

				var source = args.data.source;
				var destination = args.data.destination;

				if (source == destination) {
					var alertWindow = new AlertWindow(
						id,
						'Woow!',
						'OK, very funny. Now close the window.',
						$('body')
					);
				} else {
				
					if (chars[source] != undefined && chars[destination] != undefined) {
						var src = chars[source];
						var dst = chars[destination].split('');
						var newFont = new Array(dst.length);
						for (var i=0; i<dst.length; i++) {
							var pos = src.indexOf(dst[i]);
							if (pos == -1 || workFont[pos] == undefined) {
								newFont[i] = [60,102,219,247,239,255,110,60];
							} else {
								newFont[i] = workFont[pos];
							}
						}
						workFont = [...newFont];
						t.fontType = destination.toUpperCase();
						t.currentChar = 0;
						t.fontShow.update(workFont, t.fontWidth, t.fontHeight);
					}
				}
			}
		});

	},

	showFormatSelector: function(id, title) {
		var t = this;

		t.prepareModalForFormat(id, title);

		if (t.isNewFile == true) {
			if (t.readedArray.length == 768) {
				t.setModalFofZX();
				t.modalWindow.chooseContents(['size_8x8', 'chars_96', 'cp_zx']);

			} else if (t.readedArray.length == 2048) {
				t.setModalFofIBM();
				t.modalWindow.chooseContents(['size_8x8', 'chars_256', 'cp_ibm']);

			} else if (t.readedArray.length == 1024) {
				t.setModalFofAtari();
				t.modalWindow.chooseContents(['size_8x8', 'chars_128', 'cp_atari']);

			}
		}

		gEvent.removeListener(id, 'buttonAction');
		gEvent.addListener(id, 'buttonAction', function(e, args) {
			if (args.type == 'ok') {
				if (t.isNewFile == true) {
					var s = args.data.size.split('x');
					t.fontWidth = s[0] * 1;
					t.fontHeight = s[1] * 1;
					t.fontType = args.data.codepage.toUpperCase();
					
					var tmpFont = convertTo2DArray(t.readedArray, ((t.fontWidth / 8) * t.fontHeight));
					
					workFont = new Array();
					for (var i=0; i<args.data.amount*1; i++) {
						// workFont[i] = [255,129,185,133,137,145,129,215];
						workFont[i] = [60,102,219,247,239,255,110,60];
					};					
					var realSize = Math.min(tmpFont.length, workFont.length);

					var startForm = 0;
					if (args.data.amount * 1 == 256 && tmpFont.length != 256) {
						if (args.data.codepage != 'c64') {
							startForm = 32;
						}
					}

					for (var i=0; i<realSize; i++) {
						workFont[i+startForm] = tmpFont[i];
					}

					t.fontShow.update(workFont, t.fontWidth, t.fontHeight);

				} else {

				}
			}
			gEvent.removeListener(args.caller_id, 'buttonAction');
		}, t);
	},
	
	setModalFofZX: function() {
		var t = this;
		t.modalWindow.chooseContent('cp_zx');

		t.modalWindow.enableContents(['chars_96', 'chars_256']);
		t.modalWindow.disableContents(['chars_128']);
		t.modalWindow.chooseContent('chars_96');
		
		t.modalWindow.disableContents(['size_8x16', 'size_16x16', 'size_16x24', 'size_16x32']);
		t.modalWindow.enableContents(['size_8x8']);
	},

	setModalFofAtari: function() {
		var t = this;
		t.modalWindow.chooseContent('cp_atari');

		t.modalWindow.enableContents(['chars_128']);
		t.modalWindow.disableContents(['chars_96', 'chars_256']);
		t.modalWindow.chooseContent('chars_128');
		
		t.modalWindow.disableContents(['size_8x16', 'size_16x16', 'size_16x24', 'size_16x32']);
		t.modalWindow.chooseContent('size_8x8');
	},
	
	setModalFofC64: function() {
		var t = this;
		t.modalWindow.chooseContent('cp_c64');
		
		t.modalWindow.enableContents(['chars_128', 'chars_256']);
		t.modalWindow.disableContents(['chars_96']);
		t.modalWindow.chooseContent('chars_128');

		t.modalWindow.disableContents(['size_8x16', 'size_16x16', 'size_16x24', 'size_16x32']);
		t.modalWindow.chooseContent('size_8x8');
	},

	setModalFofIBM: function() {
		var t = this;
		t.modalWindow.chooseContent('cp_ibm');

		t.modalWindow.enableContents(['chars_128', 'chars_256']);
		t.modalWindow.disableContents(['chars_96']);
		t.modalWindow.chooseContent('chars_256');
		
		t.modalWindow.enableContents(['size_8x8', 'size_8x16', 'size_16x16', 'size_16x24', 'size_16x32']);
		t.modalWindow.chooseContent('size_8x8');
	},

	setModalFofAll: function() {
		var t = this;
		t.modalWindow.chooseContent('cp_arbitrary');

		t.modalWindow.enableContents(['chars_96', 'chars_128', 'chars_256']);
		t.modalWindow.chooseContent('chars_256');

		t.modalWindow.enableContents(['size_8x8', 'size_8x16', 'size_16x16', 'size_16x24', 'size_16x32']);
	}
});
