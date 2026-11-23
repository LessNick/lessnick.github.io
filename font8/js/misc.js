/**
 * Сдвигает битмап шириной 16px и произвольной высоты на 1 пиксель.
 * @param {number[]} bitmap - Массив байтов (длина должна быть четной: 2 байта на строку).
 * @param {'up' | 'down' | 'left' | 'right'} direction - Направление сдвига.
 * @param {boolean} [cyclic=false] - Циклический сдвиг.
 * @returns {number[]} Новый массив байтов.
 */
function shiftBitmap16xH(bitmap, direction, cyclic = false) {
	if (bitmap.length % 2 !== 0) {
		throw new Error('Длина массива должна быть четной (по 2 байта на строку шириной 16px)');
	}

	const result = [...bitmap];
	const height = result.length / 2;

	if (height === 0) return result;

	switch (direction) {
		case 'up': {
			const topRow = result.splice(0, 2);
			result.push(...(cyclic ? topRow : [0, 0]));
			break;
		}
		case 'down': {
			const bottomRow = result.splice(result.length - 2, 2);
			result.unshift(...(cyclic ? bottomRow : [0, 0]));
			break;
		}
		case 'left': {
			for (let row = 0; row < height; row++) {
				const leftIdx = row * 2;
				const rightIdx = leftIdx + 1;

				const leftMsb = (result[leftIdx] & 0x80) >> 7;
				const rightMsb = (result[rightIdx] & 0x80) >> 7;

				result[leftIdx] = ((result[leftIdx] << 1) | rightMsb) & 0xFF;
				result[rightIdx] = ((result[rightIdx] << 1) | (cyclic ? leftMsb : 0)) & 0xFF;
			}
			break;
		}
		case 'right': {
			for (let row = 0; row < height; row++) {
				const leftIdx = row * 2;
				const rightIdx = leftIdx + 1;

				const leftLsb = (result[leftIdx] & 0x01) << 7;
				const rightLsb = (result[rightIdx] & 0x01) << 7;

				result[leftIdx] = (result[leftIdx] >> 1) | (cyclic ? rightLsb : 0);
				result[rightIdx] = (result[rightIdx] >> 1) | leftLsb;
			}
			break;
		}
		default:
			throw new Error(`Неизвестное направление: ${direction}`);
	}

	return result;
}

/**
 * Сдвигает битмап 16x16 (32 байта) на 1 пиксель в заданном направлении.
 * @param {number[]} bitmap - Массив из 32 байтов (по 2 байта на строку, сверху вниз).
 * @param {'up' | 'down' | 'left' | 'right'} direction - Направление сдвига.
 * @param {boolean} [cyclic=false] - Циклический сдвиг.
 * @returns {number[]} Новый массив из 32 байтов.
 */
function shiftBitmap16x16(bitmap, direction, cyclic = false) {
	const result = [...bitmap];

	switch (direction) {
		case 'up': {
			const topRow = result.splice(0, 2);
			result.push(...(cyclic ? topRow : [0, 0]));
			break;
		}
		case 'down': {
			const bottomRow = result.splice(30, 2);
			result.unshift(...(cyclic ? bottomRow : [0, 0]));
			break;
		}
		case 'left': {
			for (let row = 0; row < 16; row++) {
				const leftIdx = row * 2;
				const rightIdx = leftIdx + 1;

				const leftMsb = (result[leftIdx] & 0x80) >> 7;
				const rightMsb = (result[rightIdx] & 0x80) >> 7;

				result[leftIdx] = ((result[leftIdx] << 1) | rightMsb) & 0xFF;
				result[rightIdx] = ((result[rightIdx] << 1) | (cyclic ? leftMsb : 0)) & 0xFF;
			}
			break;
		}
		case 'right': {
			for (let row = 0; row < 16; row++) {
				const leftIdx = row * 2;
				const rightIdx = leftIdx + 1;

				const leftLsb = (result[leftIdx] & 0x01) << 7;
				const rightLsb = (result[rightIdx] & 0x01) << 7;

				result[leftIdx] = (result[leftIdx] >> 1) | (cyclic ? rightLsb : 0);
				result[rightIdx] = (result[rightIdx] >> 1) | leftLsb;
			}
			break;
		}
		default:
			throw new Error(`Неизвестное направление: ${direction}`);
	}

	return result;
}

