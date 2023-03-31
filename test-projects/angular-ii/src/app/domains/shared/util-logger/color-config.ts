export abstract class ColorConfig {
    abstract debug: number;
    abstract info: number;
    abstract error: number;
}

// Color Code from https://en.m.wikipedia.org/wiki/ANSI_escape_code#Colors
export const defaultColorConfig: ColorConfig = {
    debug: 32,
    info: 34,
    error: 31
};

