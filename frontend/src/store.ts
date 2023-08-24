import { PayloadAction, configureStore, createSlice } from "@reduxjs/toolkit";
import { api } from "./api"

export interface State { 
    app: {
        value: {
            isLoggedIn: boolean
        }
    }
}

interface StateValue { 
    isLoggedIn: boolean
}

interface InitialState { 
    value: StateValue
}

const initialState = { value: {isLoggedIn: false }} as InitialState;

const slice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setIsLoggedIn: (state: InitialState, action: PayloadAction<StateValue>) => {
            console.log("logged in ", action.payload.isLoggedIn);
            state.value.isLoggedIn = action.payload.isLoggedIn;
        }
    }
});

export const { setIsLoggedIn } = slice.actions;

export const store = configureStore({
    //reducer takes previous state + and action and creates a new state
    reducer: {
        app: slice.reducer,
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})