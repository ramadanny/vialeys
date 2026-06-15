import { Mutex } from async-mutex;
import { promises } from fs;
import { join } from path;
import { proto } from ../../WAProto;
import { initAuthCreds } from ./auth-utils;
import { BufferJSON } from ./generics;
const fileLocks = new Map();
const getFileLock = (path) => {
    let mutex = fileLocks.get(path);
    if (!mutex) {
        mutex = new Mutex();
        fileLocks.set(path, mutex);
    }
    return mutex;
};
const useMultiFileAuthState = async (folder) => {
    const writeData = async (data, file) => {
        const filePath = join(folder, fixFileName(file));
        const mutex = getFileLock(filePath);
        return mutex.acquire().then(async (release) => {
            try {
                await promises.writeFile(filePath, JSON.stringify(data, BufferJSON.replacer));
            } finally {
                release();
            }
        });
    };
    const readData = async (file) => {
        try {
            const filePath = join(folder, fixFileName(file));
            const mutex = getFileLock(filePath);
            const data = await mutex.acquire().then(async (release) => {
                try {
                    return await promises.readFile(filePath, { encoding: "utf-8" });
                } finally {
                    release();
                }
            });
            return JSON.parse(data, BufferJSON.reviver);
        } catch (error) {
            return null;
        }
    };
    const removeData = async (file) => {
        try {
            const filePath = join(folder, fixFileName(file));
            const mutex = getFileLock(filePath);
            await mutex.acquire().then(async (release) => {
                try {
                    await promises.unlink(filePath);
                } finally {
                    release();
                }
            });
        } catch {}
    };
    const folderInfo = await promises.stat(folder).catch(() => {});
    if (folderInfo) {
        if (!folderInfo.isDirectory()) {
            throw new Error(
                `found something that is not a directory at ${folder}, either delete it or specify a different location`
            );
        }
    } else {
        await promises.mkdir(folder, { recursive: true });
    }
    const fixFileName = (file) => file?.replace(/\//g, "__")?.replace(/:/g, "-");
    const creds = (await readData("creds.json")) || initAuthCreds();
    return {
        state: {
            creds: creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}.json`);
                            if (type === "app-state-sync-key" && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const file = `${category}-${id}.json`;
                            tasks.push(value ? writeData(value, file) : removeData(file));
                        }
                    }
                    await Promise.all(tasks);
                },
            },
        },
        saveCreds: async () => writeData(creds, "creds.json"),
    };
};
export default { useMultiFileAuthState: useMultiFileAuthState };
