import "./Chat.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import { BeatLoader } from "react-spinners"; 
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";


function Chat({ loading }) { 
    // 'reply' ko context se de-structure kiya gaya hai, jisse hum latest assistant response ko track kar sakein
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    
    useEffect(() => {
        // If reply do not come, then close the latestReply and return
        if (!reply) {
            setLatestReply(null);
            return;
        }

        // Word by word split 
        const words = reply.split(" "); 
        let idx = 0;
        
        const interval = setInterval(() => {
            setLatestReply(words.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= words.length) {
                clearInterval(interval);
            }
        }, 40); // Print a word 40ms 
        return () => clearInterval(interval);
    }, [reply]); //  Dependency me sirf 'reply' rakha taaki be-wajah re-render na ho

    return (
        <div className="chat-layout">
            
            {/* Welcome Header */}
            {newChat && (!prevChats || prevChats.length === 0) && (
                <h1 className="new-chat-title">Start a New Chat!</h1>
            )}
            
            <div className="chats">
                {/* Except last message and map the rest part/Old part of message */}
                {prevChats?.slice(0, -1).map((chat, idx) => (
                    <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                        {chat.role === "user" ? (
                            <p className="userMessage">{chat.content}</p>
                        ) : (
                            <div className="gptMessage">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeHighlight, rehypeKatex]}           
                                >
                                    {chat.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                ))}

                {/*First of all Handling Last Message (Live Typing/direct display) */}
                {prevChats.length > 0 && (
                    (() => {
                        const lastChat = prevChats[prevChats.length - 1];
                        
                        // If Last message khud User ka hai, Then directly show on userDiv Do not show on gptDiv!
                        if (lastChat.role === "user") {
                            return (
                                <div className="userDiv" key="last-user">
                                    <p className="userMessage">{lastChat.content}</p>
                                </div>
                            );
                        }

                        // Agar assistant ka message hai, to typing condition check karo
                        return latestReply === null ? (
                            <div className="gptDiv" key="non-typing">
                                <div className="gptMessage">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeHighlight, rehypeKatex]}
                                    >
                                        {lastChat.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ) : (
                            <div className="gptDiv" key="typing">
                                <div className="gptMessage">   
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeHighlight, rehypeKatex]}
                                    >
                                        {latestReply}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        );
                    })()
                )}

                {/* Loading Spinner */}
                {loading && (
                    <div className="gptDiv">
                        <div className="gpt-loader-wrapper" style={{ padding: "12px 0" }}>
                            <BeatLoader color="#ececec" size={10} margin={2} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;