import { PayloadAction, configureStore, createSlice } from "@reduxjs/toolkit";
import { api } from "./api"

interface StateValue { 
    isLoggedIn: boolean
}

interface State { 
    value: StateValue
}

const initialState = { value: {isLoggedIn: false }} as State;

const slice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setIsLoggedIn: (state: State, action: PayloadAction<StateValue>) => {
            state.value.isLoggedIn = action.payload.isLoggedIn;
        }
    }
});

export const store = configureStore({
    //reducer takes previous state + and action and creates a new state
    reducer: {
        app: slice.reducer,
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})