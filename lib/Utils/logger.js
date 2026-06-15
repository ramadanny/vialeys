import pino from 'pino';
export const default = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
