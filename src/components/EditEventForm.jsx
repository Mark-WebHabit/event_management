import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ref, set } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "../app/firebase.js";

const EditEventForm = ({
  event,
  onCancel,
  setSuccess,
  setErrorMessage,
  setIsErrorModalOpen,
}) => {
  const [editedEvent, setEditedEvent] = useState(event);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent({ ...editedEvent, [name]: value });
  };

  const handleFileChange = (e) => {
    setEditedEvent({ ...editedEvent, picture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Example validation
    if (
      !editedEvent.title ||
      !editedEvent.description ||
      !editedEvent.startDateTime ||
      !editedEvent.endDateTime
    ) {
      setIsErrorModalOpen(true);
      setErrorMessage("All fields are required.");
      return;
    }

    if (
      new Date(editedEvent.startDateTime) >= new Date(editedEvent.endDateTime)
    ) {
      setIsErrorModalOpen(true);
      setErrorMessage("Start date-time must be before end date-time.");
      return;
    }

    setLoading(true);

    try {
      const eventRef = ref(db, `events/${editedEvent.uid}`);

      if (editedEvent.picture) {
        const eventStorageRef = storageRef(
          storage,
          `events/${editedEvent.picture.name}`
        );
        const uploadTask = uploadBytesResumable(
          eventStorageRef,
          editedEvent.picture
        );
        await uploadTask;
        const url = await getDownloadURL(eventStorageRef);
        editedEvent.picture = url;
      }

      // Calculate duration in hours
      const durationInMilliseconds =
        new Date(editedEvent.endDateTime) - new Date(editedEvent.startDateTime);
      const durationInHours = durationInMilliseconds / (1000 * 60 * 60);

      setEditedEvent({ ...editedEvent, duration: durationInHours });

      await set(eventRef, editedEvent);
    } catch (error) {
      setIsErrorModalOpen(true);
      setErrorMessage("An error occurred while updating the event.");
    } finally {
      setLoading(false);
    }

    setSuccess("Event updated successfully!");
  };

  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit Event</ModalTitle>
          <CloseButton onClick={onCancel}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <Label>
              Title:
              <Input
                type="text"
                name="title"
                value={editedEvent.title}
                onChange={handleInputChange}
              />
            </Label>
            <Label>
              Description:
              <TextArea
                name="description"
                value={editedEvent.description}
                onChange={handleInputChange}
                maxLength="200"
              />
              <CharCount>
                {200 - editedEvent.description.length} characters left
              </CharCount>
            </Label>
            <Label>
              Start DateTime:
              <Input
                type="datetime-local"
                name="startDateTime"
                value={editedEvent.startDateTime}
                onChange={handleInputChange}
              />
            </Label>
            <Label>
              End DateTime:
              <Input
                type="datetime-local"
                name="endDateTime"
                value={editedEvent.endDateTime}
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
              <CancelButton type="button" onClick={onCancel}>
                Cancel
              </CancelButton>
              <EditButton type="submit" disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </EditButton>
            </ModalFooter>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditEventForm;

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

const EditButton = styled.button`
  font-size: 1rem;
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

const CancelButton = styled.button`
  font-size: 1rem;
  font-weight: bold;
  padding: 0.5em 1em;
  border-radius: 0.3em;
  border: none;
  cursor: pointer;
  background-color: #dc3545;
  color: white;
  transition: background-color 0.3s;
  margin-right: 1em;

  &:hover {
    background-color: #c82333;
  }
`;
