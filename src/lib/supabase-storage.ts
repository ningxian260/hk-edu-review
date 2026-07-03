import "server-only";

import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_BUCKET = "verification-proofs";

const globalForSupabase = globalThis as unknown as {
  supabaseStorage?: SupabaseClient;
};

function hasSupabaseStorageConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseStorageClient() {
  if (!hasSupabaseStorageConfig()) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for file storage.");
  }

  const client =
    globalForSupabase.supabaseStorage ??
    createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

  if (process.env.NODE_ENV !== "production") {
    globalForSupabase.supabaseStorage = client;
  }

  return client;
}

function getVerificationProofBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadVerificationProof(userId: string, proof: File) {
  const client = getSupabaseStorageClient();
  const bucket = getVerificationProofBucket();
  const filePath = `${userId}/${Date.now()}-${randomUUID()}-${safeFileName(proof.name)}`;
  const bytes = Buffer.from(await proof.arrayBuffer());

  const { error } = await client.storage.from(bucket).upload(filePath, bytes, {
    contentType: proof.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error(`Unable to upload verification proof: ${error.message}`);
  }

  return {
    filePath,
    fileName: proof.name,
    fileType: proof.type || "application/octet-stream",
  };
}

export async function downloadVerificationProof(filePath: string) {
  const client = getSupabaseStorageClient();
  const bucket = getVerificationProofBucket();
  const { data, error } = await client.storage.from(bucket).download(filePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Verification proof not found.");
  }

  return data;
}
