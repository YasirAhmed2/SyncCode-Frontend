import * as Y from 'yjs';

export const CODE_FIELD = 'code';

const toUint8Array = (input: unknown): Uint8Array => {
  if (!input) return new Uint8Array();
  if (input instanceof Uint8Array) return input;

  // Socket.IO may deliver binary payloads as ArrayBuffer or number[]
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (Array.isArray(input)) return new Uint8Array(input as any);

  // Some serializers wrap binary as { type: 'Buffer', data: number[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maybeBuffer = input as any;
  if (maybeBuffer?.type === 'Buffer' && Array.isArray(maybeBuffer?.data)) {
    return new Uint8Array(maybeBuffer.data);
  }

  return new Uint8Array();
};

export const normalizeBinaryUpdate = (payload: unknown): Uint8Array => toUint8Array(payload);

export const encodeYDocState = (ydoc: Y.Doc): string => {
  const update = Y.encodeStateAsUpdate(ydoc);
  // base64 encode for REST persistence
  let binary = '';
  update.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

