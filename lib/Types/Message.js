import { proto } from ../../WAProto;

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
