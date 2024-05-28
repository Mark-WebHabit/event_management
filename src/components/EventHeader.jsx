import React from "react";
import styled from "styled-components";

// icons
import { FaPowerOff } from "react-icons/fa";
import { FaMagnifyingGlassChart, FaPeopleGroup } from "react-icons/fa6";

import { courseOptions } from "../../courseOptions";
import { useNavigate } from "react-router-dom";

const EventHeader = ({
  eventData,
  searchText,
  handleSearchInputChange,
  handleCourseChange,
  selectedCourse,
  handleOpenConfirmationModal,
  showTable,
  setShowTable,
  evaluation,
  id
}) => {
const navigate = useNavigate()

  return (
    <Header>
      <Title>
        {eventData && eventData.title}
        <span> {eventData.status}</span>
      </Title>
      <Buttons className="buttons">
       {showTable &&  <Filter>
          <Search
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchInputChange}
          />
        </Filter>}

        {showTable && <Filter>
          <span>Course</span>
          <Select onChange={handleCourseChange} value={selectedCourse}>
            <Option disabled>Select Filter</Option>
            <Option value={"ALL"}>All</Option>
            {courseOptions.map((course, index) => (
              <Option value={course.course} key={index}>
                {course.abbreviation}
              </Option>
            ))}
          </Select>
        </Filter>}
        <Button
          $off={eventData.status !== "Ongoing" || !eventData.open}
          onClick={handleOpenConfirmationModal} // Open confirmation modal on button click
          disabled={eventData.status !== "Ongoing" || !eventData.open}
        >
          <FaPowerOff />
          Attendance
        </Button>
        <Button onClick={() => navigate(`/admin/event/evaluation/${id}`)}>
          {evaluation ? "Form" : "+ Evaluation"}
        </Button>
        <Button onClick={() => setShowTable(!showTable)}>
          {showTable ? <FaMagnifyingGlassChart /> : <FaPeopleGroup />}
          {showTable ? "Reports" : "Presents"}
        </Button>
       
      </Buttons>
    </Header>
  );
};

export default EventHeader;

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

const Filter = styled.div`
  display: flex;
  flex-direction: column;
  background: dodgerblue;
  padding: 0.2em;
  border-radius: 0.3em;

  & span {
    font-size: 0.7rem;
    margin-bottom: 0.1em;
    text-transform: uppercase;
    color: white;
  }
`;

const Search = styled.input`
  font-size: 1rem;
  padding: 0.5em;
  outline: none;
  background: transparent;
  color: white;
  border: none;
  width: 220px;

  &::placeholder {
    color: white;
    font-size: 0.9rem;
  }
`;

const Select = styled.select`
  font-size: 1rem;
  border: 1px solid white;
  background: none;
  outline: none;
  padding: 0.2em;
  border-radius: 0.3em;
  color: white;
`;

const Option = styled.option`
color: white;
padding: 0.3em; 0.5em;
background: dodgerblue;
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
