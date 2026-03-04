import { useState } from 'react';

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            // Read stream
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let aiMessageContent = '';

            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);

                // Vercel AI SDK text stream formatting is '0:"text chunk"\n'
                const lines = chunkValue.split('\n');
                for (const line of lines) {
                    if (line.startsWith('0:')) {
                        try {
                            const text = JSON.parse(line.substring(2));
                            aiMessageContent += text;
                        } catch (e) {
                            console.error("Failed parsing stream chunk", e)
                        }
                    }
                }

                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = aiMessageContent;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error in chat:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'system', content: 'Sorry, I encountered an error connecting to the server.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return { messages, input, handleInputChange, handleSubmit, isLoading };
}
