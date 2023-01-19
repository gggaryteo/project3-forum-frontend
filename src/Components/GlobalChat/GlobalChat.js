import React, { useRef, useState, ReactDOM, useEffect } from 'react'
import Container from '@mui/material/Container'
import { Button } from '@mui/material'
import { Send } from '@mui/icons-material'
import "./GlobalChat.css"

import { io } from "socket.io-client"


//Socket.io is a living creature, and the react environment is a nuclear wasteland.
//Theres a reason socket.io is outside of said nuclear wasteland. I can't quite explain why, but there is. (infinite loops)

export const GlobalChat = () => {
  
  // this is dangerous af but i need it to fix a bug where chat doesnt appear after login
  const socket = io('http://localhost:3002')


  // declaring states
  const [input,setInput] = useState("")
  const [inputError,setInputError] = useState("")
  const [messageLog, setMessageLog] = useState([])
  const chatRef = useRef(null)

  // getting localstorage data, mainly to check if user is logged in or not
  const data = JSON.parse(localStorage.getItem('loggedUser'))

  // useEffects are required if socket is defined inside the react environment
  useEffect(()=> {
    socket.on('retrive-chat', (log)=>{
      console.log("retrive-chat")
      setMessageLog(log)
    })
  },[])

  useEffect(()=>{
    socket.on('receive-message', (message, username) => {
      console.log('recieve-message')
      setMessageLog([...messageLog, {message: message, user: username}])
    })
  },[messageLog])
  
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // input validation
    if(input === "" || input.replace(/\s/g, '').length === 0){
      setInputError("Cannot send empty message!")
      return
    }
    if(input.length > 255){
      setInputError("Please use less than 255 characters!")
      return
    }

    // updating message log locally
    setMessageLog([...messageLog, {message: input, user: data.username}])
    // updating message log server side
    socket.emit('send-message', input, data.username)

    setInput("")
    setInputError("")
  }

  return (
    <>
        <div style={{width:"350px"}}>
            <Container id="chat" ref={chatRef} sx={{
                width: "350px",
                height: "400px",
                overflow:"auto",
                paddingInline:"12px !important",
                paddingBlock:"10px",
                border:"solid black 1px",
            }}>
                {messageLog.length === 0 ? "No messages yet": messageLog.map((obj) => {
                  return (
                    <div style={{display:"flex"}}>{obj.user}: {obj.message}</div>
                    )
                  })
                }
            </Container>
            <Container>
              {data !== null ? 
              <form style={{display:"flex"}}>
                <input type={"text"} value={input} onChange={(e)=>{setInput(e.target.value)}}/>
                <Button onClick={(e)=>{handleSubmit(e)}} variant="contained" endIcon={<Send />}>
                  Send
                </Button>
              </form> : "Please log in to chat"}
              {inputError === "" ? "" : <span style={{color:"red"}}>{inputError}</span>}
            </Container>
           
            
        </div>
    </>
  )
}