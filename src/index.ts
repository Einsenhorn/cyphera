import fs from 'fs'

import ChunkHandler from './chunk-handler'

const file = 'input/hello-world.txt'
// const file = 'input/lorem-ipsum.txt'
// const file = 'input/IMG_1979.jpg'
// const file = 'input/PopcornTime-latest.exe'

async function main (): Promise<void> {
    const err: any = await fs.promises.access(file, fs.constants.F_OK | fs.constants.R_OK)
    if (typeof err !== 'undefined') {
        throw new Error(err)
    }

    const res: any = await fs.promises.open(file, 'r')
    if (typeof res.err !== 'undefined') {
        throw new Error(res.err)
    }

    const input: fs.ReadStream = fs.createReadStream('', { fd: res.fd })
    const handler: ChunkHandler = new ChunkHandler(5, 'output/')

    await handler
        .chunkenize(input)
        .catch((err) => console.error('chunkenize', err))

    await handler
        .unchunkenize('final-unclear')
        .catch((err) => console.error('unchunkenize', typeof err))

    console.log('=== end ===')
    return Promise.resolve()
}

(async () => main())().catch(e => console.error(e))
