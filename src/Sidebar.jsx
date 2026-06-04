import "./Sidebar.css";
import logo from "./assets/chatgpt-icon.svg";
import sidebar from "./assets/Sidebar.svg";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";
import { API_URL } from "./api";

function Sidebar() {
  const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats, sidebarOpen, setSidebarOpen, newChat} = useContext(MyContext);

  // Show All Thread/Chat Title in Sidebar Section
  const getAllThreads = async () => {
        try {
            const response = await fetch(`${API_URL}/api/thread`);
            const res = await response.json();
            //console.log(res);
            const filteredData = res.map(thread => ({threadId: thread.threadId, title: thread.title}));
            //console.log(filteredData);
            setAllThreads(filteredData);
        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId])


    // Create New Chat
    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);

        setSidebarOpen(false); // Close sidebar after creating new chat
    }

    
  // Specific Chat Open 
    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        setSidebarOpen(false); // Close sidebar when changing threads

        try {
            const response = await fetch(`${API_URL}/api/thread/${newThreadId}`);
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch(err) {
            console.log(err);
        }
    }   


    // Delete Thread/Chat
    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${API_URL}/api/thread/${threadId}`, {method: "DELETE"});
            const res = await response.json();
            console.log(res);

            //updated threads re-render
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
            }

        } catch(err) {
            console.log(err);
        }
    }

  return (
    <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
      {/* Top */}
      <div className="sidebar-top">
        <button className="sidebar-logo">
          <img src={logo} alt="logo" className="chatgpt"/>
        </button>
        <button className="sidebar-logo">
          <img src={sidebar} alt="logo" className="side"/>
        </button>
      </div>

      {/* New Chat */}
      <div className="sidebar-section">
        <button className={`menu-btn ${newChat ? "highlighted" : ""}`}
           onClick={createNewChat}>
           <i className="fa-regular fa-pen-to-square"></i>
          <span>New chat</span>
        </button>

        <button className="menu-btn">
          <i className="fa-solid fa-magnifying-glass"></i>
          <span>Search chats</span>
        </button>
      </div>

      {/* Recent Chats */}
      <div className="recent-section">
        <p className="recent-title">Recents</p>
        <div className="chat-list">
          <ul>
            {
              allThreads?.map((thread, idx) => (
                <li key={idx} 
                  className={`chat-item ${thread.threadId === currThreadId ? "highlighted" : ""}`}
                  onClick={ () => 
                  changeThread(thread.threadId)}
                >
                  <span className="chat-title">{thread.title}</span>
                  <span className="trash-wrapper" onClick={(e) => {
                    e.stopPropagation() //stop event bubbling
                     deleteThread(thread.threadId);
                  }}> 
                    <i className="fa-solid fa-trash-can"></i>
                  </span>
                </li>
              ))
            }
          </ul>

        </div>
      </div>

  {/* Bottom Profile */}
  <div className="sidebar-footer-brand">
    <p className="developer-credit">
      Made with ❤️ by Kundan
    </p>
  </div>
  </aside>
  );
}

export default Sidebar;