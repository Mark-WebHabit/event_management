import { createSlice } from "@reduxjs/toolkit";

// dummy data
import { events } from "../../../events";

const initialState = {
  events,
  upComingEvents: 0,
  accomplishedEvents: 0,
  totalEvents: 0,
  yearlyForecastingArray: [],
};

export const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    countUpComingEvents: (state) => {
      if (state.events?.length < 0) {
        return;
      }
      const currentDate = new Date();
      const placeholder = [];

      state.events.forEach((event) => {
        const startDateTime = new Date(event.startDateTime);

        if (startDateTime > currentDate) {
          placeholder.push(event);
        }
      });

      state.upComingEvents = placeholder.length || 0;
    },

    countAccomplishedEvents: (state) => {
      if (state.events?.length < 0) {
        return;
      }
      const currentDate = new Date();
      const placeholder = [];

      state.events.forEach((event) => {
        const endDateTime = new Date(event.endDateTime);

        if (endDateTime <= currentDate) {
          placeholder.push(event);
        }
      });

      state.accomplishedEvents = placeholder.length || 0;
    },

    countTotalEvents: (state) => {
      if (state.events?.length < 0) {
        return;
      }

      state.totalEvents = state.events.length;
    },

    setYearlyForcastingEventArray: (state, action) => {
      if (state.events?.length < 0) {
        return;
      }

      const newEvents = events.filter((event) => {
        const startDate = new Date(event.startDateTime).getFullYear();

        if (startDate.toString() == action.payload) {
          return event;
        }
      });
      state.yearlyForecastingArray = newEvents;
    },
  },
});

export const {
  countAccomplishedEvents,
  countUpComingEvents,
  countTotalEvents,
  setYearlyForcastingEventArray,
} = eventSlice.actions;

export default eventSlice.reducer;
