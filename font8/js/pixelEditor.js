/*
 * *************************************************************************************
 * @class PixelEditor
 * *************************************************************************************
*/
PixelEditor = newClass(null, {
	id: '',
	parent: undefined,
	editorCanvas: undefined,
	ctx: undefined,
	editorCanvasWidth: 200,
	editorCanvasHeight: 200,
	cols: 0,
	rows: 0,
	dpr: 0,
	stepX: 0, 
	stepY: 0,
	bgColor: '#abc',
	isMouseDown: false,
	workData: [],
	prevX: -1,
	prevY: -1,
	charPos: -1,
	cellsColor: '#000',
	drawMode: 'xor',
	
	constructor: function(id, parent, cols, rows, bgColor, isMain) {
		var t = this;
		t.id = id;
		t.parent = parent;
		t.cols = cols;
		t.rows = rows;
		t.bgColor = bgColor;
		t.isMouseDown = false;
		t.prevX = -1;
		t.prevY = -1;
		t.charPos = -1;
		t.drawMode = 'xor';

		t.workData = Array.from({ length: rows }, () => new Array(cols).fill(0));
		t.dpr = window.devicePixelRatio || 1;

		var div = '<canvas id="' + t.id +'" class="editorCanvas"></canvas>';
		t.parent.append(div);

		t.editorCanvas = $('#' + t.id);
    	t.ctx = t.editorCanvas[0].getContext('2d');

		t.editorCanvas.attr('width', t.editorCanvasWidth * t.dpr);
		t.editorCanvas.attr('height', t.editorCanvasHeight * t.dpr);

		t.editorCanvas.css({
			width: t.editorCanvasWidth + 'px',
			height: t.editorCanvasHeight + 'px'
		});

		t.ctx.scale(t.dpr, t.dpr);
		
		t.stepX = t.editorCanvasWidth/t.cols;
		t.stepY = t.editorCanvasHeight/t.rows;

		t.clearSurface();

		t.editorCanvas.on('mousedown', function(e) {
			const rect = this.getBoundingClientRect();
			t.drawPixel(
				Math.floor((e.clientX - rect.left) / t.stepX),
				Math.floor((e.clientY - rect.top) / t.stepY)
			);

			t.isMouseDown = true;
		});

		t.editorCanvas.on('mouseup', function(e) {
			const rect = this.getBoundingClientRect();
			t.drawPixel(
				Math.floor((e.clientX - rect.left) / t.stepX),
				Math.floor((e.clientY - rect.top) / t.stepY)
			);
			t.isMouseDown = false;			
		});

		t.editorCanvas.on('mousemove', function(e) {
			if (t.isMouseDown == true) {
				const rect = this.getBoundingClientRect();
				t.drawPixel(
					Math.floor((e.clientX - rect.left) / t.stepX),
					Math.floor((e.clientY - rect.top) / t.stepY)
				);
			}
		});

	},

	setDrawMode: function(mode) {
		var t = this;
		t.drawMode = mode;
	},

	updateSize: function(newCols, newRows) {
		var t = this;
		if (t.cols != newCols || t.rows != newRows) {
			t.setSize(newCols, newRows);
		}
	},

	setSize: function(cols, rows) {
		var t = this;
		t.cols = cols;
		t.rows = rows;
		
		t.stepX = t.editorCanvasWidth/t.cols;
		t.stepY = t.editorCanvasHeight/t.rows;

		t.workData = Array.from({ length: rows }, () => new Array(cols).fill(0));

		t.clearSurface();

	},

	clearSurface: function() {
		var t = this;
		
		t.ctx.fillStyle = t.bgColor;
		t.ctx.fillRect(0, 0, t.editorCanvasWidth, t.editorCanvasHeight);

		t.ctx.strokeStyle = t.cellsColor;
		t.ctx.lineWidth = 1;
		t.ctx.lineCap = 'square';

		for (var x = t.stepX; x < t.editorCanvasWidth; x += t.stepX) {
			t.ctx.beginPath();
			t.ctx.moveTo(x, 0);
			t.ctx.lineTo(x, t.editorCanvasHeight);
			t.ctx.stroke();
		}
		for (var y = t.stepY; y < t.editorCanvasHeight; y += t.stepY) {
			t.ctx.beginPath();
			t.ctx.moveTo(0, y);
			t.ctx.lineTo(t.editorCanvasWidth, y);
			t.ctx.stroke();
		}
	},

	drawPixel: function(posX, posY) {
		var t = this;
		if (posX < 0) posX = 0;
		if (posX > t.cols - 1) posX = t.cols - 1;
		if (posY < 0) posY = 0;
		if (posY > t.rows - 1) posY = t.rows - 1;
		if (posX != t.prevX || posY != t.prevY || t.isMouseDown != true) {
			t.prevX = posX;
			t.prevY = posY;

			if (t.drawMode == 'xor') {
				if (t.workData[posY][posX] == 0) {
					t.workData[posY][posX] = 1;
					t.ctx.fillStyle = '#000';
					t.ctx.strokeStyle = '#000';
				} else {
					t.workData[posY][posX] = 0;
					t.ctx.fillStyle = t.bgColor;
					t.ctx.strokeStyle = t.cellsColor;
				}
			} else if (t.drawMode == 'erase') {
				t.workData[posY][posX] = 0;
				t.ctx.fillStyle = t.bgColor;
				t.ctx.strokeStyle = t.cellsColor;

			} else if (t.drawMode == 'draw') {
				t.workData[posY][posX] = 1;
				t.ctx.fillStyle = '#000';
				t.ctx.strokeStyle = '#000';
			}

			t.ctx.lineWidth = 1;
			t.ctx.fillRect(posX * t.stepX, posY * t.stepY, t.stepX, t.stepY);
			t.ctx.strokeRect(posX * t.stepX, posY * t.stepY, t.stepX, t.stepY);

			var charData = [];
			var p = 0;
			for (var y=0; y<t.rows; y++) {
				var ar = intToBytesBitwise(parseInt(t.workData[y].join(''), 2));
				var mx = t.cols/8;
				for (var x=0; x < mx; x++) {
					charData[p] = ar[4-mx + x];
					p++;
				}
			}
			gEvent.fireEvent(null, t.id, 'updated', {'charPos': t.charPos, 'charData': charData});
		}
	},

	loadChar: function(charData, charPos) {
		var t = this;
		t.charPos = charPos;		
		t.clearSurface();

		var charDataPos = 0;
		for (var posY=0; posY<t.rows; posY++) {
			for (var part=0; part < t.cols/8; part++) {
				var lineData = charData[charDataPos];
				for (var posX=0; posX < 8; posX++) {
					var value = 0;
					t.ctx.fillStyle = t.bgColor;
					if (((lineData >> posX) & 1) > 0) {
						t.ctx.fillStyle = '#000';
						t.ctx.strokeStyle = '#000';
						value = 1;
					} else {
						t.ctx.fillStyle = t.bgColor;		
						t.ctx.strokeStyle = t.cellsColor;				
						value = 0;
					}
					t.ctx.lineWidth = 1;
					t.ctx.fillRect((7 - posX + part*8) * t.stepX, posY * t.stepY, t.stepX, t.stepY);
					t.ctx.strokeRect((7 - posX + part*8) * t.stepX, posY * t.stepY, t.stepX, t.stepY);

					t.workData[posY][7 - posX + part*8] = value;
				}
				charDataPos++;
			}
		};
	}
});