/**
 * Сдвигает битмап 8x8 на 1 пиксель в заданном направлении.
 * @param {number[]} bitmap - Массив из 8 байтов (строки сверху вниз).
 * @param {'up' | 'down' | 'left' | 'right'} direction - Направление сдвига.
 * @param {boolean} [cyclic=false] - Циклический сдвиг (перенос края на другую сторону).
 * @returns {number[]} Новый массив из 8 байтов.
 */
function shiftBitmap8x8(bitmap, direction, cyclic = false) {
	const result = [...bitmap];

	switch (direction) {
		case 'up': {
			const topRow = result.shift();
			result.push(cyclic ? topRow : 0);
			break;
		}
		case 'down': {
			const bottomRow = result.pop();
			result.unshift(cyclic ? bottomRow : 0);
			break;
		}
		case 'left': {
			for (let i = 0; i < 8; i++) {
				const msb = cyclic ? ((result[i] & 0x80) >> 7) : 0;
				// & 0xFF обрезает число до 8 бит, так как в JS числа 32-битные
				result[i] = ((result[i] << 1) | msb) & 0xFF;
			}
			break;
		}
		case 'right': {
			for (let i = 0; i < 8; i++) {
				const lsb = cyclic ? ((result[i] & 0x01) << 7) : 0;
				result[i] = (result[i] >> 1) | lsb;
			}
			break;
		}
		default:
			throw new Error(`Неизвестное направление: ${direction}`);
	}

	return result;
}

/**
 * Зеркально отражает битмап шириной 16px и произвольной высоты.
 * Каждая строка занимает 2 байта (левый и правый).
 * 
 * @param {number[] | Uint8Array} bitmap - Массив байтов (длина должна быть четной: height * 2).
 * @param {'horizontal' | 'vertical' | 'both'} direction - Направление отражения.
 * @returns {number[]} Новый массив байтов с отраженным битмапом.
 */
function mirrorBitmap16xH(bitmap, direction = 'horizontal') {
	if (bitmap.length % 2 !== 0) {
		throw new Error('Длина массива для ширины 16px должна быть четной (по 2 байта на строку).');
	}

	const height = bitmap.length / 2;

	const reverseByte = (byte) => {
		let reversed = 0;
		for (let i = 0; i < 8; i++) {
			reversed = (reversed << 1) | (byte & 1);
			byte >>= 1;
		}
		return reversed;
	};

	let result = [...bitmap];

	if (direction === 'vertical' || direction === 'both') {
		const verticalFlipped = new Array(bitmap.length);
		for (let row = 0; row < height; row++) {
			const srcIndex = row * 2;
			const destIndex = (height - 1 - row) * 2;
			verticalFlipped[destIndex] = result[srcIndex];         // Левый байт
			verticalFlipped[destIndex + 1] = result[srcIndex + 1]; // Правый байт
		}
		result = verticalFlipped;
	}

	if (direction === 'horizontal' || direction === 'both') {
		const horizontalFlipped = new Array(bitmap.length);
		for (let row = 0; row < height; row++) {
			const i = row * 2;
			const leftByte = result[i];
			const rightByte = result[i + 1];

			horizontalFlipped[i] = reverseByte(rightByte);    // Правый становится левым
			horizontalFlipped[i + 1] = reverseByte(leftByte); // Левый становится правым
		}
		result = horizontalFlipped;
	}

	return result;
}


/**
 * Зеркально отражает 16x16 битмап (массив из 32 байт, по 2 байта на строку).
 * 
 * @param {number[] | Uint8Array} bitmap - Массив из 32 чисел (от 0 до 255).
 * @param {'horizontal' | 'vertical' | 'both'} direction - Направление отражения.
 * @returns {number[]} Новый массив из 32 байт с отраженным битмапом.
 */
function mirrorBitmap16x16(bitmap, direction = 'horizontal') {
	const reverseByte = (byte) => {
		let reversed = 0;
		for (let i = 0; i < 8; i++) {
			reversed = (reversed << 1) | (byte & 1);
			byte >>= 1;
		}
		return reversed;
	};

	let result = [...bitmap];

	if (direction === 'vertical' || direction === 'both') {
		const verticalFlipped = new Array(32);
		for (let row = 0; row < 16; row++) {
			const srcIndex = row * 2;
			const destIndex = (15 - row) * 2;
			verticalFlipped[destIndex] = result[srcIndex];         // Левый байт строки
			verticalFlipped[destIndex + 1] = result[srcIndex + 1]; // Правый байт строки
		}
		result = verticalFlipped;
	}

	if (direction === 'horizontal' || direction === 'both') {
	const horizontalFlipped = new Array(32);
	for (let row = 0; row < 16; row++) {
		const i = row * 2;
		const leftByte = result[i];
		const rightByte = result[i + 1];

		horizontalFlipped[i] = reverseByte(rightByte);     // Бывший правый становится левым
		horizontalFlipped[i + 1] = reverseByte(leftByte);  // Бывший левый становится правым
	}
	result = horizontalFlipped;
	}

	return result;
}


