import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
import { u as useHead } from './server.mjs';
import '../nitro/nitro.mjs';
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
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'framesync';
import 'popmotion';
import 'style-value-types';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const token = ref("");
    const rows = ref([]);
    const notice = ref("");
    const filter = ref("all");
    const filtered = computed(() => rows.value.filter((r) => filter.value === "all" ? true : r.attendance === filter.value));
    function jAttendance(a) {
      return a === "attending" ? "出席" : a === "declining" ? "欠席" : a;
    }
    function toJP(iso) {
      try {
        return new Date(iso).toLocaleString("ja-JP", { hour12: false });
      } catch {
        return iso;
      }
    }
    useHead({ meta: [{ name: "robots", content: "noindex,nofollow" }] });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-royal text-white px-6 py-10" }, _attrs))}><div class="mx-auto w-full max-w-screen-lg"><h1 class="font-display text-2xl md:text-3xl">Admin Dashboard</h1><p class="mt-2 text-sm text-white/70">RSVPの一覧・エクスポート</p><div class="mt-6 flex items-end gap-3"><label class="block text-sm"><span class="block text-xs text-white/70">ADMIN_TOKEN</span><input${ssrRenderAttr("value", unref(token))} type="password" class="rounded-md border border-white/20 bg-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gold w-64" placeholder="トークン"></label><button class="btn-gold btn-lg">読み込み</button><button class="btn-secondary btn-lg"${ssrIncludeBooleanAttr(unref(rows).length === 0) ? " disabled" : ""}>CSVをダウンロード</button></div>`);
      if (unref(notice)) {
        _push(`<div class="mt-4 text-sm text-white/80">${ssrInterpolate(unref(notice))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(rows).length) {
        _push(`<div class="mt-6"><div class="mb-3 flex flex-wrap items-center gap-3 text-sm"><label class="inline-flex items-center gap-2"><span>フィルタ:</span><select class="rounded-md border border-white/20 bg-white/10 px-2 py-1"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(filter)) ? ssrLooseContain(unref(filter), "all") : ssrLooseEqual(unref(filter), "all")) ? " selected" : ""}>すべて</option><option value="attending"${ssrIncludeBooleanAttr(Array.isArray(unref(filter)) ? ssrLooseContain(unref(filter), "attending") : ssrLooseEqual(unref(filter), "attending")) ? " selected" : ""}>出席</option><option value="declining"${ssrIncludeBooleanAttr(Array.isArray(unref(filter)) ? ssrLooseContain(unref(filter), "declining") : ssrLooseEqual(unref(filter), "declining")) ? " selected" : ""}>欠席</option></select></label><button class="btn-secondary btn-sm">メール一覧をコピー</button><span class="text-white/60">件数: ${ssrInterpolate(unref(filtered).length)}</span></div><div class="overflow-auto rounded-lg ring-1 ring-white/20"><table class="min-w-[900px] w-full text-sm"><thead class="bg-white/10"><tr><th class="px-3 py-2 text-left font-semibold">日時</th><th class="px-3 py-2 text-left font-semibold">お名前</th><th class="px-3 py-2 text-left font-semibold">メール</th><th class="px-3 py-2 text-left font-semibold">出欠</th><th class="px-3 py-2 text-left font-semibold">同伴</th><th class="px-3 py-2 text-left font-semibold">メッセージ</th><th class="px-3 py-2 text-left font-semibold">写真</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(filtered), (r) => {
          _push(`<tr class="odd:bg-white/5"><td class="align-top px-3 py-2 whitespace-nowrap">${ssrInterpolate(toJP(r.created_at))}</td><td class="align-top px-3 py-2">${ssrInterpolate(r.name)}</td><td class="align-top px-3 py-2"><a class="underline"${ssrRenderAttr("href", "mailto:" + r.email)}>${ssrInterpolate(r.email)}</a></td><td class="align-top px-3 py-2">${ssrInterpolate(jAttendance(r.attendance))}</td><td class="align-top px-3 py-2 text-center">${ssrInterpolate(r.guests ?? 0)}</td><td class="align-top px-3 py-2 whitespace-pre-wrap">${ssrInterpolate(r.message)}</td><td class="align-top px-3 py-2"><ul class="space-y-1"><!--[-->`);
          ssrRenderList(r.photos, (u) => {
            _push(`<li><a class="underline break-all"${ssrRenderAttr("href", u)} target="_blank" rel="noopener">${ssrInterpolate(u)}</a></li>`);
          });
          _push(`<!--]-->`);
          if (!r.photos?.length) {
            _push(`<li class="text-white/50">—</li>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</ul></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=admin-CfWdZDEl.mjs.map
