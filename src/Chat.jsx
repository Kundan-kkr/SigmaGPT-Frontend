import "./Chat.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import { BeatLoader } from "react-spinners";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeHighlight, rehypeKatex];

function MarkdownMessage({ content }) {
    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
                components={{
                    a: ({ ...props }) => (
                        <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    ),
                    table: ({ ...props }) => (
                        <div className="table-wrapper">
                            <table {...props} />
                        </div>
                    ),
                }}
            >
                {content || ""}
            </ReactMarkdown>
        </div>
    );
}

function Chat({ loading }) {
    const { newChat, prevChats = [], reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    useEffect(() => {
        if (!reply) {
            setLatestReply(null);
            return;
        }

        let idx = 0;
        const words = reply.split(/(\s+)/);
        setLatestReply("");

        const interval = setInterval(() => {
            idx++;
            setLatestReply(words.slice(0, idx).join(""));

            if (idx >= words.length) {
                clearInterval(interval);
            }
        }, 20);

        return () => clearInterval(interval);
    }, [reply]);

    return (
        <div className="chat-layout">
            {newChat && prevChats.length === 0 && (
                <h1 className="new-chat-title">Start a New Chat!</h1>
            )}

            <div className="chats">
                {prevChats.slice(0, -1).map((chat, idx) => (
                    <div
                        className={chat.role === "user" ? "userDiv" : "gptDiv"}
                        key={idx}
                    >
                        {chat.role === "user" ? (
                            <p className="userMessage">{chat.content}</p>
                        ) : (
                            <div className="gptMessage">
                                <MarkdownMessage content={chat.content} />
                            </div>
                        )}
                    </div>
                ))}

                {prevChats.length > 0 && (() => {
                    const lastChat = prevChats[prevChats.length - 1];

                    if (lastChat.role === "user") {
                        return (
                            <div className="userDiv" key="last-user">
                                <p className="userMessage">{lastChat.content}</p>
                            </div>
                        );
                    }

                    return (
                        <div className="gptDiv" key="last-assistant">
                            <div className="gptMessage">
                                <MarkdownMessage
                                    content={
                                        latestReply === null
                                            ? lastChat.content
                                            : latestReply
                                    }
                                />
                            </div>
                        </div>
                    );
                })()}

                {loading && (
                    <div className="gptDiv">
                        <div
                            className="gpt-loader-wrapper"
                            style={{ padding: "12px 0" }}
                        >
                            <BeatLoader
                                color="#ececec"
                                size={10}
                                margin={2}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
