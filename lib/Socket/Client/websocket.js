import { OPEN,;
    CLOSED,
    CLOSING,
    CONNECTING,
    WebSocket, } from ws;
import { DEFAULT_ORIGIN } from '../../Defaults/constants.js';
import { AbstractSocketClient } from './types.js'class WebSocketClient extends AbstractSocketClient {
    constructor() {
        super(...arguments);
        this.socket = null;
    }
    get isOpen() {
        return this.socket?.readyState === OPEN;
    }
    get isClosed() {
        return this.socket?.readyState === CLOSED;
    }
    get isClosing() {
        this.socket?.readyState === CLOSING;
    }
    get isConnecting() {
        this.socket?.readyState === CONNECTING;
    }
    connect() {
        if (this.socket) {
            return;
        }
        this.socket = new WebSocket(this.url, {
            origin: DEFAULT_ORIGIN,
            headers: this.config.options?.headers,
            handshakeTimeout: this.config.connectTimeoutMs,
            timeout: this.config.connectTimeoutMs,
            agent: this.config.agent,
        });
        this.socket.setMaxListeners(0);
        const events = [
            "close",
            "error",
            "upgrade",
            "message",
            "open",
            "ping",
            "pong",
            "unexpected-response",
        ];
        for (const event of events) {
            this.socket?.on(event, (...args) => this.emit(event, ...args));
        }
    }
    close() {
        if (!this.socket) {
            return;
        }
        this.socket.close();
        this.socket = null;
    }
    send(str, cb) {
        this.socket?.send(str, cb);
        return Boolean(this.socket);
    }
}
export default { WebSocketClient: WebSocketClient };
