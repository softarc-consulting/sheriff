import {InjectionToken} from "@angular/core";
import {LogLevel} from "./log-level";

export const LOG_FORMATTER = new InjectionToken<LogFormatFn>('LOG_FORMATTER');

export type LogFormatFn = (level: LogLevel, category: string, msg: string) => string;

export const defaultLogFormatFn: LogFormatFn = (level, category, msg) => {
    const levelString = LogLevel[level].padEnd(5);
    return `[${levelString}] ${category.toUpperCase()} ${msg}`;
}
