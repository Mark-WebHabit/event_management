import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { formatDateTime } from '../utilities/date.js';

const Events = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const { events } = useSelector((state) => state.events);

  useEffect(() => {
    if (events) {
      let filtered = events.filter((event) =>
        event.title.toLowerCase().includes(search.toLowerCase())
      );
      if (filterOption !== 'all') {
        filtered = filtered.filter((event) => event.status === filterOption);
      }
      setFilteredData(filtered);
    }
  }, [events, search, filterOption]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  const Card = ({ card }) => (
    <CardWrapper $bg={'/placeholder.jpg'} $status={card.status}>
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
          <AddEvent>+ Event</AddEvent>
        </TriggerModal>
      </QuerySection>

      {/* events */}
      {filteredData && filteredData.length > 0 ? (
        <EventSection>
          {filteredData.map((event) => (
            <Card key={event.objectId} card={event} />
          ))}
        </EventSection>
      ) : (
        <NoEventsMessage>No events yet</NoEventsMessage>
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
  box-shadow: 0px 0px 5px 2px ${(props) =>
    props.$status === 'Accomplished'
      ? 'rgba(0,255,0, 0.6)'
      : 'rgba(255,0,0, 0.6)'};

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
