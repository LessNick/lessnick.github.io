/*
 * *************************************************************************************
 * @class FontShow
 * *************************************************************************************
*/
FontShow = newClass(null, {
	id: '',
	parent: undefined,
	fontCanvas: undefined,
	ctx: undefined,
	fontCanvasWidth: 780,
	fontCanvasHeight: 330+22+44,
	bgColor: '#abc',
	bgColor2: '#fff',

	cols: 24,
	rows: 11,
	rowsActive: 11,
	dpr: 0,
	stepX: 0, 
	stepY: 0,

	charWidth: 0,
	charHeight: 0,

	prevActiveChar: 0,

	workData: [],

	rightPadding: 0,
	
	constructor: function(id, parent, workData, charWidth, charHeight, bgColor, bgColor2, activeChar) {
        var t = this;
		t.id = id;
		t.parent = parent;
		t.workData = workData;
		t.rowsActive = Math.ceil(t.workData.length / t.cols);
		t.bgColor = bgColor;
		t.bgColor2 = bgColor2;
		t.charWidth = charWidth;
		t.charHeight = charHeight;

		t.dpr = window.devicePixelRatio || 1;

		t.parent.append('<canvas id="' + t.id +'" class="fontCanvas"></canvas>');

		t.fontCanvas = $('#' + t.id);
		t.ctx = t.fontCanvas[0].getContext('2d');

		t.rightPadding = 4;

		t.fontCanvas.attr('width', t.fontCanvasWidth * t.dpr + t.rightPadding);
		t.fontCanvas.attr('height', t.fontCanvasHeight * t.dpr + t.rightPadding);

		t.fontCanvas.css({
			width: (t.fontCanvasWidth + t.rightPadding) + 'px',
			height: (t.fontCanvasHeight + t.rightPadding) + 'px'
		});

		t.ctx.scale(t.dpr, t.dpr);

		t.ctx.fillStyle = t.bgColor;
		t.ctx.fillRect(0, 0, t.fontCanvasWidth + t.rightPadding, t.fontCanvasHeight + t.rightPadding);

		t.stepX = t.fontCanvasWidth/t.cols;
		t.stepY = t.fontCanvasHeight/t.rows;

		t.ctx.strokeStyle = '#adadad';
		t.ctx.lineWidth = 1;
		t.ctx.lineCap = 'square';

		for (var p=0; p < t.workData.length; p++) {
			t.drawChar(p, false);
		}

		t.fontCanvas.on('click', function(e) {
			const rect = this.getBoundingClientRect();
			var x = Math.floor((e.clientX - rect.left) / t.stepX);
			var y = Math.floor((e.clientY - rect.top) / t.stepY);
			var selChar = y * t.cols + x;

			if (selChar < t.workData.length) {
				t.selChar(selChar);
				gEvent.fireEvent(null, t.id, 'click', {'charPos': selChar});
			}

		});

		t.prevActiveChar = activeChar;
		t.drawChar(t.prevActiveChar, true);

		document.addEventListener('keyup', function(e) {
			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
				var selChar = t.prevActiveChar;
				if (e.key == 'ArrowLeft') {
					selChar -= 1;
					if (selChar < 0) selChar = t.workData.length-1;
				}
				if (e.key == 'ArrowRight') {
					selChar += 1;
					if (selChar > t.workData.length - 1) selChar = 0;
				}
				if (e.key == 'ArrowUp') {
					selChar -= t.cols;
					if (selChar < 0) {
						selChar = (t.rowsActive - 1) * t.cols + t.prevActiveChar;
						if (selChar > t.workData.length - 1) selChar = t.workData.length - 1;
					}
				}
				if (e.key == 'ArrowDown') {
					selChar += t.cols;
					if (selChar > t.workData.length - 1) {
						var p = Math.round(t.prevActiveChar/t.cols);
						if (p < t.rows) {
							selChar = t.workData.length-1;
						} else {
							selChar = t.prevActiveChar - (p * t.cols);
						}
					}
				}
				
				t.selChar(selChar);
				gEvent.fireEvent(null, t.id, 'click', {'charPos': selChar});

			}
		}, true);
	},

	selChar: function(selChar) {
		var t = this;
		t.drawChar(t.prevActiveChar, false);
		t.prevActiveChar = selChar;
		t.drawChar(t.prevActiveChar, true);
	},

	update:function(newData, charWidth, charHeight) {
		var t = this;

		if (charWidth != undefined) t.charWidth = charWidth;
		if (charHeight != undefined) t.charHeight = charHeight;
	
		t.prevActiveChar = 0;
		
		t.ctx.fillStyle = t.bgColor;
		t.ctx.fillRect(0, 0, t.fontCanvasWidth + t.rightPadding, t.fontCanvasHeight + t.rightPadding);

		t.workData = newData;
		t.rowsActive = Math.ceil(t.workData.length / t.cols);
		for (var p=0; p < t.workData.length; p++) {
			t.drawChar(p, false);
		}
		t.drawChar(t.prevActiveChar, true);
		gEvent.fireEvent(null, t.id, 'click', {'charPos': t.prevActiveChar});
	},

	drawChar: function(charPos, isActive) {
		var t = this;
		var posY = Math.floor(charPos/t.cols);
		var posX = (charPos - posY * t.cols);

		var stX = posX * t.stepX + 1;
		var stY = posY * t.stepY + 1;

		t.ctx.fillStyle = t.bgColor;
		t.ctx.fillRect(stX+1, stY+1, t.stepX-2, t.stepY-2);

		t.ctx.lineWidth = 1;
		t.ctx.lineCap = 'square';
		
		var lLen = 4;
		if (isActive != undefined) {
			if (isActive == true) {
				t.ctx.strokeStyle = '#000';
			} else {
				t.ctx.strokeStyle = t.bgColor;
			}
			t.ctx.beginPath();
			t.ctx.moveTo(stX, stY + lLen);
			t.ctx.lineTo(stX, stY);
			t.ctx.lineTo(stX + t.stepX, stY);
			t.ctx.lineTo(stX + t.stepX, stY + lLen);
			t.ctx.stroke();

			t.ctx.beginPath();
			t.ctx.moveTo(stX, stY + t.stepY - lLen);
			t.ctx.lineTo(stX, stY + t.stepY);
			t.ctx.lineTo(stX + t.stepX, stY + t.stepY);
			t.ctx.lineTo(stX + t.stepX, stY + t.stepY - lLen);
			t.ctx.stroke();
		}

		var charData = t.workData[charPos];
		var charDataPos = 0;

		var pixelSize = 2;
		if (t.charWidth > 8) {
			pixelSize = 1;
		}
		var smX = Math.round((t.stepX - t.charWidth*pixelSize)/2)-3+1;
		var smY = Math.ceil((t.stepY - t.charHeight*pixelSize)/2)-1+1;

		for (var y=0; y<t.charHeight; y++) {
			var lineData = charData[charDataPos];
			t.drawLine(lineData, stX + smX, stY + smY + pixelSize * y, pixelSize);
			charDataPos++;

			if (t.charWidth == 16) {
				lineData = charData[charDataPos];
				charDataPos++;
				t.drawLine(lineData, stX + smX + 8*pixelSize, stY + smY + pixelSize * y, pixelSize);
			}
		}
		
	},

	drawLine: function(lineData, posX, posY, pixelSize) {
		var t = this;
		for (var x=0; x<8; x++) {
			if (((lineData >> x) & 1) > 0) {
				t.ctx.fillStyle = '#000';
			} else {
				t.ctx.fillStyle = t.bgColor2;
			}
			t.ctx.fillRect(posX + pixelSize*(8 - x), posY, pixelSize, pixelSize);
		}
	}
	
});
