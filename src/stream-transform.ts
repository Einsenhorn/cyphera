import { Transform } from 'stream'

export default {
    /**
     * @param current - current transform
     * @param count - number of transform created
     */
    createTransform: (current: number, count: number): Transform => {
        return new Transform({
            transform (chunk: Buffer, _, callback) {
                if (!Buffer.isBuffer(chunk)) {
                    return callback(new Error('Chunk is not a buffer.'))
                }

                const length: number = chunk.length > count ? Math.floor(chunk.length / count + (chunk.length % count === current + 1 ? 1 : 0)) : 1
                const buffer: Buffer = Buffer.alloc(length, 0)

                for (let i = 0; i < length; i++) {
                    buffer[i] = chunk[i * count + current]
                }

                callback(null, buffer)
            }
        })
    }
}
