import { EnvironmentProviders, makeEnvironmentProviders, Provider } from "@angular/core";

export function combineEnvironmentProviders(envProviders: EnvironmentProviders[]): EnvironmentProviders {
    const providers = envProviders as unknown as Provider[][];
    return makeEnvironmentProviders(providers.flat());
}
