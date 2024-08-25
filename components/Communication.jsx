"use client";
import { useState, useEffect } from 'react';

export default function Communication() {
    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        fetchConversations();
        fetchUsers();
    }, []);

    useEffect(() => {
        setFilteredUsers(users.filter(user => 
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    }, [searchQuery, users]);

    useEffect(() => {
        // Fetch current user or get from context/session
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('/api/auth/me'); // Adjust the endpoint as needed
                if (!response.ok) throw new Error('Failed to fetch current user');
                const user = await response.json();
                setCurrentUser(user);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };
    
        fetchCurrentUser();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/conversations');
            if (!response.ok) throw new Error('Failed to fetch conversations');
            const data = await response.json();
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (conversationId, recipientId) => {
        try {
            const response = await fetch(`/api/messages/${conversationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversationId, recipient: recipientId }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            setMessages(data);
            setSelectedConversation(conversationId);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const getRecipientIdFromConversation = (conversationId) => {
        // Assuming conversations are loaded and contain participant info
        const conversation = conversations.find(c => c._id === conversationId);
        if (conversation) {
            const participants = conversation.participants;
            // Assuming the sender is the current user
            const senderId = currentUser._id;
            return participants.find(id => id.toString() !== senderId).toString();
        }
        return null;
    };
    
    const sendMessage = async (e) => {
        e.preventDefault();
        if (messageInput.trim() === '') return;
    
        try {
            // Assuming recipientId is determined based on the selected conversation or user context
            const recipientId = getRecipientIdFromConversation(selectedConversation); // Get the recipient ID as needed
    
            console.log('Sending message:', { conversationId: selectedConversation, message: messageInput, recipient: recipientId });
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: selectedConversation,
                    message: messageInput,
                    recipient: recipientId // Include recipient ID here
                })
            });
            if (!response.ok) throw new Error('Failed to send message');
            const newMessage = await response.json();
            setMessages(prevMessages => [...prevMessages, newMessage]);
            setMessageInput('');
        } catch (error) {
            console.error('Error sending message:', error);
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
            {/* Left Sidebar */}
            <div className="w-1/4 space-y-4">
                <div className='border p-2 bg-white rounded-xl'>
                    <input
                        type="text"
                        placeholder=" Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-1 border rounded-full w-full"
                    />
                </div>

                {/* User Search Results */}
                <div className='border p-2 bg-white rounded-xl'>
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

                {/* Recent Chats */}
                <div className='border p-2 bg-white rounded-xl'>
                    <h3 className="font-bold">Recent Chats</h3>
                    <div className="flex-1 border-t rounded-md p-1 max-h-[430px] overflow-y-auto">
                        
                        <div className="flex-1 overflow-auto">
                            {conversations.map((conversation) => (
                                <div
                                    key={conversation._id}
                                    onClick={() => fetchMessages(conversation._id)}
                                    className="p-4 rounded-md cursor-pointer hover:bg-gray-300"
                                >
                                    {/* Conv with {conversation.participants.map(participant => participant.firstName).join(', ')} */}
                                    {conversation.participants}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Chat Window */}
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
                        <form onSubmit={sendMessage} className=" message-input flex">
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