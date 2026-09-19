import React, { useEffect, useState } from 'react'
import { io } from "socket.io-client";

const DoctorQueue = () => {

  const [currentToken,setCurrentToken]=useState(0);
  const [queue,setQueue]=useState([]);
  const [nextLoading,setNextLoading]=useState(false);
  const [nextError,setNextError]=useState("");
  const [queueLoading,setQueueLoading] = useState(false)


  const hasWaitingPatient = queue.some((q) => q.status === "WAITING");

    const fetchQueue = async () =>{
       try{
        setQueueLoading(true);
        const response= await fetch("http://localhost:8000/api/doc/queue");
        if(!response.ok){
            throw new Error("Can't Load queue");
        }
        const result=await response.json();
        setQueue(result);
        }
        catch(error){
            console.log(error.message);
        }
        finally{
            setQueueLoading(false);
        }
    }


useEffect(() => {
  const socket = io("http://localhost:8000");

  socket.on("connect", () => {
    console.log("Doctor socket connected:", socket.id);
  });

  socket.on("queueUpdated", () => {
    console.log("Queue updated received by doctor");
    fetchQueue();
  });

  return () => {
    socket.off("connect");
    socket.off("queueUpdated");
    socket.disconnect();
  };
}, []);


  useEffect( ()=>{

    fetchQueue();


  },[]);


const handleNext = async () => {
  try {
    setNextError("");
    setNextLoading(true);

    const response = await fetch(
      "http://localhost:8000/api/doc/next",
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Can't get next - Please try again");
    }

    const result = await response.json();

    setCurrentToken(result.currentToken);
  } catch (e) {
    setNextError(e.message);
  } finally {
    setNextLoading(false);
  }
};

  return (
    <div>
        {queueLoading ? "Queue Loading..." :  queue.length===0 ? "Queue is empty" : (
        <div>
        <h2>{currentToken}</h2>
        {queue.map((q) => {
            return <h2 key={q.token}>{q.token} {q.name} -  {q.status}</h2>
        })}
        {hasWaitingPatient && (
            <button disabled={nextLoading} onClick={handleNext}>
             {nextLoading ? "next..." : "Next Patient"}
            </button>
        )}
        {nextError}
        </div>
        )}
      
    </div>
  )
}

export default DoctorQueue
