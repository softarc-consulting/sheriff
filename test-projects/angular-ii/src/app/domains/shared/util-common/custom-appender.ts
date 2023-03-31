import { Injectable } from "@angular/core";
import { LogAppender } from "../util-logger";
import { LogLevel } from "../util-logger";

@Injectable()
export class CustomAppender implements LogAppender {
    logs: string[] = [];

    append(level: LogLevel, category: string, msg: string): void {
        this.logs.push(msg);
    }
}
