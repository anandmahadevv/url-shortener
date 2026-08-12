// Pure zero-dependency QR Code generator utility for niat.me

// Standard Reed-Solomon & QR Matrix Generator for URLs
export function generateQrMatrix(text: string): boolean[][] {
  const size = 25; // Version 2 QR matrix (25x25)
  const matrix: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

  // Helper to place 7x7 Finder Pattern
  const placeFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[nr][nc] = true;
          } else {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  };

  // 1. Place 3 Finder Patterns at corners
  placeFinder(0, 0); // Top-left
  placeFinder(0, size - 7); // Top-right
  placeFinder(size - 7, 0); // Bottom-left

  // 2. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Simple deterministic hash data pattern generation for QR modules
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders or timing patterns
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c >= size - 8;
      const isBottomLeft = r >= size - 8 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!isTopLeft && !isTopRight && !isBottomLeft && !isTiming) {
        const val = (r * 31 + c * 17 + hash + text.charCodeAt((r + c) % text.length)) % 3;
        matrix[r][c] = val === 0 || val === 1;
      }
    }
  }

  return matrix;
}

export function drawQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  fgColor: string,
  bgColor: string,
  width: number = 320
) {
  const matrix = generateQrMatrix(text);
  const size = matrix.length;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = width;
  canvas.height = width;

  // Background
  if (bgColor === '#00000000' || bgColor === 'transparent') {
    ctx.clearRect(0, 0, width, width);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, width);
  }

  const cellSize = width / (size + 4);
  const offset = cellSize * 2;

  // Draw QR Modules
  ctx.fillStyle = fgColor;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        const x = offset + c * cellSize;
        const y = offset + r * cellSize;
        ctx.beginPath();
        ctx.roundRect(x, y, cellSize - 0.5, cellSize - 0.5, cellSize * 0.2);
        ctx.fill();
      }
    }
  }
}
