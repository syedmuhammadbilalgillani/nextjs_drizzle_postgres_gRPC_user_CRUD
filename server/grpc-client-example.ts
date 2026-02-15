/**
 * Example gRPC client for UserService.
 * Run the gRPC server first: npm run grpc:server
 * Then run: npx tsx server/grpc-client-example.ts
 */
import * as grpc from "@grpc/grpc-js";
import * as path from "path";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = path.join(__dirname, "../proto/user.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as {
  user: {
    UserService: new (address: string, creds: grpc.ChannelCredentials) => {
      CreateUser: (req: object, cb: (err: grpc.ServiceError | null, res: unknown) => void) => void;
      GetUser: (req: object, cb: (err: grpc.ServiceError | null, res: unknown) => void) => void;
      ListUsers: (req: object, cb: (err: grpc.ServiceError | null, res: unknown) => void) => void;
      UpdateUser: (req: object, cb: (err: grpc.ServiceError | null, res: unknown) => void) => void;
      DeleteUser: (req: object, cb: (err: grpc.ServiceError | null, res: unknown) => void) => void;
    };
  };
};

const client = new proto.user.UserService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

async function main() {
  // CreateUser
  client.CreateUser(
    {
      phone_number: "+1234567890",
      email: "alice@example.com",
      full_name: "Alice Doe",
      user_type: "user",
      password: "secret123",
    },
    (err: grpc.ServiceError | null, res: unknown) => {
      if (err) {
        console.error("CreateUser error:", err.message);
        return;
      }
      console.log("CreateUser:", res);
      const id = (res as { user?: { id?: number } })?.user?.id;
      if (id) {
        // GetUser
        client.GetUser({ id }, (err2: grpc.ServiceError | null, res2: unknown) => {
          if (err2) return console.error("GetUser error:", err2.message);
          console.log("GetUser:", res2);
        });
        // UpdateUser
        client.UpdateUser(
          { id, full_name: "Alice Updated" },
          (err3: grpc.ServiceError | null, res3: unknown) => {
            if (err3) return console.error("UpdateUser error:", err3.message);
            console.log("UpdateUser:", res3);
          }
        );
      }
    }
  );

  // ListUsers
  client.ListUsers({ page: 1, page_size: 5 }, (err: grpc.ServiceError | null, res: unknown) => {
    if (err) return console.error("ListUsers error:", err.message);
    console.log("ListUsers:", res);
  });
}

main();
