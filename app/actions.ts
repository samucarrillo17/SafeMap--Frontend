'use server'

import { z } from 'zod'

const ratingSchema = z.object({ neighborhoodId: z.string().min(1), rating: z.number().int().min(1).max(5), incident: z.boolean(), note: z.string().max(180).optional() })

export async function submitRating(input: unknown) {
  const rating = ratingSchema.parse(input)
  return { ok: true, rating }
}

export async function loginUser(email: string, password: string) {
  return { ok: Boolean(email && password), email }
}

export async function registerUser(email: string, password: string) {
  return { ok: Boolean(email && password), email }
}
