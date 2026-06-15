import { proto } from ../../WAProto;
const PROCESSABLE_HISTORY_TYPES = [
    proto.Message.HistorySyncType.INITIAL_BOOTSTRAP,
    proto.Message.HistorySyncType.PUSH_NAME,
    proto.Message.HistorySyncType.RECENT,
    proto.Message.HistorySyncType.FULL,
    proto.Message.HistorySyncType.ON_DEMAND,
    proto.HistorySync.HistorySyncType.NON_BLOCKING_DATA,
    proto.HistorySync.HistorySyncType.INITIAL_STATUS_V3,
];
export default { PROCESSABLE_HISTORY_TYPES: PROCESSABLE_HISTORY_TYPES };
