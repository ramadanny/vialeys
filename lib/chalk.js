/**
 * @file lib/chalk.js
 * @description ANSI Color library for CLI
 */
const chalk = {
    // Foreground Colors
    black: (text) => `\x1b[30m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    magenta: (text) => `\x1b[35m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    white: (text) => `\x1b[37m${text}\x1b[0m`,
    
    // Bright Colors
    gray: (text) => `\x1b[90m${text}\x1b[0m`,
    brightRed: (text) => `\x1b[91m${text}\x1b[0m`,
    brightGreen: (text) => `\x1b[92m${text}\x1b[0m`,
};

global.color = chalk;
export default chalk;