import * as grpc from "@grpc/grpc-js";
import * as path from "path";
import * as protoLoader from "@grpc/proto-loader";
import { db } from "../db/db";
import { users } from "../db/schema";
import { eq, ilike, or, sql } from "drizzle-orm";

type DbUser = (typeof users)["$inferSelect"];

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
    UserService: { service: grpc.ServiceDefinition };
  };
};

function dbUserToProtoUser(row: DbUser): Record<string, unknown> {
  return {
    id: row.id,
    phone_number: row.phoneNumber,
    email: row.email ?? "",
    full_name: row.fullName,
    profile_image: row.profileImage ?? "",
    user_type: row.userType,
    is_verified: row.isVerified ?? false,
    is_active: row.isActive ?? true,
    language_preference: row.languagePreference ?? "en",
    last_seen: row.lastSeen?.toISOString() ?? "",
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

async function createUser(
  call: grpc.ServerUnaryCall<Record<string, unknown>, Record<string, unknown>>,
  callback: grpc.sendUnaryData<Record<string, unknown>>
) {
  try {
    const req = call.request as {
      phone_number: string;
      email?: string;
      full_name: string;
      profile_image?: string;
      user_type: string;
      is_verified?: boolean;
      password: string;
      is_active?: boolean;
      language_preference?: string;
    };
    if (!req.phone_number || !req.full_name || !req.password) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "phone_number, full_name and password are required",
      });
    }
    const userType = req.user_type === "admin" ? "admin" : "user";
    const [inserted] = await db
      .insert(users)
      .values({
        phoneNumber: req.phone_number,
        email: req.email ?? null,
        fullName: req.full_name,
        profileImage: req.profile_image ?? null,
        userType,
        isVerified: req.is_verified ?? false,
        password: req.password,
        isActive: req.is_active ?? true,
        languagePreference: req.language_preference ?? "en",
      })
      .returning();
    if (!inserted) {
      return callback({
        code: grpc.status.INTERNAL,
        message: "Failed to create user",
      });
    }
    callback(null, { user: dbUserToProtoUser(inserted) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    callback({
      code: grpc.status.INTERNAL,
      message: message.includes("unique") ? "Phone number already exists" : message,
    });
  }
}

async function getUser(
  call: grpc.ServerUnaryCall<Record<string, unknown>, Record<string, unknown>>,
  callback: grpc.sendUnaryData<Record<string, unknown>>
) {
  try {
    const req = call.request as { id: number };
    const [row] = await db.select().from(users).where(eq(users.id, req.id)).limit(1);
    if (!row) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "User not found",
      });
    }
    callback(null, { user: dbUserToProtoUser(row) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    callback({ code: grpc.status.INTERNAL, message });
  }
}

async function listUsers(
  call: grpc.ServerUnaryCall<Record<string, unknown>, Record<string, unknown>>,
  callback: grpc.sendUnaryData<Record<string, unknown>>
) {
  try {
    const req = call.request as Record<string, unknown>;
    const page = Math.max(1, Number(req.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.page_size ?? req.pageSize ?? 10)));
    const offset = (page - 1) * pageSize;
    const searchRaw = req.search ?? req.Search ?? "";
    const search = typeof searchRaw === "string" ? searchRaw.trim() : "";
    const searchPattern = search ? `%${search.replace(/%/g, "\\%")}%` : null;

    const whereClause =
      searchPattern === null
        ? undefined
        : or(
            ilike(users.fullName, searchPattern),
            ilike(sql`COALESCE(${users.email}, '')`, searchPattern),
            ilike(users.phoneNumber, searchPattern)
          );

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);
    const total = countResult?.count ?? 0;

    const rows = await db
      .select()
      .from(users)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset);
    callback(null, {
      users: rows.map(dbUserToProtoUser),
      total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    callback({ code: grpc.status.INTERNAL, message });
  }
}

async function updateUser(
  call: grpc.ServerUnaryCall<Record<string, unknown>, Record<string, unknown>>,
  callback: grpc.sendUnaryData<Record<string, unknown>>
) {
  try {
    const req = call.request as {
      id: number;
      phone_number?: string;
      email?: string;
      full_name?: string;
      profile_image?: string;
      user_type?: string;
      is_verified?: boolean;
      password?: string;
      is_active?: boolean;
      language_preference?: string;
    };
    const [existing] = await db.select().from(users).where(eq(users.id, req.id)).limit(1);
    if (!existing) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "User not found",
      });
    }

    const updates: Partial<DbUser> = {
      updatedAt: new Date(),
    };
    if (req.phone_number !== undefined) updates.phoneNumber = req.phone_number;
    if (req.email !== undefined) updates.email = req.email;
    if (req.full_name !== undefined) updates.fullName = req.full_name;
    if (req.profile_image !== undefined) updates.profileImage = req.profile_image;
    if (req.user_type !== undefined)
      updates.userType = req.user_type === "admin" ? "admin" : "user";
    if (req.is_verified !== undefined) updates.isVerified = req.is_verified;
    if (req.password !== undefined) updates.password = req.password;
    if (req.is_active !== undefined) updates.isActive = req.is_active;
    if (req.language_preference !== undefined)
      updates.languagePreference = req.language_preference;

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, req.id))
      .returning();
    if (!updated) {
      return callback({
        code: grpc.status.INTERNAL,
        message: "Failed to update user",
      });
    }
    callback(null, { user: dbUserToProtoUser(updated) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    callback({
      code: grpc.status.INTERNAL,
      message: message.includes("unique") ? "Phone number already exists" : message,
    });
  }
}

async function deleteUser(
  call: grpc.ServerUnaryCall<Record<string, unknown>, Record<string, unknown>>,
  callback: grpc.sendUnaryData<Record<string, unknown>>
) {
  try {
    const req = call.request as { id: number };
    const result = await db.delete(users).where(eq(users.id, req.id)).returning({ id: users.id });
    if (result.length === 0) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "User not found",
      });
    }
    callback(null, { success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    callback({ code: grpc.status.INTERNAL, message });
  }
}

export function getServer(): grpc.Server {
  const server = new grpc.Server();
  server.addService(proto.user.UserService.service, {
    CreateUser: createUser,
    GetUser: getUser,
    ListUsers: listUsers,
    UpdateUser: updateUser,
    DeleteUser: deleteUser,
  });
  return server;
}