/**
 * Зеркально отражает 8x8 битмап (массив из 8 байт).
 * 
 * @param {number[] | Uint8Array} bitmap - Массив из 8 чисел (от 0 до 255).
 * @param {'horizontal' | 'vertical' | 'both'} direction - Направление отражения.
 * @returns {number[]} Новый массив с отраженным битмапом.
 */
function mirrorBitmap8x8(bitmap, direction = 'horizontal') {
	const reverseByte = (byte) => {
		let reversed = 0;
		for (let i = 0; i < 8; i++) {
			reversed = (reversed << 1) | (byte & 1);
			byte >>= 1;
		}
		return reversed;
	};

	let result = [...bitmap];
	if (direction === 'vertical' || direction === 'both') {
		result.reverse();
	}

	if (direction === 'horizontal' || direction === 'both') {
		result = result.map(reverseByte);
	}

	return result;
}


/**
 * Поворачивает 16x16 битмап (32 байта) на 90 градусов против часовой стрелки.
 * @param {number[] | Uint8Array} bitmap - Исходный массив из 32 байт (по 2 байта на строку).
 * @returns {Uint8Array} Новый массив из 32 байт.
 */
function rotate16x16CounterClockwise(bitmap) {
	const result = new Uint8Array(32);

	for (let row = 0; row < 16; row++) {
		for (let col = 0; col < 16; col++) {

			const srcByteIdx = row * 2 + (col >> 3);
			const srcBitPos = 7 - (col & 7);

			const bit = (bitmap[srcByteIdx] >> srcBitPos) & 1;

			if (bit) {
				const dstRow = 15 - col;
				const dstCol = row;

				const dstByteIdx = dstRow * 2 + (dstCol >> 3);
				const dstBitPos = 7 - (dstCol & 7);

				result[dstByteIdx] |= (1 << dstBitPos);
			}
		}
	}

	return result;
}

/**
 * Поворачивает 8x8 битмап (8 байт) на 90 градусов против часовой стрелки.
 * @param {number[] | Uint8Array} bitmap - Исходный массив из 8 байт.
 * @returns {Uint8Array} Новый массив из 8 байт.
 */
function rotate90CounterClockwise(bitmap) {
	const result = new Uint8Array(8);

	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const bit = (bitmap[row] >> (7 - col)) & 1;

			if (bit) {
			const dstRow = 7 - col;
			const dstBitPos = 7 - row;

			result[dstRow] |= (1 << dstBitPos);
			}
		}
	}

	return result;
}

/**
 * Поворачивает 16x16 битмап (32 байта) на 90 градусов по часовой стрелке.
 * @param {number[] | Uint8Array} bitmap - Исходный массив из 32 байт (по 2 байта на строку).
 * @returns {Uint8Array} Новый массив из 32 байт.
 */
function rotate16x16Clockwise(bitmap) {
	const result = new Uint8Array(32);

	for (let row = 0; row < 16; row++) {
		for (let col = 0; col < 16; col++) {
			const srcByteIdx = row * 2 + (col >> 3);
			const srcBitPos = 7 - (col & 7);

			const bit = (bitmap[srcByteIdx] >> srcBitPos) & 1;

			if (bit) {
				const dstRow = col;
				const dstCol = 15 - row;

				const dstByteIdx = dstRow * 2 + (dstCol >> 3);
				const dstBitPos = 7 - (dstCol & 7);

				result[dstByteIdx] |= (1 << dstBitPos);
			}
		}
	}

	return result;
}

/**
 * Поворачивает 8x8 битмап (8 байт) на 90 градусов против часовой стрелки.
 * @param {number[] | Uint8Array} bitmap - Исходный массив из 8 байт.
 * @returns {Uint8Array} Новый массив из 8 байт.
 */
