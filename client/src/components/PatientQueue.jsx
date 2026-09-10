import React, { useState } from 'react'

const PatientQueue = () => {

  const [name,setName] = useState("");
  const [loading,setLoading]=useState(false);
  const [cancelLoading,setCancelLoading]=useState(false);
  const [error,setError]=useState("");
  const [cancelError,setCancelError]=useState("");
  const [userInfo,setUserInfo]= useState({
        token: null,
        name: "",
        status: "",
        currentToken: null,
        peopleAhead: null 
  })

  const  handleSubmit = async (e) =>{
      e.preventDefault();
      try{
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:8000/api/queue/join",{
          method: "POST",
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "name":name
          })
      })
      
      if(!response.ok){
          setError("Can't join queue please try again");
          return;
        }
      const result = await response.json();

      const response2= await fetch(`http://localhost:8000/api/queue/status/${result.patient.token}`)
      const res=await response2.json();

      if(!response2.ok){
        setError("Error please try again");
        return;
      }

      setName("");

      setUserInfo((prev) => { 
         return {
         ...prev,
         "token": res.token,
         "name": res.name,
         "status": res.status,
         "currentToken": res.currentToken,
         "peopleAhead": res.peopleAhead
         }
      })
      }
      catch(e){
        setError(e.message);
       }
       finally{
            setLoading(false);
       }


      

  }

  const handleCancel = async ()=>{
      try{
        setCancelLoading(true);
        setCancelError("");
      const response = await fetch(`http://localhost:8000/api/queue/cancel/${userInfo.token}`,{
            method: "POST",
      });
      if(!response.ok){
          throw new Error("Cannot cancel Please try again");
      }
      const result=await response.json();
      setUserInfo((prev) => { 
         return {
         ...prev,
         "token": result.token,
         "name": result.name,
         "status": result.status,
         "peopleAhead": null
         }
      })   
    }
    catch(e){
        setCancelError(e.message);        
    }
    finally{
       setCancelLoading(false);
    }
  }


  
  return (
    <div>
        <form  onSubmit={handleSubmit}>
            <input type="text"  name='name' required placeholder='enter name' value={name} onChange={(e) => setName(e.target.value)} />
            <br />
            <button disabled={loading}>{loading ? "Joining..." : "JoinQueue"}</button>
            {error}
            
        </form>
        <div>
            <h3>Token: {userInfo.token}</h3>
            <h3>Name: {userInfo.name}</h3>
            <h3>Status: {userInfo.status}</h3>
            <h3>Current Token: {userInfo.currentToken}</h3>
            <h3>People Ahead: {userInfo.peopleAhead}</h3>

        </div>

        {userInfo.status === "WAITING" && (
            <button disabled={cancelLoading} onClick={handleCancel}>{cancelLoading ? "Cancelling"  : "Cancel Queue"}</button>
        )}
        {cancelError}


    </div>
  )
}

export default PatientQueue
