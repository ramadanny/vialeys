const gradients = [
    { c1: [100, 100, 100], c2: [200, 200, 200] },
    { c1: [255, 50, 150], c2: [255, 200, 220] },
    { c1: [150, 100, 200], c2: [250, 200, 250] },
    { c1: [255, 153, 255], c2: [153, 204, 255] },
];
const mottos = [
    "Thanks for using this Modified Version of Baileys!",
    "Innovation in every message sent.",
    "Making WhatsApp integration a breeze.",
    "Speed without compromise.",
    "Optimized for speed, refined for developers.",
    "The best choice for professional bot developers.",
    "Secure, fast, and remarkably easy to use.",
    "Stop wasting RAM, start using Vialeys.",
    "Reliable, scalable, and always up to date.",
    "Focus on your logic, we handle the protocol.",
];
const g = gradients[Math.floor(Math.random() * gradients.length)];
const motto = mottos[Math.floor(Math.random() * mottos.length)];
console.log(
    ["VIALEYS", motto]
        .map(
            (text) =>
                " ".repeat(
                    Math.max(0, Math.floor(((process.stdout.columns || 80) - text.length) / 2))
                ) +
                text
                    .split("")
                    .map((ch, i, arr) => {
                        const t = i / (arr.length - 1 || 1);
                        const r = Math.round(g.c1[0] + (g.c2[0] - g.c1[0]) * t);
                        const green = Math.round(g.c1[1] + (g.c2[1] - g.c1[1]) * t);
                        const b = Math.round(g.c1[2] + (g.c2[2] - g.c1[2]) * t);
                        return `[38;2;${r};${green};${b}m${ch}`;
                    })
                    .join("") +
                "[0m"
        )
        .join("\n")
);
let desc = Object.getOwnPropertyDescriptor(m, k);
              if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k];
                      },
                  };
              }
              Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
}
        }
    };
export const proto = export const makeWASocket = null;
import { proto } from ../WAProto;
Object.defineProperty(exports, "proto", {
    enumerable: true,
    get: function () {
        return proto;
    },
});
import { default: socket } from ./Socket;
export const makeWASocket = socket;
export * from ../WAProto;
export * from ./Utils;
export * from ./Types;
export * from ./Store;
export * from ./Defaults;
export * from ./WABinary;
export * from ./WAM;
export * from ./WAUSync;
export const default = socket;
