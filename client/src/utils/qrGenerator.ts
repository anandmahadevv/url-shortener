import QRCode from 'qrcode';

/**
 * Renders a real, ISO/IEC 18004 standard scannable QR code onto a HTMLCanvasElement.
 * Supports custom foreground & background colors, error correction, and resolution scaling.
 */
export async function drawQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  fgColor: string = '#10b981',
  bgColor: string = '#090a0d',
  width: number = 320
): Promise<void> {
  try {
    const isTransparent = bgColor === '#00000000' || bgColor === 'transparent';

    await QRCode.toCanvas(canvas, text || 'https://niat.me', {
      width: width,
      margin: 2,
      color: {
        dark: fgColor,
        light: isTransparent ? '#00000000' : bgColor
      },
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    console.error('Error rendering QR code to canvas:', err);
  }
}

/**
 * Generates a PNG Data URL string for high-resolution downloads or direct sharing.
 */
export async function generateQrDataUrl(
  text: string,
  fgColor: string = '#10b981',
  bgColor: string = '#090a0d',
  width: number = 1024
): Promise<string> {
  const isTransparent = bgColor === '#00000000' || bgColor === 'transparent';

  return QRCode.toDataURL(text || 'https://niat.me', {
    width: width,
    margin: 2,
    color: {
      dark: fgColor,
      light: isTransparent ? '#00000000' : bgColor
    },
    errorCorrectionLevel: 'H'
  });
}
