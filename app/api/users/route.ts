import { NextResponse } from "next/server";
import { userClient } from "@/lib/grpc-client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("page_size") ?? "20", 10)));
    const search = searchParams.get("search") ?? undefined;
    const result = await userClient.listUsers(page, pageSize, search);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const code = (err as { code?: number })?.code;
    const status = code === 3 ? 400 : code === 5 ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      phone_number,
      email,
      full_name,
      profile_image,
      user_type,
      is_verified,
      password,
      is_active,
      language_preference,
    } = body;
    if (!phone_number || !full_name || !password) {
      return NextResponse.json(
        { error: "phone_number, full_name and password are required" },
        { status: 400 }
      );
    }
    const result = await userClient.createUser({
      phone_number,
      email,
      full_name,
      profile_image,
      user_type: user_type ?? "user",
      is_verified: !!is_verified,
      password,
      is_active: body.is_active !== false,
      language_preference: language_preference ?? "en",
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const code = (err as { code?: number })?.code;
    const status = code === 3 ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
