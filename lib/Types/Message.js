import { proto } from '../../WAProto.js';
const WAMessageAddressingMode = {
    PN: "pn",
    LID: "lid",
};
export default {
    WAMessageAddressingMode,
    WAMessageStubType: proto.WebMessageInfo.StubType,
    WAMessageStatus: proto.WebMessageInfo.Status,
    WAProto: proto,
};
