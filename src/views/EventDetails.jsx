import React, { useEffect, useReducer, useRef, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { formatDateTime } from "../utilities/date";
import Chart from "chart.js/auto";
// firebase
import { app, db } from "../app/firebase";
import {
  ref,
  get,
  query,
  orderByChild,
  equalTo,
  onValue,
  update,
  off,
} from "firebase/database";

// Import the ConfirmationModal component
import ConfirmationModal from "../components/ConfimationModal";

// data
import { courseOptions } from "../../courseOptions.js";

import ErrorModal from "../components/ErrorModal";
import LoadingModal from "../components/LoadingModal";
import EventHeader from "../components/EventHeader.jsx";
import EventDetailTable from "../components/EventDetailTable.jsx";
import { useSelector, useDispatch } from "react-redux";
import { fetchStudentCount } from "../app/features/userSlice.js";

const EventDetails = () => {
  const { id } = useParams();
  const eventsRef = ref(db, `events/${id}`);
  const chart1Ref = useRef();
  const chart2Ref = useRef();
  const dispatch = useDispatch();
  const { totalStudent } = useSelector((state) => state.user);

  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({});
  const [showTable, setShowTable] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [searchText, setSearchText] = useState(""); // State for search text
  // State to control the visibility of the confirmation modal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // chart states
  const [chart1Labels, setChart1Labels] = useState([]);
  const [chart1Values, setChart1Values] = useState([]);
  const [chart2Values, setChart2Values] = useState([]);

  // data initializisation
  useEffect(() => {
    dispatch(fetchStudentCount());
  }, []);

  // Function to create the chart1
  useEffect(() => {
    const labels = courseOptions.map((c) => ({
      abbreviation: c.abbreviation,
      course: c.course,
    }));

    const values = labels.map((label) => {
      const count = data.reduce((total, student) => {
        return student.course === label.course ? total + 1 : total;
      }, 0);
      return count;
    });
    setChart1Labels(labels);
    setChart1Values(values);
  }, [data, courseOptions]);

  //set the chart2 values
  useEffect(() => {
    const present = data.length;
    const absent = totalStudent - present;

    const arr = [present, absent];
    setChart2Values(arr);
  }, [data, totalStudent]);

  const createChart1 = () => {
    if (chart1Ref.current && data.length > 0) {
      const ctx = chart1Ref.current.getContext("2d");

      if (chart1Ref.current.chart) {
        chart1Ref.current.chart.destroy();
      }

      chart1Ref.current.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: chart1Labels.map((c) => c.abbreviation),
          datasets: [
            {
              label: "Attendees",
              data: chart1Values,
              backgroundColor: [
                "dodgerblue",
                "rgba(30, 144, 255, 0.8)", // Lighter shade of dodger blue
                "rgba(0, 0, 255, 0.8)", // Blue
                "rgba(0, 0, 139, 0.8)", // Dark blue
                // Add more shades of blue as needed
              ],
              borderColor: "blue",
              borderWidth: 1,
            },
          ],
        },
        options: {
          maintainAspectRatio: true,
          aspectRatio: 1,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }
  };

  const createChart2 = () => {
    if (chart2Ref.current && data.length > 0) {
      const ctx = chart2Ref.current.getContext("2d");

      if (chart2Ref.current.chart) {
        chart2Ref.current.chart.destroy();
      }

      chart2Ref.current.chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Present", "Absent"],
          datasets: [
            {
              label: "Attendance Population",
              data: chart2Values,
              backgroundColor: ["dodgerblue", "green"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          maintainAspectRatio: true, // Ensures the chart maintains its aspect ratio
          aspectRatio: 1, // Adjust this value to control the proportion (1 means the chart is a square)
          responsive: true, // Ensures the chart resizes with the container
        },
      });
    }
  };

  useEffect(() => {
    createChart1();
    createChart2();
  }, [chart1Labels, chart1Values, showTable, chart2Values]);

  useEffect(() => {
    async function fetchEventData() {
      setLoading(true);
      try {
        const snapshot = (await get(eventsRef)).val();
        if (!snapshot) {
          setErrorMessage("Event not found");
          return;
        }
        setEventData(snapshot);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    function listenForEventChanges() {
      onValue(eventsRef, (snapshot) => {
        const event = snapshot.val();
        if (event) {
          setEventData(event);
        } else {
          setErrorMessage("Event not found");
        }
      });
    }

    function listenForAttendanceChanges() {
      const attendanceQuery = query(
        ref(db, "attendance"),
        orderByChild("eventId"),
        equalTo(id.toString())
      );

      onValue(attendanceQuery, async (snapshot) => {
        if (snapshot.exists()) {
          const attendanceData = snapshot.val();
          const keys = Object.keys(attendanceData);
          const fetchedData = await Promise.all(
            keys.map(async (key) => {
              const attendanceRecord = attendanceData[key];
              const studentRef = ref(db, `users/${attendanceRecord.userId}`);
              const userSnapshot = await get(studentRef);
              if (userSnapshot.exists()) {
                const user = userSnapshot.val();
                return { ...attendanceRecord, ...user, attendanceId: key };
              }
              return null;
            })
          );
          setData(fetchedData.filter((item) => item !== null));
        } else {
          setErrorMessage("No attendance records found for this event.");
        }
      });
    }

    fetchEventData();
    listenForEventChanges();
    listenForAttendanceChanges();

    // Cleanup listeners on component unmount
    return () => {
      off(eventsRef);
      const attendanceQueryRef = query(
        ref(db, "attendance"),
        orderByChild("eventId"),
        equalTo(id.toString())
      );
      off(attendanceQueryRef);
    };
  }, [id]);

  // Function to handle opening the confirmation modal
  const handleOpenConfirmationModal = () => {
    setShowConfirmationModal(true);
  };

  // Function to handle closing the confirmation modal
  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  // Function to handle turning off attendance
  const handleOffAttendance = async () => {
    // Close the confirmation modal
    handleCloseConfirmationModal();
    // Perform the action to turn off attendance
    const eventRef = ref(db, `events/${id}`);
    await update(eventRef, {
      open: false,
    });
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  // Function to handle search input change
  const handleSearchInputChange = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <Container>
      <EventHeader
        eventData={eventData}
        searchText={searchText}
        handleSearchInputChange={handleSearchInputChange}
        handleCourseChange={handleCourseChange}
        selectedCourse={selectedCourse}
        handleOpenConfirmationModal={handleOpenConfirmationModal}
        showTable={showTable}
        setShowTable={setShowTable}
      />
      {showTable && data.length > 0 && (
        <EventDetailTable
          data={data}
          selectedCourse={selectedCourse}
          searchText={searchText}
        />
      )}

      {/* Render the ConfirmationModal if showConfirmationModal state is true */}
      {showConfirmationModal && (
        <ConfirmationModal
          message="Are you sure you want to turn off attendance?"
          onConfirm={handleOffAttendance} // Pass the handleOffAttendance function as the onConfirm prop
          onCancel={handleCloseConfirmationModal} // Pass the handleCloseConfirmationModal function as the onCancel prop
        />
      )}

      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {loading && <LoadingModal />}

      {!showTable && (
        <DataContainer>
          <ChartWrapper>
            <ChartContainer>
              <canvas ref={chart1Ref}></canvas>
            </ChartContainer>
          </ChartWrapper>
          <ChartWrapper>
            <ChartContainer className="pie">
              <canvas ref={chart2Ref}></canvas>
            </ChartContainer>
          </ChartWrapper>
        </DataContainer>
      )}
    </Container>
  );
};

export default EventDetails;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const DataContainer = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3%;
  margin-top: 4em;
`;

const ChartWrapper = styled.div`
  width: 25%;
  height: fit-content;
  box-shadow: 0px 0px 10px 0px dodgerblue;
  border-radius: 1em;
  position: relative;
  margin-bottom: 20px; /* Add some margin at the bottom to space out multiple charts */
  transition: all 200ms;
  &:hover {
    scale: 0.9;
  }
`;

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* This creates a square container based on width */
  height: 0;
  &.pie {
    padding-top: 100%; /* Same value to ensure consistency */
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
  }
`;
