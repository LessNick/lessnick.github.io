/**
 * Преобразует изображение в бинарный массив байтов заданного размера.
 * @param {HTMLImageElement|HTMLCanvasElement} sourceImage - Исходное изображение.
 * @param {number} targetWidth - Целевая ширина матрицы в пикселях.
 * @param {number} targetHeight - Целевая высота матрицы в пикселях.
 * @param {number} threshold - Порог разделения черного/белого (0-255).
 * @returns {Uint8Array} Массив байтов (битовая маска).
 */
function imageToByteArray(sourceImage, stX, stY, targetWidth, targetHeight, threshold = 128) {
	const canvas = document.createElement('canvas');
	canvas.width = targetWidth;
	canvas.height = targetHeight;
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = '#ffffff'; 
	ctx.fillRect(0, 0, targetWidth, targetHeight);
	ctx.drawImage(sourceImage, stX, stY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);

	const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
	const totalPixels = targetWidth * targetHeight;
	const byteArraySize = Math.ceil(totalPixels / 8);
	const byteArray = new Uint8Array(byteArraySize);

	for (let i = 0; i < totalPixels; i++) {
		const rIdx = i * 4;
		const r = imgData[rIdx];
		const g = imgData[rIdx + 1];
		const b = imgData[rIdx + 2];
		
		const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

		// Определяем цвет: 1 — черный (шрифт), 0 — белый (фон)
		// Измените условие, если нужна обратная инверсия
		const bit = brightness < threshold ? 1 : 0;

		const byteIdx = Math.floor(i / 8);
		const bitIdx = 7 - (i % 8); // Заполнение от старшего бита к младшему

		if (bit === 1) {
			byteArray[byteIdx] |= (1 << bitIdx);
		}
	}

	return byteArray;
}
