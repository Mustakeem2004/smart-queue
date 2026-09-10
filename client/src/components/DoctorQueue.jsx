import React, { useEffect, useState } from 'react'

const DoctorQueue = () => {

  const [currentToken,setCurrentToken]=useState(0);
  const [queue,setQueue]=useState([]);
  const [nextLoading,setNextLoading]=useState(false);
  const [nextError,setNextError]=useState("");
  const [queueLoading,setQueueLoading] = useState(false)


  const hasWaitingPatient = queue.some((q) => q.status === "WAITING");


  useEffect( ()=>{
      const fetchQueue = async () =>{
       try{
        setQueueLoading(true);
        const response= await fetch("http://localhost:8000/api/queue");
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
    fetchQueue();


  },[]);


  const handleNext = async () =>{
        try{
          setNextError("");
          setNextLoading(true);
        
        const response= await fetch("http://localhost:8000/api/queue/next",{
            method: "POST",
        });

        if(!response.ok){
            throw new Error("Can't get next - Please try again");
        }
        const result=await response.json();
        setCurrentToken(result.currentToken);

        


        const response2= await fetch("http://localhost:8000/api/queue");
        if(!response2.ok){
            throw new Error("Can't fetch queue Please try again");
        }

        const result2=await response2.json();
        setQueue(result2);  
        }
        catch(e){
            setNextError(e.message);
        }
        finally{
            setNextLoading(false);
        }
  }

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