function rotate90CounterClockwise(bitmap) {
	const result = new Uint8Array(8);

	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const bit = (bitmap[row] >> (7 - col)) & 1;

			if (bit) {
				const dstRow = 7 - col;
				const dstBitPos = 7 - row;

				result[dstRow] |= (1 << dstBitPos);
			}
		}
	}

	return result;
}

/**
 * Поворачивает 8x8 битмап (8 байт) на 90 градусов по часовой стрелке.
 * @param {number[] | Uint8Array} bitmap - Исходный массив из 8 байт.
 * @returns {Uint8Array} Новый массив из 8 байт.
 */
function rotate90Clockwise(bitmap) {
	const result = new Uint8Array(8);

	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const bit = (bitmap[row] >> (7 - col)) & 1;

			if (bit) {
				result[col] |= (1 << row);
			}
		}
	}

	return result;
}

/**
 * Преобразует массив 16-битных чисел в массив байтов (Big-Endian: старший байт первый).
 * @param {number[] | Uint16Array | Int16Array} words - Массив 16-битных чисел.
 * @returns {Uint8Array} Массив байтов (длина в 2 раза больше исходного).
 */
function uint16ToBytesBE(words) {
	const bytes = new Uint8Array(words.length * 2);

	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		bytes[i * 2] = (word >>> 8) & 0xFF;  // Старший байт (первый)
		bytes[i * 2 + 1] = word & 0xFF;      // Младший байт (второй)
	}

	return bytes;
}


/**
 * Преобразует массив байтов в массив 16-битных чисел (Big-Endian).
 * @param {number[] | Uint8Array} bytes - Исходный массив байтов (четной длины).
 * @returns {Uint16Array} Массив 16-битных беззнаковых чисел.
 */
function bytesToUint16BE(bytes) {
	const length = Math.floor(bytes.length / 2);
	const result = new Uint16Array(length);

	for (let i = 0; i < length; i++) {
		const highByte = bytes[i * 2] & 0xFF;     // Первый байт (старший)
		const lowByte = bytes[i * 2 + 1] & 0xFF;  // Второй байт (младший)

		result[i] = (highByte << 8) | lowByte;
	}

	return result;
}

/**
 * Создает контур (outline) для символа шириной до 16 пикселей и заданной высоты.
 * @param {number[] | Uint8Array} bytes - Массив байтов (по 2 байта на строку, Big-Endian).
 * @param {boolean} [includeDiagonals=false] - True для 8-связности (с углами), false для 4-связности.
 * @param {number} [height=Math.floor(bytes.length / 2)] - Высота символа в строках (по умолчанию вычисляется из длины массива).
 * @returns {Uint8Array} Массив байтов размером height * 2.
 */

function createOutline16xNBytes(bytes, includeDiagonals = false, height = Math.floor(bytes.length / 2)) {
	if (height <= 0) {
		return new Uint8Array(0);
	}

	const rows = new Uint16Array(height);
	for (let i = 0; i < height; i++) {
		const highByte = (bytes[i * 2] || 0) & 0xFF;
		const lowByte = (bytes[i * 2 + 1] || 0) & 0xFF;
		rows[i] = (highByte << 8) | lowByte;
	}

	const hDilated = new Uint16Array(height);
	for (let i = 0; i < height; i++) {
		const row = rows[i];
		hDilated[i] = (row | (row << 1) | (row >>> 1)) & 0xFFFF;
	}

	const resultBytes = new Uint8Array(height * 2);
	const lastRow = height - 1;

	for (let i = 0; i < height; i++) {
		const prev = i > 0 ? (includeDiagonals ? hDilated[i - 1] : rows[i - 1]) : 0;
		const curr = hDilated[i];
		const next = i < lastRow ? (includeDiagonals ? hDilated[i + 1] : rows[i + 1]) : 0;

		const outlineRow = ((prev | curr | next) & ~rows[i]) & 0xFFFF;

		resultBytes[i * 2] = (outlineRow >>> 8) & 0xFF;     // Старший байт (левый)
		resultBytes[i * 2 + 1] = outlineRow & 0xFF;         // Младший байт (правый)
	}

	return resultBytes;
}



