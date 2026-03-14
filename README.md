# <div align='center'>Vialeys - TypeScript/JavaScript WhatsApp Web API</div>

<div align='center'>

<img src="https://cdn.jsdelivr.net/gh/ramadanny/cdn@main/kupu.jpg" alt="Header Image" width="30%"/>

[![npm version](https://img.shields.io/npm/v/vialeys.svg)](https://www.npmjs.com/package/vialeys)
[![License](https://img.shields.io/badge/license-GPL%203-blue.svg)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/vialeys.svg)](https://www.npmjs.com/package/vialeys)

</div>

### Liability and License Notice
Baileys and its maintainers cannot be held liable for misuse of this application, as stated in the MIT license. The maintainers do not condone the use of this application in practices that violate WhatsApp's Terms of Service. Use this application responsibly and fairly.

## Highlights
- **No Browser Needed:** Interfaces directly using a WebSocket, saving ~500MB of RAM compared to Selenium/Chromium.
- **Multi-Device Support:** Interacts seamlessly with multi-device & web versions of WhatsApp.

## 📦 Install & Import

```bash
npm install vialeys
# or
yarn add vialeys
# or
pnpm add vialeys
```

```ts 
import makeWASocket from 'vialeys'
```

---

## 🔌 Connecting Account

### Connect with QR-CODE
```ts
import makeWASocket, { Browsers } from 'vialeys'

const conn = makeWASocket({
    browser: Browsers.ubuntu('My App'),
    printQRInTerminal: true
})
```

### Connect with Pairing Code
```ts
import makeWASocket from 'vialeys'

const conn = makeWASocket({
    printQRInTerminal: false // Must be false for Pairing Code
})

if (!conn.authState.creds.registered) {
    const number = 'XXXXXXXXXXX' // Country code included, no '+' or '-'
    const code = await conn.requestPairingCode(number)
    console.log(code)
}
```

### Receive Full History
Emulate a desktop connection to receive more message history.
```ts
const conn = makeWASocket({
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: true
})
```

---

## 📝 Socket Config Notes

### Caching Group Metadata (Recommended)
```ts
const groupCache = new NodeCache({stdTTL: 5 * 60, useClones: false})
const conn = makeWASocket({
    cachedGroupMetadata: async (jid) => groupCache.get(jid)
})

conn.ev.on('groups.update', async ([event]) => {
    const metadata = await conn.groupMetadata(event.id)
    groupCache.set(event.id, metadata)
})
```

### Improve Retry System & Notifications
```ts
const conn = makeWASocket({
    getMessage: async (key) => await getMessageFromStore(key), // Improves retries & poll decrypts
    markOnlineOnConnect: false // Set false to receive notifications on phone
})
```

---

## 💾 Saving & Restoring Sessions

### Multi-File Auth (Recommended)
```ts
import makeWASocket, { useMultiFileAuthState } from 'vialeys'

const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
const conn = makeWASocket({ auth: state })
conn.ev.on('creds.update', saveCreds)
```

### MongoDB Auth
```ts
import makeWASocket, { useMongoFileAuthState } from 'vialeys'
import { MongoClient } from "mongodb"

const client = new MongoClient('mongoURL')
await client.connect()
const collection = client.db("vialeys").collection("sessions")

const { state, saveCreds } = await useMongoFileAuthState(collection)
const conn = makeWASocket({ auth: state })
conn.ev.on('creds.update', saveCreds)
```

---

## 🕹️ Handling Events & Data Store

### Basic Connection Example
```ts
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from 'vialeys'
import { Boom } from '@hapi/boom'

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys')
    const conn = makeWASocket({ auth: state, printQRInTerminal: true })
    
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) connectToWhatsApp()
        }
    })
    
    conn.ev.on('messages.upsert', async event => {
        for (const m of event.messages) {
            await conn.sendMessage(m.key.remoteJid!, { text: 'Hello Word' })
        }
    })
    
    conn.ev.on('creds.update', saveCreds)
}
connectToWhatsApp()
```

### Implementing an In-Memory Store
```ts
import { makeInMemoryStore } from 'vialeys'

const store = makeInMemoryStore({})
store.readFromFile('./baileys_store.json')
setInterval(() => store.writeToFile('./baileys_store.json'), 10_000)

store.bind(conn.ev)
```

### Decrypt Poll Votes
```ts
import { getAggregateVotesInPollMessage } from 'vialeys'

conn.ev.on("messages.update", async (chatUpdate) => {
    for (const { key, update } of chatUpdate) {
        if (update.pollUpdates && key.fromMe) {
            const pollCreation = await getMessage(key) // from your store
            if (pollCreation) {
                const pollUpdate = await getAggregateVotesInPollMessage({
                    message: pollCreation,
                    pollUpdates: update.pollUpdates,
                })
                const winner = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name
                console.log(winner)
            }
        }
    } 
})
```

---

## 📤 Sending Messages

**Base Syntax:**
```ts
await conn.sendMessage(jid, content, options)
```

### Non-Media Messages

#### Text, Quote, Mention & Forward
```ts
await conn.sendMessage(jid, { text: 'hello word' })
await conn.sendMessage(jid, { text: 'reply' }, { quoted: message })
await conn.sendMessage(jid, { text: '@12345678901', mentions: ['12345678901@s.whatsapp.net'] })
await conn.sendMessage(jid, { forward: msg, force: true })
```

#### Location & Contact
```ts
await conn.sendMessage(jid, { location: { degreesLatitude: 24.12, degreesLongitude: 55.11 }, live: true })
await conn.sendMessage(jid, { contacts: { displayName: 'vialeys', contacts: [{ vcard: 'BEGIN:VCARD...' }] } })
```

#### Reactions, Pins & Keeps
```ts
await conn.sendMessage(jid, { react: { text: '💖', key: message.key } })
await conn.sendMessage(jid, { pin: { type: 1, time: 86400, key: message.key } }) // time: 86400 (24h), 604800 (7d), 2592000 (30d)
await conn.sendMessage(jid, { keep: { type: 1, key: message.key } })
```

#### Polls & Events
```ts
await conn.sendMessage(jid, { poll: { name: 'My Poll', values: ['Option 1', 'Option 2'], selectableCount: 1 } })
await conn.sendMessage(jid, { pollResult: { name: 'Hi', values: [['Option 1', 1000], ['Option 2', 2000]] } })
await conn.sendMessage(jid, { event: { name: 'holiday', description: 'come along', startTime: 123, endTime: 456 } })
```

#### Commerce (Order, Product, Payment, Shop, Collection)
```ts
await conn.sendMessage(jid, { order: { orderId: '574xxx', itemCount: '1', status: 'INQUIRY', surface: 'CATALOG' } })
await conn.sendMessage(jid, { product: { productId: 'id', title: 'title', priceAmount1000: '1000', currencyCode: 'IDR' }, businessOwnerJid: 'jid' })
await conn.sendMessage(jid, { payment: { currency: 'IDR', amount: '10000', note: 'Hi!' } })
await conn.sendMessage(jid, { paymentInvite: { type: 1, expiry: 0 } })
await conn.sendMessage(jid, { text: 'Body', shop: { surface: 1, id: 'url' }, viewOnce: true })
await conn.sendMessage(jid, { text: 'Body', collection: { bizJid: 'jid', id: 'url', version: 1 }, viewOnce: true })
```

#### Invites & Extras
```ts
await conn.sendMessage(jid, { call: { name: 'vialeys', type: 1 } }) // 1=audio, 2=video
await conn.sendMessage(jid, { adminInvite: { jid: '123@newsletter', name: 'news', expiration: 86400 } })
await conn.sendMessage(jid, { groupInvite: { jid: '123@g.us', name: 'group', code: 'code', expiration: 86400 } })
await conn.sendMessage(jid, { sharePhoneNumber: {} })
await conn.sendMessage(jid, { requestPhoneNumber: {} })
await conn.sendMessage(jid, { text: 'Preview', linkPreview: true }) // Requires link-preview-js
await conn.sendMessage(jid, { text: 'AI generated' }, { ai: true })
```

### Interactive & Button Messages

#### Standard Buttons & Lists
```ts
await conn.sendMessage(jid, { text: 'Body', buttons: [{ buttonId: '1', buttonText: { displayText: 'Btn 1' } }] })
await conn.sendMessage(jid, { text: 'List', buttonText: 'View', sections: [{ title: 'Sec 1', rows: [{ title: 'Opt 1', rowId: '1' }] }] })
await conn.sendMessage(jid, { buttonReply: { displayText: 'Hii', id: 'ID' }, type: 'plain' }) // type: 'list', 'plain', 'template', 'interactive'
```

#### Advanced Interactive (Native Flows, Cards, Bottom Sheet)
```ts
// Interactive Buttons
await conn.sendMessage(jid, {
    text: 'Interactive',
    interactiveButtons: [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Click Me!', id: 'id' }) },
        { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Link', url: 'https://...' }) },
        { name: 'cta_call', buttonParamsJson: JSON.stringify({ display_text: 'Call', phone_number: '628xxx' }) }
    ]
})

// Cards Message
await conn.sendMessage(jid, {
    text: 'Body',
    cards: [{
        image: { url: 'img.jpg' }, title: 'Card 1', body: 'Body', 
        buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Btn', id: '1' }) }]
    }]
})

// Bottom Sheet
await conn.sendMessage(jid, {
    title: "Title", body: "Body",
    bottomSheet: {
        listTitle: "Menu", buttonTitle: "Open",
        buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Btn", id: "1" }) }]
    }
})

// PIX / PAY Interactive
await conn.sendMessage(jid, { text: '', interactiveButtons: [{ name: 'payment_info', buttonParamsJson: JSON.stringify({ payment_settings: [{ type: "pix_static_code", pix_static_code: { merchant_name: 'vialeys', key: 'email', key_type: 'EMAIL' } }] }) }] })
```

### Media Messages
*Provide `{ url: string }`, `{ stream: Stream }`, or `Buffer`.*

```ts
await conn.sendMessage(jid, { image: { url: './img.png' }, caption: 'hello' })
await conn.sendMessage(jid, { video: { url: './vid.mp4' }, caption: 'hello', gifPlayback: true }) // GIF
await conn.sendMessage(jid, { video: { url: './vid.mp4' }, ptv: true }) // PTV
await conn.sendMessage(jid, { audio: { url: './audio.mp3' }, mimetype: 'audio/mp4' })
await conn.sendMessage(jid, { image: { url: './img.png' }, viewOnce: true }) // View Once
await conn.sendMessage(jid, { album: [{ image: { url: 'img1.jpg' } }, { video: { url: 'vid1.mp4' } }] })

// Status Mentions
await conn.sendStatusMentions({ text: 'Hello Everyone', backgroundColor: '#000000' }, ['123@s.whatsapp.net'])
```

---

## 🔄 Modifying Messages & Media

```ts
// Edit
await conn.sendMessage(jid, { text: 'updated text', edit: response.key })

// Delete for everyone
await conn.sendMessage(jid, { delete: msg.key })

// Download Media
const stream = await downloadMediaMessage(msg, 'stream', {}, { reuploadRequest: conn.updateMediaMessage })

// Re-upload Media
await conn.updateMediaMessage(msg)
```

---

## 📋 Chat & State Management

```ts
await conn.readMessages([key]) // Mark read
await conn.sendPresenceUpdate('available', jid) // available, unavailable, composing, recording
await conn.rejectCall(callId, callFrom)

// Modify Chats
await conn.chatModify({ archive: true, lastMessages: [msg] }, jid)
await conn.chatModify({ mute: 8 * 60 * 60 * 1000 }, jid) // ms or null to unmute
await conn.chatModify({ markRead: false, lastMessages: [msg] }, jid)
await conn.chatModify({ pin: true }, jid)
await conn.chatModify({ star: { messages: [{ id: 'ID', fromMe: true }], star: true } }, jid)
await conn.chatModify({ clear: { messages: [{ id: 'ID', fromMe: true, timestamp: '123' }] } }, jid) // Delete for me
await conn.chatModify({ delete: true, lastMessages: [{ key: msg.key, messageTimestamp: msg.messageTimestamp }] }, jid)

// Disappearing Messages
await conn.sendMessage(jid, { disappearingMessagesInChat: 86400 }) // 86400, 604800, 7776000, 0
await conn.clearMessage(jid, key, timestamps)
```

---

## ✏️ User Queries & Profile

```ts
// Queries
const [result] = await conn.onWhatsApp(jid)
await conn.fetchMessageHistory(50, msg.key, msg.messageTimestamp)
const status = await conn.fetchStatus(jid)
const ppUrl = await conn.profilePictureUrl(jid)
const profile = await conn.getBusinessProfile(jid)
await conn.presenceSubscribe(jid)

// Profile Updates
await conn.updateProfileStatus('Hello World!')
await conn.updateProfileName('My name')
await conn.updateProfilePicture(jid, { url: './new-pic.jpeg' })
await conn.removeProfilePicture(jid)
```

---

## 👥 Groups

```ts
const group = await conn.groupCreate('My Group', ['123@s.whatsapp.net'])
await conn.groupParticipantsUpdate(jid, ['123@s.whatsapp.net'], 'add') // add, remove, demote, promote
await conn.groupUpdateSubject(jid, 'New Subject!')
await conn.groupUpdateDescription(jid, 'New Description!')
await conn.groupSettingUpdate(jid, 'announcement') // announcement, not_announcement, locked, unlocked
await conn.groupLeave(jid)

// Invites & Meta
const code = await conn.groupInviteCode(jid)
await conn.groupRevokeInvite(jid)
await conn.groupAcceptInvite(code)
const inviteInfo = await conn.groupGetInviteInfo(code)
const metadata = await conn.groupMetadata(jid)
await conn.groupAcceptInviteV4(jid, groupInviteMessage)

// Requests & Settings
const reqList = await conn.groupRequestParticipantsList(jid)
await conn.groupRequestParticipantsUpdate(jid, ['123@s.whatsapp.net'], 'approve') // approve, reject
const allMeta = await conn.groupFetchAllParticipating()
await conn.groupToggleEphemeral(jid, 86400)
await conn.groupMemberAddMode(jid, 'admin_add') // all_member_add
```

---

## 🔐 Privacy & Broadcasts

```ts
// Privacy
await conn.updateBlockStatus(jid, 'block') // block, unblock
const privacySettings = await conn.fetchPrivacySettings(true)
const blocklist = await conn.fetchBlocklist()

await conn.updateLastSeenPrivacy('all') // contacts, contact_blacklist, none
await conn.updateOnlinePrivacy('all') // match_last_seen
await conn.updateProfilePicturePrivacy('all')
await conn.updateStatusPrivacy('all')
await conn.updateReadReceiptsPrivacy('all') // none
await conn.updateGroupsAddPrivacy('all')
await conn.updateDefaultDisappearingMode(86400) // 0, 86400, 604800, 7776000

// Broadcasts
await conn.sendMessage(jid, { text: 'Hi' }, { statusJidList: ['123@s.whatsapp.net'], broadcast: true })
const bList = await conn.getBroadcastListInfo('1234@broadcast')
```

---

## ✍️ Custom Functionality & Websockets

### Debug Logging
```ts
const conn = makeWASocket({ logger: P({ level: 'debug' }) })
```

### Raw Websocket Callbacks
```ts
// Listen to specific WA Binary nodes
conn.ws.on('CB:edge_routing', (node: BinaryNode) => { })
conn.ws.on('CB:edge_routing,id:abcd', (node: BinaryNode) => { })
conn.ws.on('CB:edge_routing,id:abcd,routing_info', (node: BinaryNode) => { })
```