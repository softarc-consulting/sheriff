import { createFeature, createReducer, createSelector } from '@ngrx/store';

export const countries = [
  ['AT', 'Austria'],
  ['CA', 'Canada'],
  ['CH', 'Switzerland'],
  ['CN', 'China'],
  ['CZ', 'Czechia'],
  ['DE', 'Germany'],
  ['DK', 'Denmark'],
  ['ES', 'Spain'],
  ['FR', 'France'],
  ['HU', 'Hungary'],
  ['IN', 'India'],
  ['IT', 'Italy'],
  ['NL', 'Netherlands'],
  ['NO', 'Norway'],
  ['RU', 'Russia'],
  ['SE', 'Sweden'],
  ['UK', 'United Kingdom'],
  ['US', 'USA'],
].map(([code, name]) => ({ code, name }));

export interface Country {
  code: string;
  name: string;
}

interface MasterState {
  countries: Country[];
}

const initialState: MasterState = {
  countries,
};

export const masterFeature = createFeature({
  name: 'master',
  reducer: createReducer<MasterState>(initialState),
});

export const selectCountries = createSelector(
  masterFeature.selectCountries,
  (countries) =>
    countries.map(({ code, name }) => ({ value: code, label: name }))
);
