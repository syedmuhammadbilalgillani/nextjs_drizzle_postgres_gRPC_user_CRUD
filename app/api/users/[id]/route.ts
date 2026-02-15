import { NextResponse } from "next/server";
import { userClient } from "@/lib/grpc-client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const result = await userClient.getUser(id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const code = (err as { code?: number })?.code;
    const status = code === 5 ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.phone_number !== undefined) updates.phone_number = body.phone_number;
    if (body.email !== undefined) updates.email = body.email;
    if (body.full_name !== undefined) updates.full_name = body.full_name;
    if (body.profile_image !== undefined) updates.profile_image = body.profile_image;
    if (body.user_type !== undefined) updates.user_type = body.user_type;
    if (body.is_verified !== undefined) updates.is_verified = body.is_verified;
    if (body.password !== undefined && body.password !== "") updates.password = body.password;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.language_preference !== undefined)
      updates.language_preference = body.language_preference;
    const result = await userClient.updateUser(id, updates as Parameters<typeof userClient.updateUser>[1]);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const code = (err as { code?: number })?.code;
    const status = code === 5 ? 404 : code === 3 ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await userClient.deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const code = (err as { code?: number })?.code;
    const status = code === 5 ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
