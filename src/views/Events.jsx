import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { QRCodeCanvas } from "qrcode.react";

// utilities
import { useSelector } from "react-redux";
import { formatDateTime } from "../utilities/date.js";

// firebase
import { push, ref, set, update } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { storage, db } from "../app/firebase.js";

// component
import EditEventForm from "../components/EditEventForm.jsx";

// modals
import ErrorModal from "../components/ErrorModal.jsx";
import LoadingModal from "../components/LoadingModal.jsx";
import SuccessModal from "../components/SuccessModal.jsx";

const Events = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editSelectedEvent, setEditSelectedEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    status: "Scheduled",
    picture: null,
  });
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { events } = useSelector((state) => state.events);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (events) {
      let filtered = events.filter((event) =>
        event.title.toLowerCase().includes(search.toLowerCase())
      );
      if (filterOption !== "all") {
        filtered = filtered.filter((event) => event.status === filterOption);
      }
      setFilteredData(filtered);
    }
  }, [events, search, filterOption]);

  useEffect(() => {
    if (!editSelectedEvent) {
      return;
    }

    setIsModalOpen(false);
  }, [editSelectedEvent]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleAddEventOpenModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddEventClose = () => {
    setIsAddModalOpen(false);
    setNewEvent({
      title: "",
      description: "",
      startDateTime: "",
      endDateTime: "",
      status: "Scheduled",
      picture: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      picture: e.target.files[0],
    }));
  };

  const handleAddEventSubmit = async (e) => {
    e.preventDefault();

    // Example validation
    if (!newEvent.title) {
      setErrorMessage("Title is required.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!newEvent.description) {
      setErrorMessage("Please Provide a short description");
      setIsErrorModalOpen(true);
      return;
    }

    if (!newEvent.startDateTime || !newEvent.endDateTime) {
      setErrorMessage("Both start and end date-time are required.");
      setIsErrorModalOpen(true);
      return;
    }

    const startDateTime = new Date(newEvent.startDateTime).getTime();
    const endDateTime = new Date(newEvent.endDateTime).getTime();

    if (startDateTime >= endDateTime) {
      setErrorMessage("Start date-time must be before end date-time.");
      setIsErrorModalOpen(true);
      return;
    }

    // Calculate duration in hours
    const durationInMilliseconds = endDateTime - startDateTime;
    const durationInHours = durationInMilliseconds / (1000 * 60 * 60);

    const eventRef = ref(db, "events");
    const newEventRef = await push(eventRef);

    let url = "";

    if (newEvent.picture && newEvent.picture?.name) {
      const eventStorageRef = storageRef(
        storage,
        "events/" + newEvent.picture.name
      );

      const uploadTask = uploadBytesResumable(
        eventStorageRef,
        newEvent.picture
      );

      setLoading(true);
      try {
        await uploadTask;
        url = await getDownloadURL(eventStorageRef);

        const data = {
          title: newEvent.title,
          description: newEvent.description,
          startDateTime: newEvent.startDateTime,
          endDateTime: newEvent.endDateTime,
          status: "Scheduled",
          duration: durationInHours,
          picture: url || null,
          open: true,
        };

        await set(newEventRef, data);
      } catch (error) {
        setErrorMessage(error.message);
        setIsErrorModalOpen(true);
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    setSuccess("Event Added Successfully!.");
    handleAddEventClose();
  };

  const handleEditEvent = (event) => {
    console.log(event);
  };

  const Card = ({ card }) => (
    <CardWrapper
      $bg={card.picture ? card.picture : "/placeholder.jpg"}
      $status={card.status}
      onClick={() => handleCardClick(card)}
    >
      <QRCodeCanvas
        value={`${window.location.origin}/event/${card.uid}`}
        style={{ display: "none" }}
      />

      <div className="wrapper">
        <p className="title">{card.title}</p>
        <div className="rest">
          <div className="rest-wrapper">
            <p className="status">{card.status}</p>
            <div className="dates">
              <span className="date">
                Start: <span>{formatDateTime(card.startDateTime)}</span>
              </span>
              <span className="date">
                End: <span>{formatDateTime(card.endDateTime)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );

  return (
    <Container>
      <QuerySection>
        <Search
          placeholder="Search Event Name..."
          value={search}
          onChange={handleSearchChange}
        />
        <FilterStatus value={filterOption} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Accomplished">Accomplished</option>
        </FilterStatus>
        <TriggerModal>
          <AddEvent onClick={handleAddEventOpenModal}>+ Event</AddEvent>
        </TriggerModal>
      </QuerySection>

      {filteredData && filteredData.length > 0 ? (
        <EventSection>
          {filteredData.map((event) => (
            <Card key={event.uid} card={event} />
          ))}
        </EventSection>
      ) : (
        <NoEventsMessage>No events yet</NoEventsMessage>
      )}

      {isModalOpen && selectedEvent && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{selectedEvent.title}</ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <img
                src={
                  selectedEvent.picture
                    ? selectedEvent.picture
                    : "/placeholder.jpg"
                }
                alt="Event"
              />
              <p>{selectedEvent.description}</p>
              <p>
                <strong>Status:</strong> {selectedEvent.status}
              </p>
              <p>
                <strong>Start:</strong>{" "}
                {formatDateTime(selectedEvent.startDateTime)}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {formatDateTime(selectedEvent.endDateTime)}
              </p>
            </ModalBody>
            <ModalFooter>
              <EditButton onClick={() => setEditSelectedEvent(true)}>
                Edit
              </EditButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {!isModalOpen && selectedEvent && editSelectedEvent && (
        <EditEventForm
          event={selectedEvent}
          onCancel={() => {
            setEditSelectedEvent(false);
            setSelectedEvent(null);
          }}
          onSubmit={handleEditEvent}
          setSuccess={setSuccess}
          setErrorMessage={setErrorMessage}
          setIsErrorModalOpen={setIsErrorModalOpen}
        />
      )}

      {isAddModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>ADD EVENT</ModalTitle>
              <CloseButton onClick={handleAddEventClose}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleAddEventSubmit}>
                <Label>
                  Title:
                  <Input
                    type="text"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                  />
                </Label>
                <Label>
                  Description:
                  <TextArea
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    maxLength="200"
                  />
                  <CharCount>
                    {200 - newEvent.description.length} characters left
                  </CharCount>
                </Label>
                <Label>
                  Start DateTime:
                  <Input
                    type="datetime-local"
                    name="startDateTime"
                    value={newEvent.startDateTime}
                    onChange={handleInputChange}
                  />
                </Label>
                <Label>
                  End DateTime:
                  <Input
                    type="datetime-local"
                    name="endDateTime"
                    value={newEvent.endDateTime}
                    onChange={handleInputChange}
                  />
                </Label>
                <Label>
                  Upload Picture:
                  <Input
                    type="file"
                    name="picture"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </Label>
                <ModalFooter>
                  <AddEventButton type="submit">Add Event</AddEventButton>
                </ModalFooter>
              </Form>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {isErrorModalOpen && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setIsErrorModalOpen(false)}
        />
      )}
      {loading && <LoadingModal />}
      {success && (
        <SuccessModal message={success} onClose={() => setSuccess(null)} />
      )}
    </Container>
  );
};

export default Events;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const QuerySection = styled.div`
  display: flex;
  align-items: center;
  padding: 0.4em 0;
  margin-top: 0.5em;
  gap: 1em;
`;

const Search = styled.input`
  font-size: 1.2rem;
  width: 30%;
  max-width: 500px;
  padding: 0.5em;
  border: 1px solid rgba(0, 0, 0, 0.5);
  outline: 2px solid transparent;
  margin-left: 0.5em;
  border-radius: 0.3em;
  &:focus {
    outline-color: dodgerblue;
  }
`;

const FilterStatus = styled.select`
  height: 100%;
  border-radius: 0.3em;
  padding: 0.4em;
  background: dodgerblue;
  color: white;

  &:focus {
    outline: none;
  }

  & option {
    font-size: 1rem;
  }
`;

const TriggerModal = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 1em;
`;

const AddEvent = styled.button`
  font-size: 1.3rem;
  font-weight: bold;
  padding: 0.5em 1em;
  border-radius: 0.3em;
  border: none;
  cursor: pointer;
  background-color: dodgerblue;
  color: white;
  transition: all 200ms;

  &:hover {
    background-color: red;
  }
`;

const EventSection = styled.div`
  flex: 1;
  overflow-x: hidden;
  overflow-y: scroll;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 1em;
  gap: 3em;
  justify-content: center;
`;

const CardWrapper = styled.div`
  width: 30%;
  max-width: 250px;
  aspect-ratio: 4 / 5;
  border-radius: 1.5em;
  overflow: hidden;
  background: url(${(props) => props.$bg}) no-repeat center center / cover;
  cursor: pointer;
  transition: all 200ms;
  box-shadow: 0px 0px 5px 2px
    ${(props) =>
      props.$status === "Accomplished"
        ? "rgba(0,255,0, 0.6)"
        : "rgba(255,0,0, 0.6)"};

  &:hover {
    scale: 0.9;
  }

  & .wrapper {
    height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;

    & .title {
      padding: 0.4em;
      background-color: white;
      font-size: 1.1rem;
      text-align: center;
      text-transform: capitalize;
    }

    & .rest {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;

      & .rest-wrapper {
        display: flex;
        flex-direction: column;
        background: white;
        padding: 0.5em;

        & .status {
          text-align: center;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        & .dates {
          display: flex;
          flex-direction: column;

          & .date {
            font-weight: bold;
            text-transform: uppercase;
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;

            & span {
              font-weight: normal;
              text-transform: capitalize;
            }
          }
        }
      }
    }
  }
`;

const NoEventsMessage = styled.div`
  padding: 2em;
  text-align: center;
  font-size: 1.5rem;
  color: grey;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 1.5em;
  border-radius: 0.5em;
  width: 80%;
  max-width: 500px;
  position: relative;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 0.5em;
  margin-bottom: 1em;
`;

const ModalTitle = styled.h2`
  margin: 0;
`;

const CloseButton = styled.span`
  font-size: 1.5rem;
  cursor: pointer;
`;

const ModalBody = styled.div`
  img {
    width: 100%;
    height: auto;
    margin-bottom: 1em;
  }

  p {
    margin: 0.5em 0;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 1em;
  border-top: 1px solid #e5e5e5;
`;

const EditButton = styled.button`
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.5em 1em;
  border-radius: 0.3em;
  border: none;
  cursor: pointer;
  background-color: dodgerblue;
  color: white;
  transition: all 200ms;

  &:hover {
    background-color: red;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1em;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 0.3em;
`;

const TextArea = styled.textarea`
  height: 100px;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 0.3em;
  resize: none;
  overflow-y: auto;
`;

const CharCount = styled.span`
  font-size: 0.8rem;
  color: grey;
  text-align: right;
`;

const AddEventButton = styled.button`
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.5em 1em;
  border-radius: 0.3em;
  border: none;
  cursor: pointer;
  background-color: dodgerblue;
  color: white;
  transition: all 200ms;

  &:hover {
    background-color: red;
  }
`;
