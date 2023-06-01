import type { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";

import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { Server as IOServer } from "socket.io";

interface SocketServer extends HTTPServer {
	io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
	server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
	socket: SocketWithIO;
}

let ids = 0;

export default function Handler(
	req: NextApiRequest,
	res: NextApiResponseWithSocket
) {
	if (res.socket.server.io) {
		console.log("Socket is already running.");
	} else {
		console.log("Socket is initializing...");

		const io = new Server(res.socket.server, {
			path: "/api/socket_io",
			addTrailingSlash: false,
		});

		res.socket.server.io = io;

		io.on("connection", socket => {
			socket.on("chat", msg => {
				socket.broadcast.emit(
					"message",
					JSON.stringify({ message: msg, id: ids++ })
				);
			});
		});
	}

	res.end();
}
