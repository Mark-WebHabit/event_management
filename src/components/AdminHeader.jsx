import React from "react";
import styled, { keyframes } from "styled-components";
import { FaChartPie } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";

import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../app/firebase";

const AdminHeader = () => {
  const navigate = useNavigate();
  const auth = getAuth(app);
  return (
    <HeaderContainer>
      <Logo src="/logo.png" alt="Logo" />
      <Wrapper>
        <PageName onClick={() => navigate("dashboard")}>
          <FaChartPie />
          ADMIN
        </PageName>
        <PageName onClick={() => navigate("events")}>
          <FaPeopleGroup />
          EVENTS
        </PageName>
        <PageName onClick={() => signOut(auth)}>
          <IoLogOut />
          LOGOUT
        </PageName>
      </Wrapper>
    </HeaderContainer>
  );
};

export default AdminHeader;

// Keyframes for animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled components for the header
const HeaderContainer = styled.div`
  background-color: white;
  color: #333;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  max-height: 80px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 1s ease;
`;
const Wrapper = styled.div`
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  align-items: center;
`;

const PageName = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    color: #ffcc00;
  }
`;

const Logo = styled.img`
  max-height: 60px;
  animation: ${fadeIn} 1s ease;
`;
