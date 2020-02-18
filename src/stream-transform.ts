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

                let length: number = 1

                if (chunk.length > count) {
                    length = Math.floor(chunk.length / count)
                    const decimalPart: number = parseFloat((chunk.length / count % 1).toFixed(2))

                    if (current < Math.round(decimalPart * count)) {
                        length = length + 1
                    }
                }

                const buffer: Buffer = Buffer.alloc(length, 0)

                for (let i = 0; i < length; i++) {
                    buffer[i] = chunk[i * count + current]
                }

                callback(null, buffer)
            }
        })
    }
}
