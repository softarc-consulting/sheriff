import { createReducer } from "@ngrx/store"

export interface AppState {
    userName: string;
}

export const initState: AppState = {
    userName: 'Jane Doe'
}

export const reducer = createReducer(
    initState
);