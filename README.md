# <div align='center'>Vialeys - A WebSockets library for interacting with WhatsApp Web</div>

<div align="center">

<img src="https://cdn.jsdelivr.net/gh/ramadanny/cdn@main/niew.jpg" alt="Header Image" width="100%"/>

[![npm version](https://img.shields.io/npm/v/vialeys.svg)](https://www.npmjs.com/package/vialeys)
[![License](https://img.shields.io/badge/license-GPL%203-blue.svg)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/vialeys.svg)](https://www.npmjs.com/package/vialeys)

</div>

#### Liability and License Notice

Baileys and its maintainers cannot be held liable for misuse of this application, as stated in the [MIT license](https://github.com/WhiskeySockets/Baileys/blob/master/LICENSE).  
The maintainers of Baileys do not in any way condone the use of this application in practices that violate the Terms of Service of WhatsApp. Users are personally responsible for using this application fairly and as intended.

## Features

- Direct WebSocket connection – no Selenium or browser needed.
- Supports multi‑device and web versions of WhatsApp.
- Lightweight: saves ~500 MB of RAM.

Thanks to [@pokearaujo](https://github.com/pokearaujo/multidevice), [@Sigalor](https://github.com/sigalor/whatsapp-web-reveng), and [@Rhymen](https://github.com/Rhymen/go-whatsapp/) for their research.

## 📦 Install

```bash
npm i vialeys
# or
yarn add vialeys
# or
pnpm add vialeys
```

```js
import makeWASocket from 'vialeys'
```

# Links

- [Docs](https://guide.whiskeysockets.io/)

## 🔌 Connecting Account

WhatsApp’s multi‑device API allows Baileys to authenticate as a second client by scanning a **QR code** or using a **pairing code**.

### Starting socket with QR‑CODE

```js
import makeWASocket, { Browsers } from 'vialeys'

const conn = makeWASocket({
    browser: Browsers.ubuntu('My App'),
    printQRInTerminal: true,
})
```

### Starting socket with Pairing Code

> Only numbers, include country code, no `+` or `(`.

```js
import makeWASocket from 'vialeys'

const conn = makeWASocket({ printQRInTerminal: false })
if (!conn.authState.creds.registered) {
    const code = await conn.requestPairingCode('12345678901')
    console.log(code)
}
```

### Receive Full History

Set `syncFullHistory: true` and use a desktop browser config (e.g. `Browsers.macOS('Desktop')`).

## 📝 Important Notes About Socket Config

### Caching Group Metadata (Recommended)

```js
import NodeCache from 'node-cache'
const groupCache = new NodeCache({ stdTTL: 300, useClones: false })

const conn = makeWASocket({
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
})
// Update cache on group changes
conn.ev.on('groups.update', async ([event]) => {
    groupCache.set(event.id, await conn.groupMetadata(event.id))
})
conn.ev.on('group-participants.update', async (event) => {
    groupCache.set(event.id, await conn.groupMetadata(event.id))
})
```

### Improve Retry System & Decrypt Poll Votes

Provide `getMessage` to fetch messages by key (e.g., from your store).

```js
const conn = makeWASocket({
    getMessage: async (key) => await getMessageFromStore(key),
})
```

### Receive Notifications in WhatsApp App

```js
const conn = makeWASocket({ markOnlineOnConnect: false })
```

## 💾 Saving & Restoring Sessions

```js
import makeWASocket, { useMultiFileAuthState } from 'vialeys'

const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
const conn = makeWASocket({ auth: state })
conn.ev.on('creds.update', saveCreds)
```

`useMultiFileAuthState` is a helper; for production use a database.

## 🕹️ Handling Events

All events are typed (see [BaileysEventMap](https://baileys.whiskeysockets.io/types/BaileysEventMap.html)).

```js
conn.ev.on('messages.upsert', ({ messages }) => {
    console.log('messages', messages)
})
```

### Example to Start (with auth and reconnect)

```js
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from 'vialeys'
import { Boom } from '@hapi/boom'

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
    const conn = makeWASocket({ auth: state, printQRInTerminal: true })

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) connect()
        } else if (connection === 'open') {
            console.log('Connected')
        }
    })

    conn.ev.on('messages.upsert', async ({ messages }) => {
        for (const m of messages) {
            await conn.sendMessage(m.key.remoteJid!, { text: 'Hello' })
        }
    })

    conn.ev.on('creds.update', saveCreds)
}
connect()
```

### Decrypt Poll Votes

```js
import { getAggregateVotesInPollMessage } from 'vialeys'

conn.ev.on('messages.update', async (chatUpdate) => {
    for (const { key, update } of chatUpdate) {
        if (update.pollUpdates && key.fromMe) {
            const pollCreation = await getMessage(key) // implement getMessage
            if (pollCreation) {
                const pollUpdate = await getAggregateVotesInPollMessage({
                    message: pollCreation,
                    pollUpdates: update.pollUpdates,
                })
                console.log(pollUpdate[0]?.name)
            }
        }
    }
})
```

### Summary of Events on First Connection

1. `connection.update` asks to restart socket.
2. History messages arrive in `messaging.history-set`.

## 📊 Implementing a Data Store

An in‑memory store is provided; build your own for production.

```js
import { makeInMemoryStore } from 'vialeys'

const store = makeInMemoryStore({})
store.readFromFile('./baileys_store.json')
setInterval(() => store.writeToFile('./baileys_store.json'), 10_000)

const conn = makeWASocket({})
store.bind(conn.ev)

conn.ev.on('chats.upsert', () => {
    console.log('chats', store.chats.all())
})
```

## 🆔 WhatsApp IDs (JID) Format

- **Lid**: `[id]@lid`
- **User**: `[country_code][phone]@s.whatsapp.net`
- **Group**: `[id]@g.us`
- **Broadcast**: `[timestamp]@broadcast`
- **Status**: `status@broadcast`

## ⚙️ Utility Functions

- `getContentType(message)`
- `getDevice(message)`
- `makeCacheableSignalKeyStore`
- `downloadContentFromMessage`

## 📤 Sending Messages

Generic syntax:

```js
conn.sendMessage(jid, content, options)
```

All available content types are listed below.

### Non‑Media Messages

#### Text Message

```js
await conn.sendMessage(jid, { text: 'hello world' })
```

#### Quote Message

```js
await conn.sendMessage(jid, { text: 'reply' }, { quoted: message })
```

#### Mention User

```js
await conn.sendMessage(jid, {
    text: '@12345678901',
    mentions: ['12345678901@s.whatsapp.net'],
})
```

#### Forward Messages

```js
const msg = getMessageFromStore() // retrieve WAMessage
await conn.sendMessage(jid, { forward: msg, force: true })
```

#### Location Message

```js
await conn.sendMessage(jid, {
    location: { degreesLatitude: 24.121231, degreesLongitude: 55.1121221 },
})
```

#### Live Location

```js
await conn.sendMessage(jid, {
    location: {
        degreesLatitude: 24.121231,
        degreesLongitude: 55.1121221,
        live: true,
    },
})
```

#### Contact Message

```js
const vcard =
    'BEGIN:VCARD\nVERSION:3.0\nFN:Jeff Singh\nORG:Ashoka Uni\nTEL;type=CELL;type=VOICE;waid=911234567890:+91 12345 67890\nEND:VCARD'
await conn.sendMessage(jid, {
    contacts: { displayName: 'vialeys', contacts: [{ vcard }] },
})
```

#### Reaction Message

```js
await conn.sendMessage(jid, {
    react: { text: '💖', key: message.key },
})
```

#### Pin Message

- `time`: 86400 (24h), 604800 (7d), 2592000 (30d)

```js
await conn.sendMessage(jid, {
    pin: { type: 1, time: 86400, key: Key }, // type 2 to remove
})
```

#### Keep Message

```js
await conn.sendMessage(jid, {
    keep: { key: Key, type: 1 }, // type 2 to remove
})
```

#### Poll Message

```js
await conn.sendMessage(jid, {
    poll: {
        name: 'My Poll',
        values: ['Option 1', 'Option 2'],
        selectableCount: 1,
    },
})
```

#### Poll Result Message

```js
await conn.sendMessage(jid, {
    pollResult: {
        name: 'Hi',
        values: [
            ['Option 1', 1000],
            ['Option 2', 2000],
        ],
    },
})
```

#### Call Message

```js
await conn.sendMessage(jid, {
    call: { name: 'vialeys', type: 1 }, // 2 for video
})
```

#### Event Message

```js
await conn.sendMessage(jid, {
    event: {
        isCanceled: false,
        name: 'holiday together!',
        description: 'who wants to come along?',
        location: {
            degreesLatitude: 24.121231,
            degreesLongitude: 55.1121221,
            name: 'name',
        },
        call: 'audio', // or 'video'
        startTime: Date.now(),
        endTime: Date.now() + 3600000,
        extraGuestsAllowed: true,
    },
})
```

#### Order Message

```js
await conn.sendMessage(jid, {
    order: {
        orderId: '574xxx',
        thumbnail: '...',
        itemCount: '2',
        status: 'INQUIRY',
        surface: 'CATALOG',
        message: 'your_caption',
        orderTitle: 'your_title',
        sellerJid: '...',
        token: '...',
        totalAmount1000: '10000',
        totalCurrencyCode: 'IDR',
    },
})
```

#### Product Message

```js
await conn.sendMessage(jid, {
    product: {
        productImage: { url: 'https://example.com/img.jpg' },
        productId: '123',
        title: 'Product',
        description: 'Desc',
        currencyCode: 'IDR',
        priceAmount1000: '10000',
        retailerId: 'vialeys',
        url: 'https://example.com',
        productImageCount: 1,
    },
    businessOwnerJid: '...',
})
```

#### Payment Message

```js
await conn.sendMessage(jid, {
    payment: {
        note: 'Hi!',
        currency: 'IDR',
        amount: '10000',
        from: '628xxxx@s.whatsapp.net',
        // image: { ... }
    },
})
```

#### Payment Invite Message

```js
await conn.sendMessage(jid, { paymentInvite: { type: 1, expiry: 0 } })
```

#### Admin Invite Message

```js
await conn.sendMessage(jid, {
    adminInvite: {
        jid: '123@newsletter',
        name: 'newsletter',
        caption: 'Join as admin',
        expiration: 86400,
    },
})
```

#### Group Invite Message

```js
await conn.sendMessage(jid, {
    groupInvite: {
        jid: '123@g.us',
        name: 'group',
        caption: 'Join',
        code: 'abc',
        expiration: 86400,
    },
})
```

#### Sticker Pack Message

```js
await conn.sendMessage(jid, {
    stickerPack: {
        name: 'Hiii',
        publisher: 'By vialeys',
        cover: Buffer, // image
        stickers: [{ sticker: { url: 'https://...' }, emojis: ['❤'] }],
    },
})
```

#### Share Phone Number Message

```js
await conn.sendMessage(jid, { sharePhoneNumber: {} })
```

#### Request Phone Number Message

```js
await conn.sendMessage(jid, { requestPhoneNumber: {} })
```

#### Buttons Reply Message

- `type`: `'list'`, `'plain'`, `'template'`, `'interactive'`

```js
await conn.sendMessage(jid, {
    buttonReply: { displayText: 'Click', id: 'ID' },
    type: 'plain',
})
```

#### Buttons Message

```js
await conn.sendMessage(jid, {
    text: 'Buttons!',
    footer: 'Footer',
    buttons: [{ buttonId: 'id1', buttonText: { displayText: 'Button 1' } }],
})
```

#### Buttons List Message

(Private chat only)

```js
await conn.sendMessage(jid, {
    text: 'List',
    footer: 'Footer',
    title: 'Title',
    buttonText: 'View',
    sections: [{ title: 'Section', rows: [{ title: 'Option 1', rowId: 'opt1' }] }],
})
```

#### Buttons Product List Message

(Private chat only)

```js
await conn.sendMessage(jid, {
    text: 'Products',
    productList: [{ title: 'Title', products: [{ productId: '123' }] }],
    businessOwnerJid: '...',
})
```

#### Buttons Cards Message

```js
await conn.sendMessage(jid, {
    text: 'Body',
    title: 'Title',
    cards: [
        {
            image: { url: 'https://...' },
            title: 'Card',
            body: 'Body',
            buttons: [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: 'Click', id: 'id' }),
                },
            ],
        },
    ],
})
```

#### Buttons Template Message

(No longer works)

```js
// Deprecated
```

#### Buttons Interactive Message

```js
await conn.sendMessage(jid, {
    text: 'Interactive',
    interactiveButtons: [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: 'Click', id: 'id' }),
        },
        {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: 'Follow',
                url: 'https://...',
            }),
        },
    ],
})
// Can also include image/video/document/location/product
```

#### Buttons Interactive Message PIX

```js
await conn.sendMessage(jid, {
    text: '',
    interactiveButtons: [
        {
            name: 'payment_info',
            buttonParamsJson: JSON.stringify({
                payment_settings: [
                    {
                        type: 'pix_static_code',
                        pix_static_code: {
                            merchant_name: 'vialeys',
                            key: 'example@vialeys.com',
                            key_type: 'EMAIL',
                        },
                    },
                ],
            }),
        },
    ],
})
```

#### Buttons Interactive Message PAY

```js
await conn.sendMessage(jid, {
    text: '',
    interactiveButtons: [
        {
            name: 'review_and_pay',
            buttonParamsJson: JSON.stringify({
                currency: 'IDR',
                total_amount: { value: '999999999', offset: '100' },
                order: {
                    items: [{ name: 'vialeys', amount: { value: '999999999' }, quantity: '1' }],
                },
            }),
        },
    ],
})
```

#### Status Mentions Message

(Max 5 mentions per status)

```js
const jids = ['123@g.us', '456@s.whatsapp.net']
await conn.sendStatusMentions({ text: 'Hello' }, jids)
// or with image/video/audio
```

#### Shop Message

```js
await conn.sendMessage(jid, {
    text: 'Shop',
    title: 'Title',
    shop: { surface: 1, id: 'https://example.com' },
})
// Can also include image/video/document/location/product
```

#### Collection Message

```js
await conn.sendMessage(jid, {
    text: 'Collection',
    collection: { bizJid: 'jid', id: 'https://example.com', version: 1 },
})
// Can also include image/video/document/location/product
```

### AI Icon Feature

```js
await conn.sendMessage(jid, { text: 'Hi' }, { ai: true })
// In relayMessage: { AI: true }
```

### Sending Messages with Link Previews

Requires `link-preview-js`:

```bash
yarn add link-preview-js
```

```js
await conn.sendMessage(jid, { text: 'Check https://github.com' })
```

### Media Messages

Pass `stream`, `url`, or `Buffer`. Prefer stream/url to save memory.

#### Gif Message (as video with gifPlayback)

```js
await conn.sendMessage(jid, {
    video: fs.readFileSync('file.mp4'),
    gifPlayback: true,
})
```

#### Video Message

```js
await conn.sendMessage(jid, {
    video: { url: './video.mp4' },
    caption: 'video',
})
```

#### Video Ptv Message

```js
await conn.sendMessage(jid, { video: { url: './video.mp4' }, ptv: true })
```

#### Audio Message

(convert with ffmpeg: `ffmpeg -i input.mp4 -avoid_negative_ts make_zero -ac 1 output.ogg`)

```js
await conn.sendMessage(jid, {
    audio: { url: './audio.ogg' },
    mimetype: 'audio/mp4',
})
```

#### Image Message

```js
await conn.sendMessage(jid, {
    image: { url: './image.png' },
    caption: 'image',
})
```

#### Album Message

```js
await conn.sendMessage(jid, {
    album: [
        { image: { url: '...' }, caption: '1' },
        { video: Buffer, caption: '2' },
    ],
})
```

#### View Once Message

Add `viewOnce: true` to any media message.

## 🔄 Modify Messages

### Delete for Everyone

```js
const msg = await conn.sendMessage(jid, { text: 'hello' })
await conn.sendMessage(jid, { delete: msg.key })
```

### Edit Message

```js
await conn.sendMessage(jid, {
    text: 'updated text',
    edit: existingMessageKey,
})
```

## 🎭 Manipulating Media Messages

### Thumbnail Generation

Automatically generated if `jimp` or `sharp` is installed. Video thumbnails require `ffmpeg`.

### Downloading Media

```js
import { downloadMediaMessage, getContentType } from 'vialeys'

const stream = await downloadMediaMessage(
    message,
    'stream',
    {},
    {
        logger,
        reuploadRequest: conn.updateMediaMessage,
    }
)
stream.pipe(createWriteStream('./file'))
```

### Re‑upload Expired Media

```js
await conn.updateMediaMessage(msg)
```

## ❌ Reject Call

```js
await conn.rejectCall(callId, callFrom)
```

## 📋 Send States in Chat

### Reading Messages

```js
await conn.readMessages([messageKey])
```

### Update Presence

(`'available'`, `'unavailable'`, `'composing'`, `'recording'`, `'paused'`)

```js
await conn.sendPresenceUpdate('available', jid)
```

## 💬 Modifying Chats

### Archive a Chat

```js
const lastMsg = await getLastMessage(jid) // implement
await conn.chatModify({ archive: true, lastMessages: [lastMsg] }, jid)
```

### Mute/Unmute Chat

```js
await conn.chatModify({ mute: 8 * 60 * 60 * 1000 }, jid) // 8h
await conn.chatModify({ mute: null }, jid) // unmute
```

### Mark Chat Read/Unread

```js
await conn.chatModify({ markRead: false, lastMessages: [lastMsg] }, jid)
```

### Delete Message for Me

```js
await conn.chatModify(
    {
        clear: { messages: [{ id: 'msgID', fromMe: true, timestamp: '...' }] },
    },
    jid
)
```

### Delete Chat

```js
await conn.chatModify(
    {
        delete: true,
        lastMessages: [{ key: lastMsg.key, messageTimestamp: lastMsg.messageTimestamp }],
    },
    jid
)
```

### Pin/Unpin Chat

```js
await conn.chatModify({ pin: true }, jid)
```

### Star/Unstar Message

```js
await conn.chatModify(
    {
        star: { messages: [{ id: 'msgID', fromMe: true }], star: true },
    },
    jid
)
```

### Disappearing Messages

Ephemeral values: `0` (off), `86400` (24h), `604800` (7d), `7776000` (90d)

```js
await conn.sendMessage(jid, { disappearingMessagesInChat: 86400 })
// or per message:
await conn.sendMessage(jid, { text: 'hi' }, { ephemeralExpiration: 86400 })
```

### Clear Messages

```js
await conn.clearMessage(jid, key, timestamps)
```

## ✏️ User Queries

### Check If ID Exists

```js
const [result] = await conn.onWhatsApp(jid)
if (result.exists) console.log(result.jid)
```

### Query Chat History (max 50 messages)

```js
const oldest = await getOldestMessage(jid)
await conn.fetchMessageHistory(50, oldest.key, oldest.messageTimestamp)
// history arrives in 'messaging.history-set' event
```

### Fetch Status

```js
const status = await conn.fetchStatus(jid)
```

### Fetch Profile Picture

```js
const url = await conn.profilePictureUrl(jid)
```

### Fetch Business Profile

```js
const profile = await conn.getBusinessProfile(jid)
```

### Fetch Someone's Presence

```js
conn.ev.on('presence.update', console.log)
await conn.presenceSubscribe(jid)
```

## 👤 Change Profile

### Change Profile Status

```js
await conn.updateProfileStatus('Hello World!')
```

### Change Profile Name

```js
await conn.updateProfileName('My name')
```

### Change Display Picture (groups too)

```js
await conn.updateProfilePicture(jid, { url: './new.jpg' })
```

### Remove Display Picture

```js
await conn.removeProfilePicture(jid)
```

## 👥 Groups

(Admin rights required for most actions)

### Create Group

```js
const group = await conn.groupCreate('My Group', ['1234@s.whatsapp.net'])
```

### Add/Remove/Demote/Promote

```js
await conn.groupParticipantsUpdate(jid, ['user@s.whatsapp.net'], 'add') // 'remove', 'demote', 'promote'
```

### Change Subject

```js
await conn.groupUpdateSubject(jid, 'New Subject')
```

### Change Description

```js
await conn.groupUpdateDescription(jid, 'New Description')
```

### Change Settings

```js
await conn.groupSettingUpdate(jid, 'announcement') // or 'not_announcement', 'locked', 'unlocked'
```

### Leave Group

```js
await conn.groupLeave(jid)
```

### Get Invite Code

```js
const code = await conn.groupInviteCode(jid)
```

### Revoke Invite Code

```js
const newCode = await conn.groupRevokeInvite(jid)
```

### Join Using Invite Code

```js
await conn.groupAcceptInvite(code) // code only, not full URL
```

### Get Group Info by Invite Code

```js
const info = await conn.groupGetInviteInfo(code)
```

### Query Metadata

```js
const metadata = await conn.groupMetadata(jid)
```

### Join via groupInviteMessage

```js
await conn.groupAcceptInviteV4(jid, groupInviteMessage)
```

### Get Request Join List

```js
const requests = await conn.groupRequestParticipantsList(jid)
```

### Approve/Reject Request Join

```js
await conn.groupRequestParticipantsUpdate(jid, ['user@s.whatsapp.net'], 'approve') // or 'reject'
```

### Get All Participating Groups Metadata

```js
const groups = await conn.groupFetchAllParticipating()
```

### Toggle Ephemeral

```js
await conn.groupToggleEphemeral(jid, 86400)
```

### Change Add Mode

```js
await conn.groupMemberAddMode(jid, 'all_member_add') // or 'admin_add'
```

## 🔐 Privacy

### Block/Unblock User

```js
await conn.updateBlockStatus(jid, 'block') // 'unblock'
```

### Get Privacy Settings

```js
const settings = await conn.fetchPrivacySettings(true)
```

### Get BlockList

```js
const blocked = await conn.fetchBlocklist()
```

### Update LastSeen Privacy

```js
await conn.updateLastSeenPrivacy('all') // 'contacts', 'contact_blacklist', 'none'
```

### Update Online Privacy

```js
await conn.updateOnlinePrivacy('all') // 'match_last_seen'
```

### Update Profile Picture Privacy

```js
await conn.updateProfilePicturePrivacy('all') // 'contacts', 'contact_blacklist', 'none'
```

### Update Status Privacy

```js
await conn.updateStatusPrivacy('all')
```

### Update Read Receipts Privacy

```js
await conn.updateReadReceiptsPrivacy('all') // 'none'
```

### Update Groups Add Privacy

```js
await conn.updateGroupsAddPrivacy('all') // 'contacts', 'contact_blacklist'
```

### Update Default Disappearing Mode

```js
await conn.updateDefaultDisappearingMode(86400)
```

## 📢 Broadcast Lists & Stories

### Send Broadcast & Stories

Add `broadcast: true` and `statusJidList` in options.

```js
await conn.sendMessage(
    jid,
    { image: { url: '...' }, caption: '...' },
    { broadcast: true, statusJidList: ['user@s.whatsapp.net'] }
)
```

### Query Broadcast List Info

```js
const info = await conn.getBroadcastListInfo('1234@broadcast')
```

## ✍️ Writing Custom Functionality

### Enable Debug Logs

```js
const conn = makeWASocket({ logger: P({ level: 'debug' }) })
```

### How WhatsApp Communicates

Messages are `BinaryNode` objects with `tag`, `attrs`, and `content`. Study [Libsignal Protocol](https://signal.org/docs/) and [Noise Protocol](https://noiseprotocol.org/).

### Register Callbacks for WebSocket Events

```js
conn.ws.on('CB:edge_routing', (node) => {})
conn.ws.on('CB:edge_routing,id:abcd', (node) => {})
conn.ws.on('CB:edge_routing,id:abcd,routing_info', (node) => {})
```
