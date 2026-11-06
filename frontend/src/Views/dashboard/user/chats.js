import React, { useEffect, useState } from "react";
import {
  SendOutlined,
  SearchOutlined,
  MoreVert,
  Person,
  Info,
} from "@mui/icons-material";
import io from "socket.io-client";
import { useAppContext } from "../../../context/userContext";
import { getChat } from "./../../../APIs/user";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Chats() {
  const socket = io("http://localhost:8000");
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [myFriends, setMyFriends] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAppContext();

  useEffect(() => {
    const filtered = user.Chats.filter((chat) =>
      chat.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setMyFriends(filtered);
  }, [searchText, user.Chats]);

  useEffect(() => {
    const getMyChat = async () => {
      if (!activeChat) return;

      setLoadingChat(true);
      try {
        const res = await getChat({
          chatId: activeChat.id,
          Id: user?._id,
        });
        if (res.status === 200) {
          setMessages(res.data.messages);
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      } finally {
        setLoadingChat(false);
      }
    };

    getMyChat();
  }, [activeChat]);

  useEffect(() => {
    socket.emit("register", user?._id);
    socket.on("newMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [user?._id]);

  const sendMessage = () => {
    if (message.trim() && activeChat) {
      const messageData = {
        content: message,
        timestamp: new Date().toISOString(),
        sender: "User",
        chatId: activeChat.id,
        recieverId: activeChat.mentorId,
        senderId: user._id,
        type: "text",
      };
      socket.emit("sendMessage", messageData);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[84vh] scale-[90%] bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="relative mt-3">
            <SearchOutlined className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search conversations"
              className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {myFriends
            .slice()
            .reverse()
            .map((chat) => (
              <motion.div
                key={chat.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveChat(chat)}
                className={`flex items-center p-3 cursor-pointer ${
                  activeChat?.id === chat.id
                    ? "bg-gray-700"
                    : "hover:bg-gray-750"
                }`}
              >
                <div className="relative">
                  <img
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                    src={
                      chat.avatar ||
                      "https://randomuser.me/api/portraits/men/1.jpg"
                    }
                    alt={chat.name}
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{chat.name}</h3>
                    <span className="text-xs text-gray-400">
                      {chat.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {chat.lastMessage || "No messages yet"}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt={activeChat.name}
                />
                <div>
                  <h2 className="font-semibold">{activeChat.name}</h2>
                  <p className="text-xs text-gray-400">Online</p>
                </div>
              </div>
              <div className="flex space-x-4 text-gray-400">
                <button className="hover:text-white">
                  <Info />
                </button>
                <button className="hover:text-white">
                  <MoreVert />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900 bg-opacity-50 bg-[url('https://transparenttextures.com/patterns/dark-mosaic.png')]">
              {loadingChat ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Person className="text-5xl mb-2" />
                  <p className="text-center max-w-md">
                    Start your conversation with {activeChat.name}. Send your
                    first message!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.senderId === user?._id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                          msg.senderId === user?._id
                            ? "bg-purple-600 rounded-tr-none"
                            : "bg-gray-700 rounded-tl-none"
                        }`}
                      >
                        {msg.type === "text" ? (
                          <>
                            <p className="text-white">{msg.content}</p>
                            <p className="text-xs text-gray-300 mt-1 text-right">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </>
                        ) : (
                          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-lg">
                            <p className="font-medium mb-2">
                              Doubt Session Invite
                            </p>
                            <Link
                              to="/dashboard/user/doubt-session"
                              state={{
                                token: msg.content,
                                doubt: msg.doubt,
                              }}
                              className="inline-block bg-white text-purple-600 px-4 py-1 rounded-md text-sm font-medium hover:bg-gray-100"
                            >
                              Join Session
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className={`ml-3 p-2 rounded-full ${
                    message.trim()
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  <SendOutlined className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-64 h-64 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full opacity-20 blur-xl absolute"></div>
            <div className="relative z-10 text-center p-8">
              <h2 className="text-2xl font-bold mb-2">
                Welcome to AlgoMate Chat
              </h2>
              <p className="mb-6">Select a conversation to start chatting</p>
              <div className="flex justify-center space-x-4">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Person className="text-3xl" />
                </div>
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Person className="text-3xl" />
                </div>
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Person className="text-3xl" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chats;
