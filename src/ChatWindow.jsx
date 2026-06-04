import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext";
import { useContext, useState } from "react";
import { API_URL } from "./api";


function ChatWindow() {
  const {prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, sidebarOpen, setSidebarOpen} = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);


   const getReply = async () => {
    if (!prompt.trim()) return;

    const userMessage = prompt; // Put on Current text safe before clearing (Because setPrompt("") is asynchronous and prompt will be empty when we try to use it for API call)
    setPrompt("");              // Instant clear Input Box (ChatGPT Style)
    setNewChat(false);          // Close the Welcome screen if user is typing in an existing thread (Not New Chat)
    {/* console.log("message ", prompt, " threadId ", currThreadId); */}

    //Instantly Display the  User message in chat screen (Without waiting for API response) - Like how ChatGPT does
    setPrevChats((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: userMessage,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch(`${API_URL}/api/chat`, options);
            const res = await response.json();

            // If Error will come in Backend (For Eg. Limit/Quota will be ended or any other error), then show alert and return (Don't update the chat with error message)
            if (!response.ok) {
              alert(res.error || "SigmaGPT is temporarily unavailable. Please try again later.");
              setLoading(false);
              return;
            }
            console.log(res);
            setReply(res.reply);

        // If Response come then append the assistant's reply to the chat (Like how ChatGPT does)
            setPrevChats((prev) => [...prev, 
              { role: "assistant", 
                content: res.reply 
              }]
            );   
        } catch(err) {
            console.log(err);
        }
        setLoading(false);
  }
  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  }

 
{/*  //Append new chat to prevChats
    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                },{
                    role: "assistant",
                    content: reply
                }]
            ));
        }

        setPrompt("");
    }, [reply]);  */}


  return(
  <div className="chat-window">
    <nav className="navbar">
      {/* Left Side */}
      <div className="navbar-left">
        {/* Mobile Menu Button */}
        <div className="mobile-menu">
          <button
            onClick={() => setSidebarOpen(true)}
          >
            <i class="fa-solid fa-bars-staggered"></i>
          </button>
        </div>
        <div className="gpt-dropdown">
          <div className="gpt-title">
            <span>SigmaGPT</span>
            <i className="fa-solid fa-chevron-down"></i>
          </div>

          {/* Dropdown Menu */}
          <div className="dropdown-menu">
            <div className="dropdown-item active">
              <i className="fa-solid fa-bolt"></i>
              <div>
                <h4>SigmaGPT</h4>
                <p>Great for everyday tasks</p>
              </div>
            </div>

            <div className="dropdown-item">
              <i className="fa-solid fa-brain"></i>
              <div>
                <h4>Reason</h4>
                <p>Better for thinking & coding</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
    <div className="navbar-right">
      <button className="upgrade-btn">
        <i className="fa-solid fa-gift"></i>
        Free Offer
      </button>

      {/* Profile Avatar Container */}
      <div className="profile-container">
        <button className="profile-avatar-btn" onClick={handleProfileClick}>
          {/* Here you are Own picture */}
          <i class="fa-solid fa-user"></i>
        </button>

        {isOpen && (
          <div className="dropDown">
            <div className="dropDownItem">
              <i className="fa-solid fa-gear"></i> Settings
            </div>
            <div className="dropDownItem">
              <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
            </div>
            <div className="dropDownItem">
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
            </div>
          </div>
        )}
      </div>
    </div>
    </nav>

    {sidebarOpen && (
    <div
      className="overlay"
      onClick={() => setSidebarOpen(false)}
    />
    )}

    {/* Chat */}
    <div className="chat-container">
        <Chat loading={loading} />
    </div>

      {/* SEARCH BAR */}
      <div className="search-wrapper">
        <div className="search-bar">
          {/* LEFT ICON */}
          <button className="icon-btn left-btn">
            <i className="fa-solid fa-plus"></i>
          </button>
          {/* INPUT */}
          <input
            type="text"
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter'? getReply() : ''}

          />
          {/* RIGHT ICONS */}
          <div className="right-icons">
            {/* MIC */}
            <button className="icon-btn mic-btn">
              <i className="fa-solid fa-microphone"></i>
            </button>
            {/* SEND */}
            <button className="send-btn" onClick={getReply}>
              <i className="fa-solid fa-arrow-up"></i>
            </button>
          </div>
        </div>
        <p className="info">
          SigmaGPT can make mistakes. Check important info. See Cookie Preferences.
        </p>
      </div>
    </div>
  );
}
 

export default ChatWindow;