"use server";

import { CalificacionOutput } from "@/app/schemas/calificacion-schema";
import axios from "axios";
import { cookies } from "next/headers";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function extractMessage(message: unknown): string | null {
  if (typeof message === "string") return message;
  if (Array.isArray(message)) {
    return message.map(extractMessage).filter(Boolean).join(", ") || null;
  }
  if (message && typeof message === "object" && "message" in message) {
    return extractMessage((message as { message: unknown }).message);
  }
  return null;
}

export async function crearCalificacionAction(
  barrioId: string,
  values: CalificacionOutput,
) {
  try {
    const headers = await getAuthHeader();

    const { data } = await axios.post(
      `${process.env.API_URL}/calificacion/${barrioId}`,
      values,
      { headers },
    );

    return { success: true as const, data };
  } catch (error: any) {
    console.error(
      "crearCalificacionAction:",
      error.response?.data ?? error.message,
    );
    return {
      success: false as const,
      error:
        extractMessage(error.response?.data?.message) ??
        "Error al crear la calificación",
    };
  }
}