import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const PatientQueue = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [userInfo, setUserInfo] = useState({
    token: null,
    name: "",
    status: "",
    currentToken: null,
    peopleAhead: null,
    estimatedWaitTime: null,
  });
  const tokenRef = useRef(null);

  useEffect(() => {
    tokenRef.current = userInfo.token;
  }, [userInfo.token]);

  const fetchUserInfo = async (token) => {
    const response2 = await fetch(
      `http://localhost:8000/api/queue/info/${token}`,
    );

    if (!response2.ok) {
      setError("Error please try again");
      return;
    }
    const res = await response2.json();

    setUserInfo((prev) => {
      return {
        ...prev,
        token: res.token,
        name: res.name,
        status: res.status,
        currentToken: res.currentToken,
        peopleAhead: res.peopleAhead,
        estimatedWaitTime: res.estimatedWaitTime,
      };
    });
  };

  useEffect(() => {
    const socket = io("http://localhost:8000");

    socket.on("queueUpdated", () => {
      const latestToken = tokenRef.current;
      if (latestToken !== null) {
        fetchUserInfo(latestToken);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:8000/api/queue/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
        }),
      });

      if (!response.ok) {
        setError("Can't join queue please try againnnnnn");
        return;
      }
      const result = await response.json();

      await fetchUserInfo(result.patient.token);
      setName("");

      // const response2= await fetch(`http://localhost:8000/api/queue/info/${result.patient.token}`)
      // const res=await response2.json();

      // if(!response2.ok){
      //   setError("Error please try again");
      //   return;
      // }

      // setName("");

      // setUserInfo((prev) => {
      //    return {
      //    ...prev,
      //    "token": res.token,
      //    "name": res.name,
      //    "status": res.status,
      //    "currentToken": res.currentToken,
      //    "peopleAhead": res.peopleAhead
      //    }
      // })
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelLoading(true);
      setCancelError("");
      const response = await fetch(
        `http://localhost:8000/api/queue/cancel/${userInfo.token}`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        throw new Error("Cannot cancel Please try again");
      }
      const result = await response.json();
      setUserInfo({
        token: null,
        name: "",
        status: "",
        currentToken: result.currentToken,
        peopleAhead: null,
        estimatedWaitTime: null,
      });
    } catch (e) {
      setCancelError(e.message);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          required
          placeholder="enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <button disabled={loading}>
          {loading ? "Joining..." : "JoinQueue"}
        </button>
        <h3>{error}</h3>
      </form>
      <div>
        <h3>Token: {userInfo.token}</h3>
        <h3>Name: {userInfo.name}</h3>
        <h3>Status: {userInfo.status}</h3>
        <h3>Current Token: {userInfo.currentToken}</h3>
        <h3>People Ahead: {userInfo.peopleAhead}</h3>
        <h3>
  Estimated Wait Time:{" "}
  {userInfo.estimatedWaitTime !== null
    ? `${userInfo.estimatedWaitTime} minutes`
    : "Not available"}
</h3>
      </div>

      {userInfo.status === "WAITING" && (
        <button disabled={cancelLoading} onClick={handleCancel}>
          {cancelLoading ? "Cancelling" : "Cancel Queue"}
        </button>
      )}
      {cancelError}
    </div>
  );
};

export default PatientQueue;
