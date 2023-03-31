import { provideState } from '@ngrx/store';
import { masterFeature } from './+state/master.reducer';

export const sharedMasterDataProvider = provideState(masterFeature);
