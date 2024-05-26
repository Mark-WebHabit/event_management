import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import styled from "styled-components";
const Admin = () => {
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
`

const Wrapper = styled.div`
  &.adminWrapper {
    flex: 1;
    display: flex;

    & > div{
      flex: 1;
    }
  }
`;
