"use client";
import { useState, useEffect, useRef } from "react";

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

  return (
    <div className="flex h-screen p-4 space-x-4">
      <div className="w-1/4 space-y-4">
        <div className="border p-2 bg-white rounded-xl">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-1 border rounded-full w-full"
          />
        </div>
        <div className="border p-2 bg-white rounded-xl">
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
        <div className="border p-2 bg-white rounded-xl">
          <h3 className="font-bold">Recent Chats</h3>
          <div className="flex-1 border-t rounded-md p-1 max-h-[430px] overflow-y-auto">
            <div className="flex-1 overflow-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => fetchMessages(conversation._id)}
                  className="p-4 rounded-md cursor-pointer hover:bg-gray-300"
                >
                  {conversation.participants.map((p) => `${p.firstName} ${p.lastName}`).join(", ")}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-3/4 border p-2 flex flex-col bg-white rounded-xl">
        {selectedConversation ? (
          <>
            <div className="flex-1 overflow-auto mb-4">
              <div className="messages">
                {messages.map((msg) => (
                  <div key={msg._id} className="p-2 mb-2 bg-gray-200 rounded">
                    <b>{msg.sender.firstName}:</b> {msg.message}
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={sendMessage} className="message-input flex">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 border rounded-l-xl p-1"
                placeholder=" Type a message..."
                            />
                            <button type="submit" className="bg-blue-500 text-white rounded-r-xl px-4 py-2">
                                Send
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