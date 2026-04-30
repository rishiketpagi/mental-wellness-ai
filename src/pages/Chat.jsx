import useChat from "../hooks/useChat";
import ChatHeader from "../components/chat/ChatHeader";
import CrisisBanner from "../components/chat/CrisisBanner";
import MessageBubble from "../components/chat/MessageBubble";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";

function Chat() {
    const {
        message, setMessage,
        messages, loading,
        showHelp, toggleHelp,
        clearing,
        messagesEndRef, inputRef,
        handleSend, handleClearChat,
    } = useChat();

    return (
        <div className="mx-auto w-full max-w-4xl space-y-4">
            <ChatHeader
                showHelp={showHelp}
                onToggleHelp={toggleHelp}
                onClearChat={handleClearChat}
                clearing={clearing}
                messageCount={messages.length}
            />

            {showHelp && <CrisisBanner />}

            {/* Chat area */}
            <section className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {/* Messages */}
                <div className="h-[420px] overflow-y-auto bg-gradient-to-b from-gray-50/60 to-white p-4 space-y-4 sm:h-[500px] sm:p-5">
                    {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center max-w-xs">
                                <div className="mb-4 flex justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 text-3xl shadow-inner">
                                        💬
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-gray-800">Start a gentle conversation</h3>
                                <p className="mt-1.5 text-sm text-gray-500">Share what's on your mind. This is a private, supportive space.</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <MessageBubble key={msg.id || index} msg={msg} index={index} />
                        ))
                    )}

                    {loading && <TypingIndicator />}

                    <div ref={messagesEndRef} />
                </div>

                <ChatInput
                    message={message}
                    setMessage={setMessage}
                    loading={loading}
                    onSend={handleSend}
                    inputRef={inputRef}
                />
            </section>
        </div>
    );
}

export default Chat;