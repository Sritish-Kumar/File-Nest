import React, { useState, useEffect } from "react";
import ChatSection from "./ChatSection";
import TextArea from "./TextArea";
import { io } from "socket.io-client";
import axios from "axios";
import { CgProfile } from "react-icons/cg";

const socket = io("http://localhost:3001"); // Backend URL

const ChatPanel = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Mounting
    // Fetch previous messages from MongoDB
    axios
      .get("http://localhost:3001/chat/all", {
        headers: {
          token: localStorage.getItem("authToken"),
          room: "global",
        },
      })
      .then((res) => {
        setMessages(Array.isArray(res.data.data) ? res.data.data : []); // Ensure messages is an array
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setMessages([]);
      });

    // Listen for new messages from WebSocket
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleSendMessage = (newMessage) => {
    socket.emit("sendMessage", { room: "global", ...newMessage });
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const userName = localStorage.getItem("username");

  return (
    <div className="h-screen w-[70%] flex flex-col gap-4 shadow-xl scroll-smooth bg-[#f8f4ff]">
      <div className="flex justify-between items-center bg-gradient-to-r from-[#100227] to-[#470552] text-gray-50 font-bold rounded-none z-50 border-none p-4">
        Community
        <span className="flex gap-2 font-medium">
          {userName}
          <CgProfile className="text-2xl" />
        </span>
      </div>
      <ChatSection messages={messages} />
      <span className="w-full h-[1.8px] bg-gradient-to-r from-gray-200 via-[#680B79] to-gray-200 -mt-2"></span>
      <div className="w-full h-[8%] flex justify-around items-center">
        <TextArea onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPanel;
