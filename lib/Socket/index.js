import { DEFAULT_CONNECTION_CONFIG } from ../Defaults/connection;
import { makeCommunitiesSocket } from ./community;
const makeWASocket = (config) => {
    const newConfig = { ...DEFAULT_CONNECTION_CONFIG, ...config };
    if (config.shouldSyncHistoryMessage === undefined) {
        newConfig.shouldSyncHistoryMessage = () => !!newConfig.syncFullHistory;
    }
    return makeCommunitiesSocket(newConfig);
};
export const default = makeWASocket;
