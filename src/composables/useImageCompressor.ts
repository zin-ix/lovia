/**
 * useImageCompressor — thin wrapper around Compressor.js
 * Compresses an image File/Blob before upload to reduce storage costs.
 */
import Compressor from 'compressorjs'

export interface CompressOptions {
  quality?: number      // 0–1, default 0.8
  maxWidth?: number     // default 1920
  maxHeight?: number    // default 1920
  mimeType?: string     // default 'image/jpeg'
  convertSize?: number  // files larger than this get converted to JPEG (bytes)
}

export function useImageCompressor() {
  /**
   * Compress an image file. Returns a Promise<File>.
   */
  function compressImage(
    file: File,
    options: CompressOptions = {},
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: options.quality ?? 0.8,
        maxWidth: options.maxWidth ?? 1920,
        maxHeight: options.maxHeight ?? 1920,
        mimeType: options.mimeType,
        convertSize: options.convertSize ?? 2_000_000,
        success(result) {
          // Compressor may return a Blob; wrap into a File to preserve the name
          const compressed =
            result instanceof File
              ? result
              : new File([result], file.name, { type: result.type })
          resolve(compressed)
        },
        error(err) {
          console.warn('Compressor.js error, using original file:', err)
          // Graceful fallback — never fail the upload just because compression errored
          resolve(file)
        },
      })
    })
  }

  return { compressImage }
}
