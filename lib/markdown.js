/**
 * @file lib/markdown.js
 * @description Font style library for CLI
 */
const markdown = {
    bold: (text) => `\x1b[1m${text}\x1b[0m`,
    italic: (text) => `\x1b[3m${text}\x1b[0m`,
    underline: (text) => `\x1b[4m${text}\x1b[0m`,
    strike: (text) => `\x1b[9m${text}\x1b[0m`,
    inverse: (text) => `\x1b[7m${text}\x1b[0m`,
    
    // Combined Styles
    boldItalic: (text) => `\x1b[1m\x1b[3m${text}\x1b[0m`,
    header: (text) => `\x1b[1m\x1b[4m\x1b[36m${text.toUpperCase()}\x1b[0m`,
};

global.markdown = markdown;
export default markdown;