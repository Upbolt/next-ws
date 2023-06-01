import Head from "next/head";
import { createContext, useContext, useEffect, useState } from "react";

import io, { Socket } from "Socket.IO-client";

interface Message {
	id: number;
	message: string;
}

const SocketClientContext = createContext<Socket | undefined>(undefined);

export default function Home() {
	const [socketClient, setSocketClient] = useState<Socket>();

	useEffect(() => {
		fetch("/api/socket").then(() => {
			const client = io({ path: "/api/socket_io" });

			setSocketClient(client);

			client.on("connect", () => console.log("connected"));
		});
	}, []);

	return (
		<>
			<Head>
				<title>chat app test</title>
			</Head>

			<main>
				<SocketClientContext.Provider value={socketClient}>
					<Chat />
				</SocketClientContext.Provider>
			</main>
		</>
	);
}

function Chat() {
	const socketClient = useContext(SocketClientContext);

	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		if (socketClient === undefined) {
			return;
		}

		socketClient.on("message", msg => {
			setMessages(s => {
				const msgs = [...s, JSON.parse(msg) as Message];

				return msgs.filter(
					(msg, index) =>
						index === msgs.findIndex(foundMsg => foundMsg.id === msg.id)
				);
			});
		});

		() => socketClient.removeListener("message");
	}, [socketClient]);

	if (socketClient === undefined) {
		return null;
	}

	return (
		<>
			<ul style={{ listStyle: "none", padding: 0 }}>
				{messages.map((message, key) => (
					<li key={key}>{message.message}</li>
				))}
			</ul>

			<div>
				<input
					onKeyUp={e => {
						if (e.key == "Enter") {
							socketClient.emit("chat", message);

							setMessage("");
							e.currentTarget.value = "";
						}
					}}
					onChange={e => setMessage(e.target.value)}
				/>
				<button
					type="button"
					onClick={() => socketClient.emit("chat", message)}
				>
					send
				</button>
			</div>
		</>
	);
}
