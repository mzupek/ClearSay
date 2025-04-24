import { nanoid } from 'nanoid'

interface QRCodeData {
  type: 'performance_sync'
  setId: string
  timestamp: number
}

export async function generateQRCode(data: QRCodeData): Promise<string> {
  // Generate a unique, temporary code
  const tempCode = nanoid()
  
  // Combine the data with the temporary code
  const qrData = {
    ...data,
    code: tempCode
  }
  
  // Return the encoded data - this will be converted to a QR code by the UI
  return Buffer.from(JSON.stringify(qrData)).toString('base64')
} 