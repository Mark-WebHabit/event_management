import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Chart from "chart.js/auto";
import { useSelector } from "react-redux";

import { courseOptions } from "../../courseOptions";

const EventDetailDataCOntainer = ({ data, showTable }) => {
  const { totalStudent } = useSelector((state) => state.user);
  // chart states
  const [chart1Labels, setChart1Labels] = useState([]);
  const [chart1Values, setChart1Values] = useState([]);
  const [chart2Values, setChart2Values] = useState([]);
  const [chart3Labels, setChart3Labels] = useState([]);
  const [chart3Values, setChart3Values] = useState([]);
  const [selectedCourseChart3, setSelectedCourseChart3] = useState(courseOptions[0].course);


  const chart1Ref = useRef();
  const chart2Ref = useRef();
  const chart3Ref = useRef();

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

  // set the chart2 values
  useEffect(() => {
    const present = data.length;
    const absent = totalStudent - present;

    const arr = [present, absent];
    setChart2Values(arr);
  }, [data, totalStudent]);

  useEffect(() => {
    if (!selectedCourseChart3) {
      return;
    }

    const selectedCourse = courseOptions.find((c) => c.course === selectedCourseChart3);

    if (selectedCourse) {
      const arr = [];
      const majors = selectedCourse.majors.map((major) => major);

      majors.forEach((m) => {
        arr.push(m.major);
      });

      setChart3Labels(arr);

      const values = arr.map((label) => {
        const count = data.reduce((total, student) => {
          return student.major === label ? total + 1 : total;
        }, 0);

        return count;
      });

      setChart3Values(values);
    }
  }, [selectedCourseChart3, courseOptions]);

  // set chart4values
  // useEffect(() => {}, [])

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
                "#1E90FF", // Dodger Blue
                "rgba(30, 144, 255, 0.8)", // Lighter shade of dodger blue
                "rgba(0, 0, 255, 0.8)", // Blue
                "rgba(0, 0, 139, 0.8)", // Dark blue
                // Add more shades of blue as needed
              ],
              borderColor: "#1E90FF",
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
                font: {
                  size: 16,
                },
                stepSize: 1,
              },
              title: {
                display: true,
                text: "Students",
                color: "red",
                font: {
                  size: 20,
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 16,
                },
              },
            },
            tooltip: {
              bodyFont: {
                size: 20,
              },
              titleFont: {
                size: 20,
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
        type: "doughnut",
        data: {
          labels: ["Present", "Absent"],
          datasets: [
            {
              label: "Attendance Population",
              data: chart2Values,
              backgroundColor: ["#1E90FF", "#32CD32"], // Dodger Blue and Lime Green
              borderWidth: 1,
            },
          ],
        },
        options: {
          maintainAspectRatio: true, // Ensures the chart maintains its aspect ratio
          aspectRatio: 1, // Adjust this value to control the proportion (1 means the chart is a square)
          responsive: true, // Ensures the chart resizes with the container
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 16,
                },
              },
            },
            tooltip: {
              bodyFont: {
                size: 20,
              },
              titleFont: {
                size: 20,
              },
            },
          },
        },
      });
    }
  };

  const createChart3 = () => {
    if (chart3Ref.current && chart3Labels.length > 0 && chart3Values.length > 0) {
      const ctx = chart3Ref.current.getContext("2d");

      if (chart3Ref.current.chart) {
        chart3Ref.current.chart.destroy();
      }

      chart3Ref.current.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: chart3Labels,
          datasets: [
            {
              label: "Attendance based on major",
              data: chart3Values,
              backgroundColor: [
                "#1E90FF", // Dodger Blue
                "rgba(30, 144, 255, 0.8)", // Lighter shade of dodger blue
                "rgba(0, 0, 255, 0.8)", // Blue
                "rgba(0, 0, 139, 0.8)", // Dark blue
                // Add more shades of blue as needed
              ],
              borderColor: "#1E90FF",
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
                font: {
                  size: 16,
                },
                stepSize: 1,
              },
              title: {
                display: true,
                text: "Students",
                color: "red",
                font: {
                  size: 20,
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 16,
                },
              },
            },
            tooltip: {
              bodyFont: {
                size: 20,
              },
              titleFont: {
                size: 20,
              },
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    createChart1();
    createChart2();
  }, [chart1Labels, chart1Values, showTable, chart2Values]);

  useEffect(() => {
    createChart3();
  }, [selectedCourseChart3, chart3Labels]);

  return (
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
      {courseOptions && (
        <ChartWrapper>
          <FilterCourseChart3 value={selectedCourseChart3} onChange={(e) => setSelectedCourseChart3(e.target.value)}>
            {courseOptions.map((c, index) => (
              <option key={index} value={c.course}>{c.abbreviation}</option>
            ))}
          </FilterCourseChart3>
          <ChartContainer>
            <canvas ref={chart3Ref}></canvas>
          </ChartContainer>
        </ChartWrapper>
      )}
     
      
    </DataContainer>
  );
};

export default EventDetailDataCOntainer;

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
    scale: 0.990;
  }
  overflow: hidden;
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

const FilterCourseChart3 = styled.select`
  padding: 0.3em 1em;
  border: none;
  background: dodgerblue;
  outline: none;
  color: white;
  display: inline-block;
  margin: 0 auto;
`;
