import { expect } from 'chai'
import 'mocha'

import { Transform } from 'stream'
import StreamTransform from '../src/stream-transform'

describe('StreamTransform', function () {
    let counter: number
    const done = function (length: number, _done: Function): void {
        if (++counter >= length) {
            _done()
        }
    }

    /**
     * @summary Add a listener on the "add" event then check if the chunck is equal to the result parameter. the callback is then called
     */
    const waitReadableDataAndCheckChunkEqualToResult = function (transform: Transform, result: string, callback: Function): void {
        transform.on('data', (chunk) => {
            expect(chunk.toString('utf8')).to.equal(result)
            callback()
        })
    }

    beforeEach(function () {
        counter = 0
    })

    it('create some transforms and write buffer with a size of 3.', function (_done) {
        const length: number = 5
        const transforms: Transform[] = Array.from({ length }, (_, idx) => StreamTransform.createTransform(idx, length))
        const callback = (): void => done(length, _done)

        waitReadableDataAndCheckChunkEqualToResult(transforms[0], '0', callback)
        waitReadableDataAndCheckChunkEqualToResult(transforms[1], '1', callback)
        waitReadableDataAndCheckChunkEqualToResult(transforms[2], '2', callback)
        waitReadableDataAndCheckChunkEqualToResult(transforms[3], '\u0000', callback)
        waitReadableDataAndCheckChunkEqualToResult(transforms[4], '\u0000', callback)
        transforms.forEach((transform) => transform.write('012'))
    })

    it('create some transforms and write buffer with a size of 11.', function (_done) {
        const length: number = 5
        const transforms: Transform[] = Array.from({ length }, (_, idx) => StreamTransform.createTransform(idx, length))
        const callback = (): void => done(length, _done)

        waitReadableDataAndCheckChunkEqualToResult(transforms[0], '05a', callback)
        waitReadableDataAndCheckChunkEqualToResult(transforms[1], '16', callback)
        waitReadableDataAndCheckChunkEqualToResult(transforms[2], '27', callback)
        waitReadableDataAndCheckChunkEqualToResult(transforms[3], '38', callback)
        waitReadableDataAndCheckChunkEqualToResult(transforms[4], '49', callback)
        transforms.forEach((transform) => transform.write('0123456789a'))
    })

    // TODO: add a test for more than 65k kb
})

/*
const input = new Duplex()
const output = new Duplex()

input.push(Buffer.from('0123456789', 'utf-8'))
input.push(null)

// .pipe(transforms[0])
input.pipe(output)

const res = await output.read()
console.log('res', res)
 */
