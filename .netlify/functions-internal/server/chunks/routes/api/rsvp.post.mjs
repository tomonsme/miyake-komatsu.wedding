import { d as defineEventHandler, s as setHeader, u as useRuntimeConfig, c as createError, r as readBody } from '../../nitro/nitro.mjs';
import { createClient } from '@supabase/supabase-js';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
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
import 'node:crypto';
import 'vue';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';

const rsvp_post = defineEventHandler(async (event) => {
  var _a, _b;
  setHeader(event, "Cache-Control", "no-store");
  const config = useRuntimeConfig(event);
  if (config.rsvpMode !== "supabase") {
    throw createError({ statusCode: 400, statusMessage: "RSVP mode is not set to supabase." });
  }
  const body = await readBody(event);
  if (!body.name || !body.email || !body.attendance) {
    throw createError({ statusCode: 422, statusMessage: "Missing required fields." });
  }
  if (!config.supabaseUrl || !config.supabaseAnonKey && !config.supabaseServiceRole) {
    throw createError({ statusCode: 500, statusMessage: "Supabase configuration is incomplete." });
  }
  const supabaseKey = config.supabaseServiceRole || config.supabaseAnonKey;
  const supabase = createClient(config.supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
  const payload = {
    name: body.name,
    email: body.email,
    attendance: body.attendance,
    guests: (_a = body.guests) != null ? _a : 0,
    message: (_b = body.message) != null ? _b : "",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  let error = null;
  try {
    const up = await supabase.from("rsvps").upsert(payload, { onConflict: "email" });
    error = up.error;
  } catch (e) {
    error = e;
  }
  if (error) {
    try {
      const ins = await supabase.from("rsvps").insert(payload);
      if (ins.error) {
        console.error("[rsvp.insert]", ins.error);
        throw createError({ statusCode: 500, statusMessage: "Failed to store RSVP." });
      }
    } catch (e) {
      console.error("[rsvp.insert.catch]", e);
      throw createError({ statusCode: 500, statusMessage: "Failed to store RSVP." });
    }
  }
  const emailResult = await sendSesNotifications({
    region: useRuntimeConfig(event).sesRegion,
    from: useRuntimeConfig(event).sesFrom,
    to: useRuntimeConfig(event).sesTo,
    replyTo: useRuntimeConfig(event).sesReplyTo,
    payload
  }).catch((e) => {
    console.error("[rsvp.email]", e);
    return "failed";
  });
  return { success: true, email: emailResult };
});
async function sendSesNotifications(options) {
  var _a, _b;
  const { region, from, to, replyTo, payload } = options;
  if (!region || !from || !to) return "skipped";
  const client = new SESv2Client({ region });
  const toList = to.split(",").map((s) => s.trim()).filter(Boolean);
  const subjectTag = payload.attendance === "attending" ? "\u3054\u51FA\u5E2D" : payload.attendance === "declining" ? "\u3054\u6B20\u5E2D" : "RSVP";
  const timestamp = new Date(payload.created_at).toLocaleString("ja-JP", { hour12: false });
  const adminText = [
    "\u65B0\u3057\u3044RSVP\u304C\u5C4A\u304D\u307E\u3057\u305F\u3002",
    "",
    `\u65E5\u6642: ${timestamp}`,
    `\u304A\u540D\u524D: ${payload.name}`,
    `\u30E1\u30FC\u30EB: ${payload.email}`,
    `\u51FA\u6B20: ${payload.attendance}`,
    `\u540C\u4F34\u8005\u6570: ${(_a = payload.guests) != null ? _a : 0}`,
    "",
    "\u30E1\u30C3\u30BB\u30FC\u30B8:",
    payload.message || "(\u306A\u3057)"
  ].join("\n");
  const guestText = [
    `${payload.name} \u69D8`,
    "",
    "\u3054\u56DE\u7B54\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3002\u4EE5\u4E0B\u306E\u5185\u5BB9\u3067\u627F\u308A\u307E\u3057\u305F\u3002",
    "",
    `\u51FA\u6B20: ${payload.attendance}`,
    `\u540C\u4F34\u8005\u6570: ${(_b = payload.guests) != null ? _b : 0}`,
    "",
    "\u30E1\u30C3\u30BB\u30FC\u30B8:",
    payload.message || "(\u306A\u3057)",
    "",
    "\u3053\u306E\u30E1\u30FC\u30EB\u306B\u304A\u5FC3\u5F53\u305F\u308A\u304C\u306A\u3044\u5834\u5408\u306F\u7834\u68C4\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  ].join("\n");
  const adminCmd = new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: toList },
    ReplyToAddresses: replyTo ? [replyTo] : [],
    Content: {
      Simple: {
        Subject: { Data: `[RSVP] ${subjectTag} - ${payload.name}`, Charset: "UTF-8" },
        Body: { Text: { Data: adminText, Charset: "UTF-8" } }
      }
    }
  });
  const guestCmd = new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: [payload.email] },
    ReplyToAddresses: replyTo ? [replyTo] : [],
    Content: {
      Simple: {
        Subject: { Data: "\u3054\u56DE\u7B54\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF08\u81EA\u52D5\u9001\u4FE1\uFF09", Charset: "UTF-8" },
        Body: { Text: { Data: guestText, Charset: "UTF-8" } }
      }
    }
  });
  await client.send(adminCmd);
  await client.send(guestCmd);
  return "sent";
}

export { rsvp_post as default };
//# sourceMappingURL=rsvp.post.mjs.map
