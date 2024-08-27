"use client";
import { useState, useEffect, useRef } from "react";
import {Avatar} from "@nextui-org/react";
import {Send, Phone, Video, EllipsisVertical} from 'lucide-react'

const Communication = ({ session }) => {
  const [currentUser, setCurrentUser] = useState(session?.user);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [polling, setPolling] = useState(false); // Polling state
  const pollingTimeoutRef = useRef(null); // Reference to store polling timeout ID
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return; // Exit if the containerRef is not attached yet

    const isUserNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

    if (isUserNearBottom) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  useEffect(() => {
    if (selectedConversation && !polling) {
      pollMessages(); // Start polling when a conversation is selected
    }
    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current); // Cleanup polling on unmount
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const pollMessages = async () => {
    // Check if selectedConversation is valid
    if (!selectedConversation) {
      console.error("No conversation selected, aborting poll.");
      setPolling(false); // Stop polling
      return;
    }
  
    setPolling(true);
    try {
      const response = await fetch(`/api/messages/${selectedConversation}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data); // Assuming 'data' is the array of messages
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      pollingTimeoutRef.current = setTimeout(pollMessages, 5000); // Poll every 5 seconds
    }
  };

  const fetchMessages = async (conversationId) => {
    setSelectedConversation(conversationId);
    if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current); // Clear previous polling
    pollMessages(); // Start polling for the selected conversation
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getRecipientIdFromConversation = (conversationId) => {
    const conversation = conversations.find((c) => c._id === conversationId);
    if (conversation) {
      const participants = conversation.participants;
      const senderId = currentUser.userId;
      return participants.find((id) => id.toString() !== senderId);//.toString();
    }
    return null;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (messageInput.trim() === "") return;

    console.log("Sending message:", {
        conversationId: selectedConversation,
        message: messageInput,
        recipient: getRecipientIdFromConversation(selectedConversation),
    });

    try {
        const recipientId = getRecipientIdFromConversation(selectedConversation);
        const response = await fetch("/api/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationId: selectedConversation,
                message: messageInput,
                recipient: recipientId,
            }),
        });
        if (!response.ok) throw new Error("Failed to send message");
        const newMessage = await response.json();
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessageInput("");
    } catch (error) {
        console.error("Error sending message:", error);
    }
};


  const startConversation = async (userId) => {
    try {
        const response = await fetch('/api/conversations/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (!response.ok) throw new Error('Failed to start conversation');
        const newConversation = await response.json();
        setConversations(prevConversations => [...prevConversations, newConversation]);
        fetchMessages(newConversation._id, userId);
    } catch (error) {
        console.error('Error starting conversation:', error);
    }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // You can customize this format as needed
};

  return (
    <div className="flex h-[650px] p-4 space-x-4">
      <div className="w-1/4 space-y-4">
        <div className="border p-2 bg-white rounded-xl border-black">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-1 border rounded-full w-full"
          />
        </div>
        <div className="border p-2 bg-white rounded-xl border-black">
          <h3 className="font-bold">Find Users</h3>
          <div className="flex-1 border rounded-md p-1 max-h-[100px] overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => startConversation(user._id)}
                  className="p-1 rounded-md cursor-pointer hover:bg-gray-300"
                >
                  {user.firstName} {user.lastName}
                </div>
              ))
            ) : (
              <div>No users found</div>
            )}
          </div>
        </div>
        <div className="border p-2 bg-white rounded-xl border-black">
          <h3 className="font-bold">Recent Chats</h3>
          <div className="flex-1 border-t rounded-md max-h-[430px] overflow-y-auto">
            <div className="flex-1 space-y-2 overflow-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => fetchMessages(conversation._id)}
                  className={`p-2 rounded-md cursor-pointer hover:bg-gray-200 ${selectedConversation === conversation._id && 'bg-gray-200' }`}
                >
                  {conversation.participants.filter(p => p._id !== currentUser.userId).map((p) => `${p.firstName} ${p.lastName}`)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-3/4 border p-2 flex flex-col bg-white rounded-xl max-h-[650px] border-black">
        {selectedConversation && (
          <div className="border p-2 bg-gray-200 rounded-md border-black">
            {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className="flex items-center space-x-4"
                >
                  {selectedConversation === conversation._id &&(
                    conversation.participants.filter(p => p._id !== currentUser.userId).map((p) => (
                      <>
                      <span className="ml-2 font-bold mr-auto">{p.firstName} {p.lastName}</span>
                      <Phone size={15}/>
                      <Video size={15}/>
                      <EllipsisVertical size={15}/>
                      </>
                    ))
                  )}
                  
                </div>
              ))}
          </div>
        )}
        
        {selectedConversation ? (
          <>
            <div className="flex-1 mb-4">
              <div ref={containerRef} className="flex flex-col messages max-h-[500px] overflow-auto">
                {messages.map((msg) => (
                  <div 
                  key={msg._id} 
                  className={`p-2 mb-2 space-x-2 flex max-w-xs ${msg.sender._id === currentUser.userId ? 'items-baseline' : 'items-center'}`}
                  style={{ alignSelf: msg.sender._id === currentUser.userId ? 'flex-end' : 'flex-start' }}
                  >
                  {msg.sender._id === currentUser.userId ? (
                    <>
                    <div className="flex flex-col">
                        <div className={`p-1 rounded-md max-w-xs bg-blue-300 border border-black`}>                      
                          &nbsp;&nbsp;{msg.message}&nbsp;
                        </div>
                        <span className="text-xs text-gray-500 mr-1 flex justify-end">{formatTime(msg.createdAt)}</span>
                      </div>
                    <div>
                      {msg.sender.userImage ? (
                        <Avatar
                          size="sm"
                          radius="full"
                          src={msg.sender.userImage}
                        />
                      ) : (
                        <Avatar
                          size="sm"
                          radius="full"
                          name={msg.sender.firstName.charAt(0) + msg.sender.lastName.charAt(0)}
                        />
                      )}
                    </div>
                    </>
                  ) : (
                    <>
                    <div>
                      {msg.sender.userImage ? (
                        <Avatar
                          size="sm"
                          radius="full"
                          src={msg.sender.userImage}
                        />
                      ) : (
                        <Avatar
                          size="sm"
                          radius="full"
                          name={msg.sender.firstName.charAt(0) + msg.sender.lastName.charAt(0)}
                        />
                      )}
                      </div>
                      <div className="flex flex-col">
                          <span className="text-sm font-bold ml-1">{msg.sender.firstName}</span>
                        <div className={`p-1 rounded-md max-w-xs bg-gray-200 border border-black`}>                      
                          &nbsp;&nbsp;{msg.message}&nbsp;
                        </div>
                        <span className="text-xs text-gray-500 ml-1">{formatTime(msg.createdAt)}</span>
                      </div>
                    </>
                  )}
                </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <form onSubmit={sendMessage} className="message-input flex">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 border rounded-l-lg p-1 bg-gray-200"
                placeholder=" Type a message..."
              />
                <button type="submit" className="bg-blue-500 text-white rounded-r-lg px-4 py-2">
                    <Send size={15}/>
                </button>
            </form>
          </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    );
}

export default Communication;