/**
 * Создает контур (outline) для символа 16x16.
 * @param {number[] | Uint16Array} glyph - Массив из 16 16-битных чисел (строк).
 * @param {boolean} includeDiagonals - True для 8-связности (с углами), false для 4-связности.
 * @returns {Uint16Array} Массив из 16 16-битных чисел.
*/
function createOutline16x16(glyph, includeDiagonals = false, fontHeight) {
	const outline = new Uint16Array(16);
	const hDilated = new Uint16Array(16);

	for (let i = 0; i < 16; i++) {
		const row = glyph[i] & 0xFFFF;
		hDilated[i] = (row | (row << 1) | (row >>> 1)) & 0xFFFF;
	}

	for (let i = 0; i < 16; i++) {
		const prev = i > 0 ? (includeDiagonals ? hDilated[i - 1] : glyph[i - 1]) : 0;
		const curr = hDilated[i];
		const next = i < 15 ? (includeDiagonals ? hDilated[i + 1] : glyph[i + 1]) : 0;

		outline[i] = ((prev | curr | next) & ~glyph[i]) & 0xFFFF;
	}

	return outline;
}

/**
 * Создает контур (outline) для символа 8x8 в пределах 8 байт.
 * @param {number[]} glyph - Массив из 8 байт.
 * @param {boolean} includeDiagonals - True для 8-связности (с углами), false для 4-связности (без углов).
 * @returns {Uint8Array} Массив из 8 байт с контуром.
*/

function createOutline8x8(glyph, includeDiagonals = false) {
	const outline = new Uint8Array(8);

	const hDilated = new Uint8Array(8);
	for (let i = 0; i < 8; i++) {
		const row = glyph[i] & 0xFF;
		hDilated[i] = (row | (row << 1) | (row >>> 1)) & 0xFF;
	}

	for (let i = 0; i < 8; i++) {
		const prev = i > 0 ? (includeDiagonals ? hDilated[i - 1] : glyph[i - 1]) : 0;
		const curr = hDilated[i];
		const next = i < 7 ? (includeDiagonals ? hDilated[i + 1] : glyph[i + 1]) : 0;

		outline[i] = ((prev | curr | next) & ~glyph[i]) & 0xFF;
	}

	return outline;
}

function countTrailingZeros(byte) {
	const b = byte & 0xff;
	if (b === 0) return 8;
	return 31 - Math.clz32(b & -b);
}

function intToBytesBitwise(num) {
	return [
		(num >>> 24) & 0xff,	// Старший байт (Byte 3)
		(num >>> 16) & 0xff,	// Byte 2
		(num >>> 8)  & 0xff,	// Byte 1
		num & 0xff				// Младший байт (Byte 0) - Big-Endian порядок
	];
}

function intToBytesBitwise64(num) {
	const bigNum = BigInt(num); 
	return [
		Number((bigNum >> 56n) & 0xffn), // Старший байт
		Number((bigNum >> 48n) & 0xffn),
		Number((bigNum >> 40n) & 0xffn),
		Number((bigNum >> 32n) & 0xffn),
		Number((bigNum >> 24n) & 0xffn),
		Number((bigNum >> 16n) & 0xffn),
		Number((bigNum >> 8n)  & 0xffn),
		Number(bigNum & 0xffn)           // Младший байт
	];
}

function base64ToByteArray(base64String) {
	const cleanBase64 = base64String.replace('data:application/octet-stream;base64,', '');
	const binaryString = atob(cleanBase64);
	const regularArray = Array.from(binaryString, (char) => char.charCodeAt(0));

	return regularArray;
}

function convertTo2DArray(oneDimensionalArray, chunkSize) {
	const matrix = [];

	for (let i = 0; i < oneDimensionalArray.length; i += chunkSize) {
		const chunk = oneDimensionalArray.slice(i, i + chunkSize);
		matrix.push(chunk);
	}

	return matrix;
}

function matrixToBase64(matrix) {
	const totalBytes = matrix.reduce((sum, row) => sum + row.length, 0);
	const flatUint8Array = new Uint8Array(totalBytes);

	let offset = 0;
	for (const row of matrix) {
		flatUint8Array.set(row, offset);
		offset += row.length;
	}

	let binaryString = '';
	const chunkSize = 65536; // Обрабатываем порциями по 64 КБ
	for (let i = 0; i < flatUint8Array.length; i += chunkSize) {
		const chunk = flatUint8Array.subarray(i, i + chunkSize);
		binaryString += String.fromCharCode.apply(null, chunk);
	}

	return btoa(binaryString);
}
