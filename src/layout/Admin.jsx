import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import styled from "styled-components";
import { useDispatch } from "react-redux";

import { handleSetEvents } from "../app/features/eventSlice";

// dummy data
import { events } from "../../events";

const Admin = () => {
  const dispatch = useDispatch();

  // initialize the events state for all admin pages
  useEffect(() => {
    dispatch(handleSetEvents(events));
  }, []);

  return (
    <Container>
      <AdminHeader />
      <Wrapper className="adminWrapper">
        <Outlet />
      </Wrapper>
    </Container>
  );
};

export default Admin;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  &.adminWrapper {
    flex: 1;
    display: flex;

    & > div {
      flex: 1;
    }
  }
`;
