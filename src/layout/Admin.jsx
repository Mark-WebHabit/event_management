import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import styled from "styled-components";
const Admin = () => {
  return (
    <>
      <AdminHeader />
      <Wrapper className="adminWrapper">
        <Outlet />
      </Wrapper>
    </>
  );
};

export default Admin;

const Wrapper = styled.div`
  &.adminWrapper {
    display: flex;
  }
`;
