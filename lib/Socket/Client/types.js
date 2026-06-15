import { EventEmitter } from 'events';class AbstractSocketClient extends EventEmitter {
    constructor(url, config) {
        super();
        this.url = url;
        this.config = config;
        this.setMaxListeners(0);
    }
}
export default { AbstractSocketClient: AbstractSocketClient };
