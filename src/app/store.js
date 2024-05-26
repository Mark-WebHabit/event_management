import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "./features/eventSlice.js";

export const store = configureStore({
  reducer: {
    events: eventReducer,
  },
});
