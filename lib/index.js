import { proto } from '../WAProto/index.js';
import { makeWASocket as socket } from './Socket/index.js';

export { proto };
export const makeWASocket = socket;

export * from './Utils/index.js';
export * from './Types/index.js';
export * from './Store/index.js';
export * from './Defaults/index.js';
export * from './WABinary/index.js';
export * from './WAM/index.js';
export * from './WAUSync/index.js';

export default socket;
