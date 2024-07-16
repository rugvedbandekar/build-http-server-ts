import * as net from "net";
import * as process from "process";
import * as fs from "fs";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const method = request.split(" ")[0];
    const path = request.split(" ")[1];
    const endpoint = path.split("/")[1];
    const query = path.split("/")[2];

    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (endpoint === "echo") {
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:${query.length}\r\n\r\n${query}`;
      socket.write(response);
    } else if (endpoint === "user-agent") {
      const parts = request.split("\r\n");
      const userAgentHeader = parts.filter((el) =>
        el.includes("User-Agent")
      )[0];

      const agent = userAgentHeader.split(":")[1].trim();

      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:${agent.length}\r\n\r\n${agent}`;
      socket.write(response);
    } else if (endpoint === `files`) {
      if (method === "GET") {
        const fileName = query;
        const args = process.argv[3];

        const filePath = args + fileName;

        try {
          const content = fs.readFileSync(filePath);
          const response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length:${content.length}\r\n\r\n${content}`;
          socket.write(response);
        } catch (error) {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
      } else if (method === "POST") {
        const parts = request.split("\r\n");
        const data = parts[parts.length - 1];
        const fileName = query;
        const args = process.argv[3];
        const filePath = args + fileName;
        console.log(data);
        try {
          const content = fs.writeFileSync(filePath, data);
          const response = `HTTP/1.1 201 Created\r\n\r\n`;
          socket.write(response);
        } catch (error) {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
      }
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
    socket.end();
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
