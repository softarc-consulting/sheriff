import {
  EnvironmentProviders,
  ENVIRONMENT_INITIALIZER,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  Type,
} from '@angular/core';
import { LoggerFeature, LoggerFeatureKind } from './features';
import { LogAppender, LOG_APPENDERS } from './log-appender';
import { LOG_FORMATTER } from './log-formatter';
import { LoggerService } from './logger';
import { defaultConfig, LoggerConfig } from './logger-config';

export function provideLogger(
  config: Partial<LoggerConfig>,
  ...features: LoggerFeature[]
): EnvironmentProviders {
  const merged = { ...defaultConfig, ...config };

  const colorFeatures =
    features?.filter((f) => f.kind === LoggerFeatureKind.COLOR)?.length ?? 0;

  if (colorFeatures > 1) {
    throw new Error('Only one color feature allowed for logger!');
  }

  return makeEnvironmentProviders([
    LoggerService,
    {
      provide: LoggerConfig,
      useValue: merged,
    },
    {
      provide: LOG_FORMATTER,
      useValue: merged.formatter,
    },
    merged.appenders.map((a) => ({
      provide: LOG_APPENDERS,
      useClass: a,
      multi: true,
    })),
    features?.map((f) => f.providers),
  ]);
}

export function provideCategory(
  category: string,
  appender: Type<LogAppender>
): EnvironmentProviders {
  const appenderToken = new InjectionToken<LogAppender>('APPENDER_' + category);
  return makeEnvironmentProviders([
    {
      provide: appenderToken,
      useClass: appender,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const appender = inject(appenderToken);
        const logger = inject(LoggerService);

        logger.categories[category] = appender;
      },
    },
  ]);
}
