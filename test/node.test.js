import { expect } from 'chai';
import { Readable as NodeNativeReadableStream } from 'node:stream';
import { ReadableStream as NodeWebReadableStream } from 'node:stream/web';
import { toStream, readToEnd } from '@openpgp/web-stream-tools';
import { ReadableStream as PolyfilledReadableStream } from 'web-streams-polyfill';

describe('Node integration tests', () => {
  it('throws on node native stream', async () => {
    const input = new NodeNativeReadableStream();
    expect(() => toStream(input)).to.throw(/Native Node streams are no longer supported/);
  });

  it('accepts node web stream', async () => {
    const input = 'chunk';
    const stream = new NodeWebReadableStream({
      start(controller) {
        controller.enqueue(input);
        controller.close();
      }
    });
    const streamedData = toStream(stream);
    expect(await readToEnd(streamedData)).to.equal(input);
  });

  it('returned node web stream can be converted into node native stream', async () => {
    const input = 'chunk';
    const stream = new NodeWebReadableStream({
      start(controller) {
        controller.enqueue(input);
        controller.close();
      }
    });
    const streamedData = toStream(stream);
    expect(NodeNativeReadableStream.fromWeb(streamedData)).to.exist;
  });

  it('polyfilled web stream cannot be converted into node native stream', async () => {
    // this test is just to keep track that this behaviour is expected
    const input = 'chunk';
    const stream = new PolyfilledReadableStream({
      start(controller) {
        controller.enqueue(input);
        controller.close();
      }
    });
    const streamedData = toStream(stream);
    expect(() => NodeNativeReadableStream.fromWeb(streamedData)).to.throw(/must be an instance of ReadableStream/);
  });
});
