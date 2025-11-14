import { defineComponent, defineAsyncComponent, onErrorCaptured, createVNode } from 'vue';
import { i as injectHead, c as createError } from './server.mjs';
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
import 'vue/server-renderer';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'framesync';
import 'popmotion';
import 'style-value-types';

const islandComponents = {
  "BrandedLogoDVue": defineAsyncComponent(() => import(
    './BrandedLogo.d.vue-BTDBFo2Y.mjs'
    /* webpackChunkName: "components/branded-logo-d-vue-server" */
  ).then((c) => c.default || c)),
  "BrandedLogo": defineAsyncComponent(() => import(
    './BrandedLogo-BpiHy7xN.mjs'
    /* webpackChunkName: "components/branded-logo-server" */
  ).then((c) => c.default || c)),
  "FrameDVue": defineAsyncComponent(() => import(
    './Frame.d.vue-BTDBFo2Y.mjs'
    /* webpackChunkName: "components/frame-d-vue-server" */
  ).then((c) => c.default || c)),
  "Frame": defineAsyncComponent(() => import(
    './Frame-BBwurjfG.mjs'
    /* webpackChunkName: "components/frame-server" */
  ).then((c) => c.default || c)),
  "NuxtDVue": defineAsyncComponent(() => import(
    './Nuxt.d.vue-BTDBFo2Y.mjs'
    /* webpackChunkName: "components/nuxt-d-vue-server" */
  ).then((c) => c.default || c)),
  "Nuxt": defineAsyncComponent(() => import(
    './Nuxt-vcOeLEtt.mjs'
    /* webpackChunkName: "components/nuxt-server" */
  ).then((c) => c.default || c)),
  "NuxtSeoDVue": defineAsyncComponent(() => import(
    './NuxtSeo.d.vue-BTDBFo2Y.mjs'
    /* webpackChunkName: "components/nuxt-seo-d-vue-server" */
  ).then((c) => c.default || c)),
  "NuxtSeo": defineAsyncComponent(() => import(
    './NuxtSeo-CwNjVM6C.mjs'
    /* webpackChunkName: "components/nuxt-seo-server" */
  ).then((c) => c.default || c)),
  "PergelDVue": defineAsyncComponent(() => import(
    './Pergel.d.vue-BTDBFo2Y.mjs'
    /* webpackChunkName: "components/pergel-d-vue-server" */
  ).then((c) => c.default || c)),
  "Pergel": defineAsyncComponent(() => import(
    './Pergel-qbNC3qbr.mjs'
    /* webpackChunkName: "components/pergel-server" */
  ).then((c) => c.default || c)),
  "SimpleBlogDVue": defineAsyncComponent(() => import(
    './SimpleBlog.d.vue-BTDBFo2Y.mjs'
    /* webpackChunkName: "components/simple-blog-d-vue-server" */
  ).then((c) => c.default || c)),
  "SimpleBlog": defineAsyncComponent(() => import(
    './SimpleBlog-By_TVVJm.mjs'
    /* webpackChunkName: "components/simple-blog-server" */
  ).then((c) => c.default || c)),
  "UnJsDVue": defineAsyncComponent(() => import(
    './UnJs.d.vue-BTDBFo2Y.mjs'
    /* webpackChunkName: "components/un-js-d-vue-server" */
  ).then((c) => c.default || c)),
  "UnJs": defineAsyncComponent(() => import(
    './UnJs-CTBIX28O.mjs'
    /* webpackChunkName: "components/un-js-server" */
  ).then((c) => c.default || c)),
  "WaveDVue": defineAsyncComponent(() => import(
    './Wave.d.vue-BTDBFo2Y.mjs'
    /* webpackChunkName: "components/wave-d-vue-server" */
  ).then((c) => c.default || c)),
  "Wave": defineAsyncComponent(() => import(
    './Wave-CfEx5_bE.mjs'
    /* webpackChunkName: "components/wave-server" */
  ).then((c) => c.default || c)),
  "WithEmojiDVue": defineAsyncComponent(() => import(
    './WithEmoji.d.vue-BTDBFo2Y.mjs'
    /* webpackChunkName: "components/with-emoji-d-vue-server" */
  ).then((c) => c.default || c)),
  "WithEmoji": defineAsyncComponent(() => import(
    './WithEmoji-DlhpMpzm.mjs'
    /* webpackChunkName: "components/with-emoji-server" */
  ).then((c) => c.default || c))
};
const islandRenderer = defineComponent({
  name: "IslandRenderer",
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const head = injectHead();
    head.entries.clear();
    const component = islandComponents[props.context.name];
    if (!component) {
      throw createError({
        statusCode: 404,
        statusMessage: `Island component not found: ${props.context.name}`
      });
    }
    onErrorCaptured((e) => {
      console.log(e);
    });
    return () => createVNode(component || "span", { ...props.context.props, "data-island-uid": "" });
  }
});

export { islandRenderer as default };
//# sourceMappingURL=island-renderer-GF-ro23g.mjs.map
