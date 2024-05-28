import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { formatDateTime } from "../utilities/date";
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
// icons
import { FaPowerOff } from "react-icons/fa";
import { FaMagnifyingGlassChart, FaPeopleGroup } from "react-icons/fa6";
import ErrorModal from "../components/ErrorModal";
import LoadingModal from "../components/LoadingModal";

const EventDetails = () => {
  const { id } = useParams();
  const eventsRef = ref(db, `events/${id}`);
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({});
  const [showTable, setShowTable] = useState(true);
  // State to control the visibility of the confirmation modal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

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

  return (
    <Container>
      <Header>
        <Title>
          {eventData && eventData.title}
          <span> {eventData.status}</span>
        </Title>
        <Buttons className="buttons">
          <Button
            $off={eventData.status !== "Ongoing" || !eventData.open}
            onClick={handleOpenConfirmationModal} // Open confirmation modal on button click
            disabled={eventData.status !== "Ongoing" || !eventData.open}
          >
            <FaPowerOff />
            Attendance
          </Button>
          <Button onClick={() => setShowTable(!showTable)}>
            {showTable ? <FaMagnifyingGlassChart /> : <FaPeopleGroup />}
            {showTable ? "Reports" : "Presents"}
          </Button>
        </Buttons>
      </Header>

      {showTable && data.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Username</Th>
              <Th>Student ID</Th>
              <Th>Start DateTime</Th>
              <Th>End DateTime</Th>
              <Th>Time In</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((data) => (
              <tr key={data.attendanceId}>
                <Td>{data.username}</Td>
                <Td>{data.studentId}</Td>
                <Td>{formatDateTime(data.startDateTime)}</Td>
                <Td>{formatDateTime(data.endDateTime)}</Td>
                <Td>{formatDateTime(data.timeIn)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!showTable && <DataContainer></DataContainer>}

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
    </Container>
  );
};

export default EventDetails;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1em;
  gap: 1em;
  margin-top: 1em;
`;

const Title = styled.p`
  font-size: 1.6rem;
  font-weight: 700;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 1em;
  & span {
    font-weight: 400;
    font-size: 1rem;
    color: dodgerblue;
  }
`;

const Buttons = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1em;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.8em;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background: ${(props) => (props.$off ? "gray" : "dodgerblue")};
  display: flex;
  align-items: center;
  gap: 0.4em;
  border: none;
  border-radius: 0.5em;

  &:hover {
    background: ${(props) => (props.$off ? "gray" : "red")};
    cursor: pointer;
  }
`;

const Table = styled.table`
  width: 100%;
  margin-top: 2em;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: dodgerblue;
  color: white;
  padding: 1em;
  text-align: left;
`;

const Td = styled.td`
  padding: 1em;
  border-bottom: 1px solid #ddd;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }

  &:hover {
    background-color: #ddd;
  }
`;

const DataContainer = styled.div`
  flex: 1;
`;
