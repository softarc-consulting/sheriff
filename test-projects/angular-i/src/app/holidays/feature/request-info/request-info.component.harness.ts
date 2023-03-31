import { ComponentHarness } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatInputHarness } from '@angular/material/input/testing';

export class RequestInfoComponentHarness extends ComponentHarness {
  static hostSelector = 'app-request-info';

  protected getTitle = this.locatorFor('h2');
  protected getInput = this.locatorFor(MatInputHarness);
  protected getButton = this.locatorFor(
    MatButtonHarness.with({ selector: '[data-testid=btn-search]' })
  );
  protected getLookupResult = this.locatorFor('[data-testid=lookup-result]');

  async search(): Promise<void> {
    const button = await this.getButton();
    return button.click();
  }

  async writeAddress(address: string): Promise<void> {
    const input = await this.getInput();
    return input.setValue(address);
  }

  async getResult(): Promise<string> {
    const p = await this.getLookupResult();
    return p.text();
  }
}
