import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { LogAppender } from './log-appender';
import { defaultConfig } from './logger-config';
import { provideCategory, provideLogger } from './providers';

// NgModule for legacy code
@NgModule({
    imports: [],
    exports: [],
    declarations: [],
    providers: [],
})
export class LoggerModule { 

    static forRoot(config = defaultConfig): ModuleWithProviders<LoggerModule> {
        return {
            ngModule: LoggerModule,
            providers: [
                provideLogger(config)
            ]
        };
    }

    static forCategory(category: string, appender: Type<LogAppender>): ModuleWithProviders<LoggerModule> {
        return {
            ngModule: LoggerModule,
            providers: [
                provideCategory(category, appender)
            ]
        };
    }

}
