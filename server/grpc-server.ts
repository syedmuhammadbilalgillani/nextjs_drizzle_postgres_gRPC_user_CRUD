import "dotenv/config";
import * as grpc from "@grpc/grpc-js";
import { getServer } from "./grpc-user-service";

const PORT = process.env.GRPC_PORT ?? "50051";
const server = getServer();

server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("gRPC server bind failed:", err);
      process.exit(1);
    }
    console.log(`User gRPC server listening on 0.0.0.0:${port}`);
  }
);
