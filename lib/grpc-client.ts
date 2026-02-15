import * as grpc from "@grpc/grpc-js";
import * as path from "path";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = path.join(process.cwd(), "proto", "user.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as {
  user: {
    UserService: new (
      address: string,
      creds: grpc.ChannelCredentials,
      options?: Record<string, number | string>
    ) => {
      CreateUser: (req: object, cb: (err: grpc.ServiceError | null, res: unknown) => void) => void;
      GetUser: (req: object, cb: (err: grpc.ServiceError | null, res: unknown) => void) => void;
      ListUsers: (req: object, cb: (err: grpc.ServiceError | null, res: unknown) => void) => void;
      UpdateUser: (req: object, cb: (err: grpc.ServiceError | null, res: unknown) => void) => void;
      DeleteUser: (req: object, cb: (err: grpc.ServiceError | null, res: unknown) => void) => void;
    };
  };
};

const grpcHost = process.env.GRPC_HOST ?? "localhost";
const grpcPort = process.env.GRPC_PORT ?? "50051";
const address = `${grpcHost}:${grpcPort}`;

type UserServiceClient = InstanceType<typeof proto.user.UserService>;
let clientInstance: UserServiceClient | null = null;

function getClient(): UserServiceClient {
  if (!clientInstance) {
    clientInstance = new proto.user.UserService(
      address,
      grpc.credentials.createInsecure(),
      {
        "grpc.keepalive_time_ms": 10_000,
        "grpc.keepalive_timeout_ms": 5_000,
        "grpc.keepalive_permit_without_calls": 1,
      }
    );
  }
  return clientInstance;
}

function promiseRpc<T>(
  fn: (cb: (err: grpc.ServiceError | null, res: unknown) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, res) => {
      if (err) reject(err);
      else resolve(res as T);
    });
  });
}

export type User = {
  id: number;
  phone_number: string;
  email: string;
  full_name: string;
  profile_image: string;
  user_type: string;
  is_verified: boolean;
  is_active: boolean;
  language_preference: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
};

export const userClient = {
  listUsers(page = 1, pageSize = 20, search?: string) {
    const query: { page: number; page_size: number; search?: string } = {
      page,
      page_size: pageSize,
    };
    if (search && search.trim() !== "") query.search = search.trim();
    return promiseRpc<{ users: User[]; total: number }>((cb) =>
      getClient().ListUsers(query, cb)
    );
  },
  getUser(id: number) {
    return promiseRpc<{ user: User }>((cb) => getClient().GetUser({ id }, cb));
  },
  createUser(data: {
    phone_number: string;
    email?: string;
    full_name: string;
    profile_image?: string;
    user_type?: string;
    is_verified?: boolean;
    password: string;
    is_active?: boolean;
    language_preference?: string;
  }) {
    return promiseRpc<{ user: User }>((cb) => getClient().CreateUser(data, cb));
  },
  updateUser(
    id: number,
    data: {
      phone_number?: string;
      email?: string;
      full_name?: string;
      profile_image?: string;
      user_type?: string;
      is_verified?: boolean;
      password?: string;
      is_active?: boolean;
      language_preference?: string;
    }
  ) {
    return promiseRpc<{ user: User }>((cb) => getClient().UpdateUser({ id, ...data }, cb));
  },
  deleteUser(id: number) {
    return promiseRpc<{ success: boolean }>((cb) => getClient().DeleteUser({ id }, cb));
  },
};
