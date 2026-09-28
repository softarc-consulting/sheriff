import * as angularCore from '@angular/core';
import { ProviderToken } from '@angular/core';

export class MockInject {
  mocks = new Map<ProviderToken<unknown>, unknown>();
  spy: jest.SpyInstance;
  constructor() {
    this.spy = jest.spyOn(angularCore, 'inject');
    this.spy.mockImplementation((token: ProviderToken<unknown>) => {
      if (this.mocks.has(token)) {
        return this.mocks.get(token);
      } else {
        throw new Error('injector was called with unknown token: ' + token);
      }
    });
  }

  with(token: ProviderToken<unknown>, mock: unknown) {
    this.mocks.set(token, mock);
    return this;
  }

  restore(): void {
    this.spy.mockRestore();
  }

  getRestoreFn() {
    return () => this.restore();
  }
}

export class SafeMockInject extends MockInject {
  override with<T>(token: ProviderToken<T>, mock: T) {
    super.with(token, mock);
    return this;
  }
}

export const mockInject = {
  with: (token: ProviderToken<unknown>, mock: unknown) => {
    const instance = new MockInject();
    return instance.with(token, mock);
  },
};

export const safeMockInject = {
  with: (token: ProviderToken<unknown>, mock: unknown) => {
    const instance = new SafeMockInject();
    return instance.with(token, mock);
  },
};

export type RestoreFunction = () => void;
