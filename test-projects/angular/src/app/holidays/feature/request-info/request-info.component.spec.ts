import { fakeAsync, TestBed } from '@angular/core/testing';
import { RequestInfoComponent } from './request-info.component';
import { render, screen } from '@testing-library/angular';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import userEvent from '@testing-library/user-event';

const ui = {
  address: () => screen.getByTestId('address'),
  search: () => screen.getByTestId('btn-search'),
  message: () => screen.getByTestId('lookup-result'),
};

const mockLookup = (query: string, response: unknown[]) => {
  const controller = TestBed.inject(HttpTestingController);
  controller
    .expectOne((req) => {
      return !!req.url.match(/nominatim/) && req.params.get('q') === query;
    })
    .flush(response);
};

describe('Request Info Component', () => {
  const setup = async (address: string = '') =>
    render(RequestInfoComponent, {
      imports: [HttpClientTestingModule],
      componentProperties: { address },
    });

  it('should instantiate', fakeAsync(async () => {
    await setup();
    await screen.findByText('Request More Information');
  }));

  it('should search multiple times', async () => {
    await setup();

    await userEvent.type(ui.address(), 'Domgasse 15');
    await userEvent.click(ui.search());
    mockLookup('Domgasse 15', []);
    await screen.findByText('Address not found');

    await userEvent.clear(ui.address());
    await userEvent.type(ui.address(), 'Domgasse 15');
    await userEvent.click(ui.search());
    mockLookup('Domgasse 15', [true]);
    await screen.findByText('Brochure sent');
  });

  it('should set the address field if given by parent', async () => {
    await setup('Domgasse 5');
    await screen.findByDisplayValue('Domgasse 5');
  });
});
