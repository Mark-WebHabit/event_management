import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  events: [],
  upComingEvents: 0,
  accomplishedEvents: 0,
  totalEvents: 0,
  yearlyForecastingArray: [],
  monthlyForeCastingArray: [],
};

export const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    handleSetEvents: (state, action) => {
      if (!action.payload) {
        return;
      }
      state.events = action.payload;
    },
    countUpComingEvents: (state) => {
      if (state.events?.length <= 0) {
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
      if (state.events?.length <= 0) {
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
      if (state.events?.length <= 0) {
        return;
      }

      state.totalEvents = state.events.length;
    },

    setYearlyForcastingEventArray: (state, action) => {
      if (state.events?.length <= 0) {
        return;
      }

      const newEvents = state.events.filter((event) => {
        const startDate = new Date(event.startDateTime).getFullYear();

        if (startDate.toString() == action.payload) {
          return event;
        }
      });
      state.yearlyForecastingArray = newEvents;
    },

    setMonthlyForecastingArray: (state, action) => {
      if (state.events?.length <= 0) {
        return;
      }
      const currentYear = new Date().getFullYear();
      const arr = [];
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const thisYearEvent = state.events.filter((event) => {
        const startYear = new Date(event.startDateTime).getFullYear();

        if (parseInt(currentYear) == parseInt(startYear)) {
          return event;
        }
      });

      if (!thisYearEvent || thisYearEvent.length <= 0) {
        return;
      }

      thisYearEvent.forEach((event) => {
        const month = months[new Date(event.startDateTime).getMonth()];

        if (month == action.payload) {
          arr.push(event);
        }
      });
      state.monthlyForeCastingArray = arr;
    },

    handleAddEvent: (state, action) => {},
  },
});

export const {
  countAccomplishedEvents,
  countUpComingEvents,
  countTotalEvents,
  setYearlyForcastingEventArray,
  setMonthlyForecastingArray,
  handleSetEvents,
} = eventSlice.actions;

export default eventSlice.reducer;
