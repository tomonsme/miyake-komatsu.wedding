import { d as defineEventHandler, s as setHeader, u as useRuntimeConfig, c as createError, b as readMultipartFormData } from '../../nitro/nitro.mjs';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'vue';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';

const upload_post = defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "no-store");
  const config = useRuntimeConfig(event);
  if (config.rsvpMode !== "supabase") {
    throw createError({ statusCode: 400, statusMessage: "Upload requires RSVP_MODE=supabase" });
  }
  if (!config.supabaseUrl || !config.supabaseAnonKey && !config.supabaseServiceRole) {
    throw createError({ statusCode: 500, statusMessage: "Supabase configuration is incomplete." });
  }
  const form = await readMultipartFormData(event);
  if (!form || form.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No files received." });
  }
  const supabaseKey = config.supabaseServiceRole || config.supabaseAnonKey;
  const supabase = createClient(config.supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const bucket = "guest-photos";
  const now = /* @__PURE__ */ new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const basePath = `${y}/${m}/${d}`;
  const urls = [];
  for (const part of form) {
    if (part.type !== "file" || !part.filename) continue;
    const contentType = part.type === "file" ? part.mimetype || "application/octet-stream" : "application/octet-stream";
    if (!contentType.startsWith("image/")) continue;
    if (part.data && part.data.length > 10 * 1024 * 1024) {
      throw createError({ statusCode: 413, statusMessage: "File too large (max 10MB)." });
    }
    const ext = part.filename.split(".").pop() || "bin";
    const key = `${basePath}/${randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(key, part.data, { contentType, upsert: false });
    if (upErr) {
      console.error("[upload]", upErr);
      throw createError({ statusCode: 500, statusMessage: "Failed to upload file." });
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
    if (pub == null ? void 0 : pub.publicUrl) urls.push(pub.publicUrl);
  }
  return { urls };
});

export { upload_post as default };
//# sourceMappingURL=upload.post.mjs.map
