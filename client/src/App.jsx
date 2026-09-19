import React from "react";
import PatientQueue from "./components/PatientQueue";
import DoctorQueue from "./components/DoctorQueue";
import { useEffect } from "react";
import { io } from "socket.io-client";

const App = () => {
  useEffect(() => {
    const socket = io("http://localhost:8000", {
      withCredentials: true,
    });

    

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    socket.on("queueUpdated", () => {
  console.log("Queue updated");
});

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div>
      <PatientQueue></PatientQueue>
      <DoctorQueue></DoctorQueue>
    </div>
  );
};

export default App;
