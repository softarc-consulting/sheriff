import { Type } from "@angular/core";
import { DefaultLogAppender, LogAppender } from "./log-appender";
import { defaultLogFormatFn, LogFormatFn } from "./log-formatter";
import { LogLevel } from "./log-level";

export abstract class LoggerConfig {
    abstract level: LogLevel;
    abstract chaining: boolean;
    abstract formatter: LogFormatFn;
    abstract appenders: Type<LogAppender>[];
}

export const defaultConfig: LoggerConfig = {
    level: LogLevel.DEBUG,
    chaining: false,
    formatter: defaultLogFormatFn,
    appenders: [DefaultLogAppender]
}
