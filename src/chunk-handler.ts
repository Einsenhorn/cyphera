import fs from 'fs'
import stream from 'stream'
// import crypto from 'crypto'
import { promisify } from 'util'

import StreamTransform from './stream-transform'

const finished = promisify(stream.finished)

// const cipher = crypto.createCipheriv(algorithm, key, Buffer.alloc(16, 0))
// const decipher = crypto.createDecipheriv(algorithm, key, Buffer.alloc(16, 0))

export default class ChunkHandler {
    _directory: string
    _numberOfChunk: number

    /**
     * Class which handles the split of a file into chunks or the merge of chunks into one file.
     * @param numberOfChunk Need to be the same to chunkenize and unchunkenize a file.
     * @param directory Directory to store and locate chunks
     */
    constructor (numberOfChunk: number, directory: string) {
        this._directory = directory
        this._numberOfChunk = numberOfChunk

        // const algorithm = 'aes-192-cbc'
        // const password = 'secret'
        // const key = crypto.scryptSync(password, 'salt', 24)
    }

    /**
     * Split the input into chunks stored in the output directory.
     * @param input
     */
    async chunkenize (input: fs.ReadStream): Promise<void> {
        const transforms = Array.from(new Array(this._numberOfChunk), (_, idx) => StreamTransform.createTransform(idx, this._numberOfChunk))
        const outputs = Array.from(new Array(this._numberOfChunk), (_, idx) => fs.createWriteStream(`${this._directory}chunk-${idx.toString()}`))

        // To improve. Add error handlers
        transforms.forEach((transform, i) => transform.on('data', (chunk: Buffer) => outputs[i].write(chunk)))
        input.on('data', (chunk: Buffer) => transforms.forEach((transform) => transform.write(chunk)))

        await finished(input)
    }

    /**
     * Get all chunks in the directory and merge them.
     * @param filename Name of the file created in the output directory.
     */
    async unchunkenize (filename: string): Promise<void> {
        const inputs = Array.from(new Array(this._numberOfChunk), (_, idx) => fs.createReadStream(`${this._directory}chunk-${idx.toString()}`))
        const output: fs.WriteStream = fs.createWriteStream(`${this._directory}${filename}`)

        const buffers: Buffer[][] = Array.from(new Array(inputs.length), () => [])

        for (let i = 0; i < inputs.length; i++) {
            for await (const chunk of inputs[i]) {
                const buffer: Buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk

                buffers[i].push(buffer)
            }

            // do stuff??
        }

        // flat buffers
        const flatBuffers: Buffer[] = []
        for (let i = 0; i < buffers.length; i++) {
            flatBuffers[i] = Buffer.concat(buffers[i], buffers[i].reduce((acc, val) => acc + val.length, 0))
        }

        const { length, max } = flatBuffers.reduce(
            (acc, val) => ({
                length: acc.length + val.length,
                max: (acc.max > val.length ? acc.max : val.length)
            }),
            {
                length: 0,
                max: 0
            }
        )

        const res: Buffer = Buffer.alloc(length, 0)
        let x = 0
        // To reduce complexity
        for (let i = 0; i < max; i++) {
            for (let j = 0; j < flatBuffers.length; j++) {
                const tmp = flatBuffers[j][i]

                if (typeof tmp !== 'undefined') {
                    res[x++] = tmp
                }
            }
        }

        output.write(res)
        output.end()
    }
}
