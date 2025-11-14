import { M as MotionComponent, _ as __nuxt_component_1 } from './server.mjs';
import { useSSRContext, mergeProps, withCtx, createTextVNode, createVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_Motion = MotionComponent;
  const _component_NuxtLink = __nuxt_component_1;
  _push(`<main${ssrRenderAttrs(mergeProps({ class: "flex min-h-screen items-center justify-center bg-royal px-6" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Motion, {
    class: "w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-card",
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h1 class="font-display text-3xl text-ink"${_scopeId}>Thank You</h1><p class="mt-4 text-sm leading-relaxed text-ink/70"${_scopeId}> ご回答ありがとうございました。お会いできる日を心より楽しみにしています。 </p>`);
        _push2(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "btn mt-8"
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`トップへ戻る`);
            } else {
              return [
                createTextVNode("トップへ戻る")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode("h1", { class: "font-display text-3xl text-ink" }, "Thank You"),
          createVNode("p", { class: "mt-4 text-sm leading-relaxed text-ink/70" }, " ご回答ありがとうございました。お会いできる日を心より楽しみにしています。 "),
          createVNode(_component_NuxtLink, {
            to: "/",
            class: "btn mt-8"
          }, {
            default: withCtx(() => [
              createTextVNode("トップへ戻る")
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</main>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/thanks.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const thanks = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { thanks as default };
//# sourceMappingURL=thanks-DTQeAYiC.mjs.map
