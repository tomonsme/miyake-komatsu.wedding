import { e as useAppConfig, b as useRuntimeConfig, u as useHead, M as MotionComponent, _ as __nuxt_component_1, f as _sfc_main$4, a as useNuxtApp } from './server.mjs';
import { defineComponent, ref, computed, reactive, watch, nextTick, mergeProps, unref, withCtx, createTextVNode, createBlock, openBlock, createVNode, toDisplayString, useAttrs, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderStyle, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderSlot } from 'vue/server-renderer';
import { Y as defu, af as withLeadingSlash, y as hasProtocol, z as joinURL, P as parseURL, ao as encodeQueryItem } from '../nitro/nitro.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import 'vue-router';
import '@unhead/addons';
import 'unhead/plugins';
import '@unhead/schema-org/vue';
import 'devalue';
import 'framesync';
import 'popmotion';
import 'style-value-types';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
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
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';

async function imageMeta(_ctx, url) {
  const meta = await _imageMeta(url).catch((err) => {
    console.error("Failed to get image meta for " + url, err + "");
    return {
      width: 0,
      height: 0,
      ratio: 0
    };
  });
  return meta;
}
async function _imageMeta(url) {
  {
    const imageMeta2 = await import('image-meta').then((r) => r.imageMeta);
    const data = await fetch(url).then((res) => res.buffer());
    const metadata = imageMeta2(data);
    if (!metadata) {
      throw new Error(`No metadata could be extracted from the image \`${url}\`.`);
    }
    const { width, height } = metadata;
    const meta = {
      width,
      height,
      ratio: width && height ? width / height : void 0
    };
    return meta;
  }
}
function createMapper(map) {
  return (key) => {
    return key ? map[key] || key : map.missingValue;
  };
}
function createOperationsGenerator({ formatter, keyMap, joinWith = "/", valueMap } = {}) {
  if (!formatter) {
    formatter = (key, value) => `${key}=${value}`;
  }
  if (keyMap && typeof keyMap !== "function") {
    keyMap = createMapper(keyMap);
  }
  const map = valueMap || {};
  Object.keys(map).forEach((valueKey) => {
    if (typeof map[valueKey] !== "function") {
      map[valueKey] = createMapper(map[valueKey]);
    }
  });
  return (modifiers = {}) => {
    const operations = Object.entries(modifiers).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
      const mapper = map[key];
      if (typeof mapper === "function") {
        value = mapper(modifiers[key]);
      }
      key = typeof keyMap === "function" ? keyMap(key) : key;
      return formatter(key, value);
    });
    return operations.join(joinWith);
  };
}
function parseSize(input = "") {
  if (typeof input === "number") {
    return input;
  }
  if (typeof input === "string") {
    if (input.replace("px", "").match(/^\d+$/g)) {
      return Number.parseInt(input, 10);
    }
  }
}
function parseDensities(input = "") {
  if (input === void 0 || !input.length) {
    return [];
  }
  const densities = /* @__PURE__ */ new Set();
  for (const density of input.split(" ")) {
    const d = Number.parseInt(density.replace("x", ""));
    if (d) {
      densities.add(d);
    }
  }
  return Array.from(densities);
}
function checkDensities(densities) {
  if (densities.length === 0) {
    throw new Error("`densities` must not be empty, configure to `1` to render regular size only (DPR 1.0)");
  }
}
function parseSizes(input) {
  const sizes = {};
  if (typeof input === "string") {
    for (const entry of input.split(/[\s,]+/).filter((e) => e)) {
      const s = entry.split(":");
      if (s.length !== 2) {
        sizes["1px"] = s[0].trim();
      } else {
        sizes[s[0].trim()] = s[1].trim();
      }
    }
  } else {
    Object.assign(sizes, input);
  }
  return sizes;
}
function createImage(globalOptions) {
  const ctx = {
    options: globalOptions
  };
  const getImage2 = (input, options = {}) => {
    const image = resolveImage(ctx, input, options);
    return image;
  };
  const $img = (input, modifiers = {}, options = {}) => {
    return getImage2(input, {
      ...options,
      modifiers: defu(modifiers, options.modifiers || {})
    }).url;
  };
  for (const presetName in globalOptions.presets) {
    $img[presetName] = (source, modifiers, options) => $img(source, modifiers, { ...globalOptions.presets[presetName], ...options });
  }
  $img.options = globalOptions;
  $img.getImage = getImage2;
  $img.getMeta = (input, options) => getMeta(ctx, input, options);
  $img.getSizes = (input, options) => getSizes(ctx, input, options);
  ctx.$img = $img;
  return $img;
}
async function getMeta(ctx, input, options) {
  const image = resolveImage(ctx, input, { ...options });
  if (typeof image.getMeta === "function") {
    return await image.getMeta();
  } else {
    return await imageMeta(ctx, image.url);
  }
}
function resolveImage(ctx, input, options) {
  if (input && typeof input !== "string") {
    throw new TypeError(`input must be a string (received ${typeof input}: ${JSON.stringify(input)})`);
  }
  if (!input || input.startsWith("data:")) {
    return {
      url: input
    };
  }
  const { provider, defaults } = getProvider(ctx, options.provider || ctx.options.provider);
  const preset = getPreset(ctx, options.preset);
  input = hasProtocol(input) ? input : withLeadingSlash(input);
  if (!provider.supportsAlias) {
    for (const base in ctx.options.alias) {
      if (input.startsWith(base)) {
        const alias = ctx.options.alias[base];
        if (alias) {
          input = joinURL(alias, input.slice(base.length));
        }
      }
    }
  }
  if (provider.validateDomains && hasProtocol(input)) {
    const inputHost = parseURL(input).host;
    if (!ctx.options.domains.find((d) => d === inputHost)) {
      return {
        url: input
      };
    }
  }
  const _options = defu(options, preset, defaults);
  _options.modifiers = { ..._options.modifiers };
  const expectedFormat = _options.modifiers.format;
  if (_options.modifiers?.width) {
    _options.modifiers.width = parseSize(_options.modifiers.width);
  }
  if (_options.modifiers?.height) {
    _options.modifiers.height = parseSize(_options.modifiers.height);
  }
  const image = provider.getImage(input, _options, ctx);
  image.format = image.format || expectedFormat || "";
  return image;
}
function getProvider(ctx, name) {
  const provider = ctx.options.providers[name];
  if (!provider) {
    throw new Error("Unknown provider: " + name);
  }
  return provider;
}
function getPreset(ctx, name) {
  if (!name) {
    return {};
  }
  if (!ctx.options.presets[name]) {
    throw new Error("Unknown preset: " + name);
  }
  return ctx.options.presets[name];
}
function getSizes(ctx, input, opts) {
  const width = parseSize(opts.modifiers?.width);
  const height = parseSize(opts.modifiers?.height);
  const sizes = parseSizes(opts.sizes);
  const densities = opts.densities?.trim() ? parseDensities(opts.densities.trim()) : ctx.options.densities;
  checkDensities(densities);
  const hwRatio = width && height ? height / width : 0;
  const sizeVariants = [];
  const srcsetVariants = [];
  if (Object.keys(sizes).length >= 1) {
    for (const key in sizes) {
      const variant = getSizesVariant(key, String(sizes[key]), height, hwRatio, ctx);
      if (variant === void 0) {
        continue;
      }
      sizeVariants.push({
        size: variant.size,
        screenMaxWidth: variant.screenMaxWidth,
        media: `(max-width: ${variant.screenMaxWidth}px)`
      });
      for (const density of densities) {
        srcsetVariants.push({
          width: variant._cWidth * density,
          src: getVariantSrc(ctx, input, opts, variant, density)
        });
      }
    }
    finaliseSizeVariants(sizeVariants);
  } else {
    for (const density of densities) {
      const key = Object.keys(sizes)[0];
      let variant = key ? getSizesVariant(key, String(sizes[key]), height, hwRatio, ctx) : void 0;
      if (variant === void 0) {
        variant = {
          size: "",
          screenMaxWidth: 0,
          _cWidth: opts.modifiers?.width,
          _cHeight: opts.modifiers?.height
        };
      }
      srcsetVariants.push({
        width: density,
        src: getVariantSrc(ctx, input, opts, variant, density)
      });
    }
  }
  finaliseSrcsetVariants(srcsetVariants);
  const defaultVariant = srcsetVariants[srcsetVariants.length - 1];
  const sizesVal = sizeVariants.length ? sizeVariants.map((v) => `${v.media ? v.media + " " : ""}${v.size}`).join(", ") : void 0;
  const suffix = sizesVal ? "w" : "x";
  const srcsetVal = srcsetVariants.map((v) => `${v.src} ${v.width}${suffix}`).join(", ");
  return {
    sizes: sizesVal,
    srcset: srcsetVal,
    src: defaultVariant?.src
  };
}
function getSizesVariant(key, size, height, hwRatio, ctx) {
  const screenMaxWidth = ctx.options.screens && ctx.options.screens[key] || Number.parseInt(key);
  const isFluid = size.endsWith("vw");
  if (!isFluid && /^\d+$/.test(size)) {
    size = size + "px";
  }
  if (!isFluid && !size.endsWith("px")) {
    return void 0;
  }
  let _cWidth = Number.parseInt(size);
  if (!screenMaxWidth || !_cWidth) {
    return void 0;
  }
  if (isFluid) {
    _cWidth = Math.round(_cWidth / 100 * screenMaxWidth);
  }
  const _cHeight = hwRatio ? Math.round(_cWidth * hwRatio) : height;
  return {
    size,
    screenMaxWidth,
    _cWidth,
    _cHeight
  };
}
function getVariantSrc(ctx, input, opts, variant, density) {
  return ctx.$img(
    input,
    {
      ...opts.modifiers,
      width: variant._cWidth ? variant._cWidth * density : void 0,
      height: variant._cHeight ? variant._cHeight * density : void 0
    },
    opts
  );
}
function finaliseSizeVariants(sizeVariants) {
  sizeVariants.sort((v1, v2) => v1.screenMaxWidth - v2.screenMaxWidth);
  let previousMedia = null;
  for (let i = sizeVariants.length - 1; i >= 0; i--) {
    const sizeVariant = sizeVariants[i];
    if (sizeVariant.media === previousMedia) {
      sizeVariants.splice(i, 1);
    }
    previousMedia = sizeVariant.media;
  }
  for (let i = 0; i < sizeVariants.length; i++) {
    sizeVariants[i].media = sizeVariants[i + 1]?.media || "";
  }
}
function finaliseSrcsetVariants(srcsetVariants) {
  srcsetVariants.sort((v1, v2) => v1.width - v2.width);
  let previousWidth = null;
  for (let i = srcsetVariants.length - 1; i >= 0; i--) {
    const sizeVariant = srcsetVariants[i];
    if (sizeVariant.width === previousWidth) {
      srcsetVariants.splice(i, 1);
    }
    previousWidth = sizeVariant.width;
  }
}
const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: "w",
    height: "h",
    format: "fm",
    quality: "q",
    position: "position",
    fit: "fit"
  },
  valueMap: {
    fit: {
      fill: "fill",
      cover: "cover",
      contain: "contain"
    },
    format: {
      avif: "avif",
      gif: "gif",
      jpg: "jpg",
      jpeg: "jpg",
      png: "png",
      webp: "webp"
    },
    position: {
      top: "top",
      right: "right",
      bottom: "bottom",
      left: "left",
      center: "center"
    }
  },
  joinWith: "&",
  formatter: (key, value) => encodeQueryItem(key, value)
});
const getImage = (src, { modifiers = {}, baseURL } = {}) => {
  const mods = { ...modifiers };
  mods.url = src;
  if (modifiers.width) {
    mods.width = modifiers.width.toString();
  }
  if (modifiers.height) {
    mods.height = modifiers.height.toString();
  }
  const operations = operationsGenerator(mods);
  return {
    url: `${baseURL || "/.netlify/images"}?${operations}`
  };
};
const netlifyRuntime$uPK4F8SdHwOLNbCf_45Hisr_45IQOHF83om1Pbl6niygFk4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getImage,
  operationsGenerator
}, Symbol.toStringTag, { value: "Module" }));
const imageOptions = {
  ...{
    "screens": {
      "xs": 320,
      "sm": 640,
      "md": 768,
      "lg": 1024,
      "xl": 1280,
      "xxl": 1536,
      "2xl": 1536
    },
    "presets": {
      "hero": {
        "modifiers": {
          "fit": "cover",
          "format": "jpg",
          "quality": 80
        }
      },
      "gallery": {
        "modifiers": {
          "fit": "cover",
          "format": "webp",
          "quality": 70
        }
      }
    },
    "provider": "netlify",
    "domains": [],
    "alias": {},
    "densities": [
      1,
      2
    ],
    "format": [
      "webp"
    ]
  },
  providers: {
    ["netlify"]: { provider: netlifyRuntime$uPK4F8SdHwOLNbCf_45Hisr_45IQOHF83om1Pbl6niygFk4, defaults: {} }
  }
};
const useImage = (event) => {
  const config = useRuntimeConfig();
  const nuxtApp = useNuxtApp();
  return nuxtApp.$img || nuxtApp._img || (nuxtApp._img = createImage({
    ...imageOptions,
    event: nuxtApp.ssrContext?.event,
    nuxt: {
      baseURL: config.app.baseURL
    },
    runtimeConfig: config
  }));
};
const baseImageProps = {
  // input source
  src: { type: String, required: false },
  // modifiers
  format: { type: String, required: false },
  quality: { type: [Number, String], required: false },
  background: { type: String, required: false },
  fit: { type: String, required: false },
  modifiers: { type: Object, required: false },
  // options
  preset: { type: String, required: false },
  provider: { type: String, required: false },
  sizes: { type: [Object, String], required: false },
  densities: { type: String, required: false },
  preload: {
    type: [Boolean, Object],
    required: false
  },
  // <img> attributes
  width: { type: [String, Number], required: false },
  height: { type: [String, Number], required: false },
  alt: { type: String, required: false },
  referrerpolicy: { type: String, required: false },
  usemap: { type: String, required: false },
  longdesc: { type: String, required: false },
  ismap: { type: Boolean, required: false },
  loading: {
    type: String,
    required: false,
    validator: (val) => ["lazy", "eager"].includes(val)
  },
  crossorigin: {
    type: [Boolean, String],
    required: false,
    validator: (val) => ["anonymous", "use-credentials", "", true, false].includes(val)
  },
  decoding: {
    type: String,
    required: false,
    validator: (val) => ["async", "auto", "sync"].includes(val)
  },
  // csp
  nonce: { type: [String], required: false }
};
const useBaseImage = (props) => {
  const options = computed(() => {
    return {
      provider: props.provider,
      preset: props.preset
    };
  });
  const attrs = computed(() => {
    return {
      width: parseSize(props.width),
      height: parseSize(props.height),
      alt: props.alt,
      referrerpolicy: props.referrerpolicy,
      usemap: props.usemap,
      longdesc: props.longdesc,
      ismap: props.ismap,
      crossorigin: props.crossorigin === true ? "anonymous" : props.crossorigin || void 0,
      loading: props.loading,
      decoding: props.decoding,
      nonce: props.nonce
    };
  });
  const $img = useImage();
  const modifiers = computed(() => {
    return {
      ...props.modifiers,
      width: parseSize(props.width),
      height: parseSize(props.height),
      format: props.format,
      quality: props.quality || $img.options.quality,
      background: props.background,
      fit: props.fit
    };
  });
  return {
    options,
    attrs,
    modifiers
  };
};
const imgProps = {
  ...baseImageProps,
  placeholder: { type: [Boolean, String, Number, Array], required: false },
  placeholderClass: { type: String, required: false },
  custom: { type: Boolean, required: false }
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "NuxtImg",
  __ssrInlineRender: true,
  props: imgProps,
  emits: ["load", "error"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const attrs = useAttrs();
    const isServer = true;
    const $img = useImage();
    const _base = useBaseImage(props);
    const placeholderLoaded = ref(false);
    const imgEl = ref();
    const sizes = computed(() => $img.getSizes(props.src, {
      ..._base.options.value,
      sizes: props.sizes,
      densities: props.densities,
      modifiers: {
        ..._base.modifiers.value,
        width: parseSize(props.width),
        height: parseSize(props.height)
      }
    }));
    const imgAttrs = computed(() => {
      const attrs2 = { ..._base.attrs.value, "data-nuxt-img": "" };
      if (!props.placeholder || placeholderLoaded.value) {
        attrs2.sizes = sizes.value.sizes;
        attrs2.srcset = sizes.value.srcset;
      }
      return attrs2;
    });
    const placeholder = computed(() => {
      let placeholder2 = props.placeholder;
      if (placeholder2 === "") {
        placeholder2 = true;
      }
      if (!placeholder2 || placeholderLoaded.value) {
        return false;
      }
      if (typeof placeholder2 === "string") {
        return placeholder2;
      }
      const size = Array.isArray(placeholder2) ? placeholder2 : typeof placeholder2 === "number" ? [placeholder2, placeholder2] : [10, 10];
      return $img(props.src, {
        ..._base.modifiers.value,
        width: size[0],
        height: size[1],
        quality: size[2] || 50,
        blur: size[3] || 3
      }, _base.options.value);
    });
    const mainSrc = computed(
      () => props.sizes ? sizes.value.src : $img(props.src, _base.modifiers.value, _base.options.value)
    );
    const src = computed(() => placeholder.value ? placeholder.value : mainSrc.value);
    if (props.preload) {
      const isResponsive = Object.values(sizes.value).every((v) => v);
      useHead({
        link: [{
          rel: "preload",
          as: "image",
          nonce: props.nonce,
          ...!isResponsive ? { href: src.value } : {
            href: sizes.value.src,
            imagesizes: sizes.value.sizes,
            imagesrcset: sizes.value.srcset
          },
          ...typeof props.preload !== "boolean" && props.preload.fetchPriority ? { fetchpriority: props.preload.fetchPriority } : {}
        }]
      });
    }
    const nuxtApp = useNuxtApp();
    nuxtApp.isHydrating;
    return (_ctx, _push, _parent, _attrs) => {
      if (!_ctx.custom) {
        _push(`<img${ssrRenderAttrs(mergeProps({
          ref_key: "imgEl",
          ref: imgEl,
          class: placeholder.value && !placeholderLoaded.value ? _ctx.placeholderClass : void 0
        }, {
          ...unref(isServer) ? { onerror: "this.setAttribute('data-error', 1)" } : {},
          ...imgAttrs.value,
          ...unref(attrs)
        }, { src: src.value }, _attrs))}>`);
      } else {
        ssrRenderSlot(_ctx.$slots, "default", {
          ...unref(isServer) ? { onerror: "this.setAttribute('data-error', 1)" } : {},
          imgAttrs: {
            ...imgAttrs.value,
            ...unref(attrs)
          },
          isLoaded: placeholderLoaded.value,
          src: src.value
        }, null, _push, _parent);
      }
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$2, { __name: "NuxtImg" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "HeroSlider",
  __ssrInlineRender: true,
  props: {
    images: { default: () => ["/hero.jpg"] },
    interval: { default: 4e3 },
    defaultPosition: { default: "50% 30%" },
    fillMode: { default: "solid" }
  },
  setup(__props) {
    const $img = useImage();
    const props = __props;
    const defaultPosition = computed(() => props.defaultPosition);
    const slides = computed(() => props.images.map((s) => typeof s === "string" ? { src: s } : s));
    const current = ref(0);
    const fillStyle = computed(() => {
      if (props.fillMode === "blur" && slides.value[current.value]) {
        const src = slides.value[current.value].src;
        const resolved = $img(src, { format: "jpg", fit: "cover", quality: 60 });
        return {
          backgroundImage: `url('${resolved || src}')`,
          backgroundSize: "cover",
          backgroundPosition: slides.value[current.value].position || defaultPosition.value,
          filter: "blur(22px) saturate(115%)",
          transform: "scale(1.08)"
        };
      }
      return { backgroundColor: "rgb(15 26 44)" };
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "absolute inset-0" }, _attrs))} data-v-12c2803c><div class="absolute inset-0 -z-10 hidden md:block" style="${ssrRenderStyle(unref(fillStyle))}" aria-hidden="true" data-v-12c2803c></div><div${ssrRenderAttrs({
        name: "fade",
        class: "relative h-full w-full"
      })} data-v-12c2803c>`);
      ssrRenderList(unref(slides), (slide, i) => {
        _push(ssrRenderComponent(_component_NuxtImg, {
          style: [
            i === unref(current) ? null : { display: "none" },
            { objectPosition: slide.position || unref(defaultPosition) }
          ],
          key: i + "-" + unref(current),
          src: slide.src,
          class: "absolute inset-0 h-full w-full object-cover md:object-contain",
          sizes: "(max-width: 768px) 100vw, 1400px",
          alt: "",
          loading: i === 0 ? "eager" : "lazy",
          fetchpriority: i === 0 ? "high" : "auto",
          decoding: "async",
          format: "jpg",
          quality: 80
        }, null, _parent));
      });
      _push(`</div><div class="absolute inset-0" aria-hidden="true" style="${ssrRenderStyle({ "background": "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.55) 65%, rgba(0,0,0,.65) 100%)" })}" data-v-12c2803c></div><div class="pointer-events-none absolute inset-0" aria-hidden="true" style="${ssrRenderStyle({ "background": "radial-gradient(120% 80% at 50% 20%, rgba(0,0,0,0) 0%, rgba(0,0,0,.2) 70%, rgba(0,0,0,.35) 100%)" })}" data-v-12c2803c></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../components/HeroSlider.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const HeroSlider = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-12c2803c"]]);
const DEFAULT_VENUE = "ザ・リッツ・カールトン大阪";
const DEFAULT_ADDR = "大阪府大阪市北区梅田2-5-25";
const DEFAULT_PHONE = "06-6343-7000";
const DEFAULT_URL = "https://modules.marriott.com/wedding-fair/jp/osarz-the-ritz-carlton-osaka";
const DEFAULT_MAP = "https://www.google.com/maps?hl=ja&q=大阪府大阪市北区梅田2-5-25&z=16&output=embed";
const DEFAULT_EVENT_DATE = "2026-02-07";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const cfg = useAppConfig();
    const invitation = cfg.invitation ?? {};
    const couple = invitation.couple && invitation.couple.trim() ? invitation.couple : "Tomoya & Mihono";
    const venue = invitation.venueName || DEFAULT_VENUE;
    const venuePhoneRaw = invitation.venuePhone;
    const venuePhoneDisplay = venuePhoneRaw && venuePhoneRaw !== "—" ? venuePhoneRaw : DEFAULT_PHONE;
    invitation.venueUrl || DEFAULT_URL;
    const venueAddress = invitation.venueAddress || DEFAULT_ADDR;
    const googleMapUrl = invitation.googleMapUrl || DEFAULT_MAP;
    const venueLat = Number(invitation.venueLat) || NaN;
    const venueLng = Number(invitation.venueLng) || NaN;
    invitation.headerCrestUrl || "/favicon.png";
    const monogramUrl = invitation.monogramUrl || "";
    function withBust(u) {
      if (!u) return u;
      const sep = u.includes("?") ? "&" : "?";
      const v = "20251004";
      return `${u}${sep}v=${v}`;
    }
    const groomPhotoUrl = withBust(invitation.groomPhotoUrl || "/groom.JPG");
    const bridePhotoUrl = withBust(invitation.bridePhotoUrl || "/bride.JPG");
    const countdownBg = invitation.countdownBgUrl || "/countdown1.jpg";
    const welcomeOverlayUrl = invitation.welcomeOverlayUrl || "/welcome-overlay.png";
    function extractPlaceFromGoogleUrl(u) {
      try {
        if (!u) ;
        const url = new URL(u);
        const q = url.searchParams.get("query") || url.searchParams.get("q") || "";
        if (q && !/^\d+\.\d+,\d+\.\d+$/.test(q)) return decodeURIComponent(q);
      } catch {
      }
      return "";
    }
    const placeDisplay = (() => {
      const name = invitation.venueName || "";
      const looksAddress = /^〒/.test(name) || /丁目/.test(name);
      if (looksAddress) return extractPlaceFromGoogleUrl(googleMapUrl) || DEFAULT_VENUE;
      return name || DEFAULT_VENUE;
    })();
    function buildPlaceUrl(name, addr, lat, lng) {
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      }
      const q = encodeURIComponent([name, addr].filter(Boolean).join(" ").trim());
      if (!q) return "";
      return `https://www.google.com/maps/search/?api=1&query=${q}`;
    }
    function buildEmbedUrlFrom(placeUrl, fallbackName, fallbackAddr, lat, lng) {
      try {
        const u = new URL(placeUrl);
        const q = u.searchParams.get("query") || u.searchParams.get("q") || "";
        if (q) return `https://www.google.com/maps?q=${encodeURIComponent(q)}&hl=ja&z=16&output=embed`;
      } catch {
      }
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return `https://www.google.com/maps?q=${lat},${lng}&hl=ja&z=16&output=embed`;
      }
      const q2 = encodeURIComponent([fallbackName, fallbackAddr].filter(Boolean).join(" ").trim());
      if (!q2) return "";
      return `https://www.google.com/maps?q=${q2}&hl=ja&z=16&output=embed`;
    }
    const mapPlaceUrl = (() => {
      {
        try {
          const u = new URL(googleMapUrl);
          const q = u.searchParams.get("query") || u.searchParams.get("q") || "";
          const ll = u.searchParams.get("ll") || "";
          if (q) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
          if (ll && /,/.test(ll)) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ll)}`;
        } catch {
        }
      }
      return buildPlaceUrl(venue, venueAddress, venueLat, venueLng);
    })();
    const mapEmbedUrl = (() => {
      if (/\/maps\/embed/.test(googleMapUrl)) return googleMapUrl;
      if (/output=embed/.test(googleMapUrl)) {
        try {
          const u = new URL(googleMapUrl);
          const q = u.searchParams.get("query") || u.searchParams.get("q") || "";
          if (q) return `https://www.google.com/maps?q=${encodeURIComponent(q)}&hl=ja&z=16&output=embed`;
        } catch {
        }
      }
      const place = mapPlaceUrl || buildPlaceUrl(venue, venueAddress, venueLat, venueLng);
      return buildEmbedUrlFrom(place, venue, venueAddress, venueLat, venueLng);
    })();
    const declineConfirm = ref(false);
    const rawMessage = (invitation.message ?? "").trim();
    const messageText = /\{\{.*\}\}/.test(rawMessage) || rawMessage === "" ? `皆様いかがお過ごしでしょうか

このたび 披露宴を執り行うこととなりました。
日頃お世話になっております皆様に私どもの門出をお見守りいただきたく、
ささやかながら小宴を催したく存じます。

ご多用中 誠に恐縮ではございますが、ぜひご出席いただきたくご案内申し上げます。` : rawMessage;
    function fwToAscii(s) {
      return s.replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248));
    }
    const messageDisplay = computed(() => {
      const lines = messageText.split(/\r?\n/);
      while (lines.length) {
        const raw = lines[0].trim();
        const headJ = raw.replace(/\s/g, "");
        const headE = fwToAscii(raw).trim().toLowerCase();
        if (headJ === "" || headJ === "ご挨拶" || headE === "message") {
          lines.shift();
          continue;
        }
        break;
      }
      return lines.join("\n");
    });
    const parts = computed(() => {
      const all = messageDisplay.value.split(/\r?\n/);
      let i = 0;
      while (i < all.length && all[i].trim() === "") i++;
      let startLine = "";
      if (i < all.length && /^(謹啓|拝啓)$/.test(all[i].trim())) {
        startLine = all[i].trim();
        i++;
      }
      let j = all.length - 1;
      while (j >= i && all[j].trim() === "") j--;
      let endIndex = -1;
      for (let k = i; k <= j; k++) {
        if (/^謹白$/.test(all[k].trim())) {
          endIndex = k;
          break;
        }
      }
      const bodyLines = endIndex >= i ? all.slice(i, endIndex) : all.slice(i, j + 1);
      const endLine = endIndex >= i ? "謹白" : "";
      const nameLines = endIndex >= 0 ? all.slice(endIndex + 1).filter((l) => l.trim() !== "") : [];
      return {
        startLine,
        bodyText: bodyLines.join("\n"),
        endLine,
        nameLines
      };
    });
    const bodyParas = computed(() => {
      const raw = parts.value.bodyText || "";
      return raw.split(/\r?\n\s*\r?\n+/).map((p) => p.replace(/\r?\n/g, "").trim()).filter(Boolean);
    });
    const bodyBlocks = computed(() => {
      const blocks = [];
      for (const para of bodyParas.value) {
        const sents = [];
        let cur = "";
        for (const ch of para) {
          cur += ch;
          if (/^[。！？]$/.test(ch)) {
            const t = cur.trim();
            if (t) sents.push(t);
            cur = "";
          }
        }
        const rest = cur.trim();
        if (rest) sents.push(rest);
        for (const s of sents) {
          const t = s.replace(/\s+/g, " ").trim();
          if (t) blocks.push(t);
        }
      }
      return blocks;
    });
    const [derivedGroom, derivedBride] = (() => {
      if (!couple) return ["", ""];
      const parts2 = couple.split(/\s*[&＆と・]\s*/);
      if (parts2.length >= 2) return [parts2[0], parts2[1]];
      return [couple, ""];
    })();
    const groomName = invitation.groomName || derivedGroom || "新郎";
    const brideName = invitation.brideName || derivedBride || "新婦";
    const displayCouple = invitation.couple && invitation.couple.trim() ? invitation.couple : `${groomName}${" & " + brideName}`;
    const groomIntro = (invitation.groomIntro || "").trim();
    const brideIntro = (invitation.brideIntro || "").trim();
    const groomMessage = (invitation.groomMessage || "ささやかながら感謝をお伝えする一日にできればと思っています。お時間が許せばぜひご参列ください！").trim();
    const brideMessage = (invitation.brideMessage || "大好きな皆さまと、素敵な時間を過ごせることを楽しみにしております！日々大感謝！").trim();
    const ceremonyTime = invitation.ceremonyTime || "";
    const receptionTime = invitation.receptionTime || "";
    const receptionOpenTime = invitation.receptionOpenTime || "";
    function parseLocalDate(iso) {
      if (!iso) return null;
      const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(iso);
      if (!m) return null;
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      return new Date(y, mo, d);
    }
    const dateLabel = (() => {
      const d = parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE);
      if (!d || Number.isNaN(d.getTime())) return "日付未設定";
      return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short", timeZone: "Asia/Tokyo" }).format(d);
    })();
    const displayDate = computed(() => {
      const d = parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE);
      if (!d || Number.isNaN(d.getTime())) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const wd = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Tokyo" }).format(d).toUpperCase();
      return `${y}.${m}.${day} ${wd}`;
    });
    const displayDateParts = computed(() => {
      const d = parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE);
      if (!d || Number.isNaN(d.getTime())) return { date: "", dow: "" };
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dow = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Tokyo" }).format(d);
      return { date: `${y}.${m}.${day}`, dow: `${dow}.` };
    });
    const rsvpDateHuman = computed(() => {
      const deadlineIso = invitation.rsvpDeadlineIso;
      const make = (d) => {
        if (!d || Number.isNaN(d.getTime())) return "";
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        return `${y}年${m}月${day}日`;
      };
      if (deadlineIso) return make(parseLocalDate(deadlineIso));
      return make(parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE));
    });
    const publicConfig = useRuntimeConfig().public;
    const form = reactive({
      name: "",
      email: "",
      attendance: "",
      dietaryRestrictions: "",
      alcohol: "ok",
      phone: "",
      postalCode: "",
      address1: "",
      address2: "",
      message: ""
    });
    const rsvpStatus = ref("idle");
    const isSubmitting = ref(false);
    const hasValidDate = computed(() => {
      const d = parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE);
      return !!(d && !Number.isNaN(d.getTime()));
    });
    const toDateLabel = computed(() => {
      if (!hasValidDate.value) return "";
      const d = parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}.${m}.${day}`;
    });
    const timeLeft = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    useHead(() => {
      const title = `${displayCouple} | Wedding Invitation`;
      const desc = displayDate.value && venue ? `Join us at ${venue} on ${displayDate.value}.` : "Wedding invitation details.";
      return {
        title,
        meta: [
          { name: "description", content: desc },
          { property: "og:title", content: title },
          { property: "og:description", content: desc }
        ]
      };
    });
    const heroImages = invitation.heroImages && invitation.heroImages.length ? invitation.heroImages : ["/ritz-lounge.JPG", "/ritz-flowers.png", "/ring-bouquet.JPG"];
    const heroSlides = computed(() => {
      const arr = heroImages;
      const focalMap = {
        "/ritz-flowers_1.jpg": "50% 35%",
        "/ritz-flowers.png": "50% 35%",
        "/ring-bouquet_1.jpg": "50% 50%",
        "/ring-bouquet.JPG": "50% 50%",
        "/two.JPG": "50% 38%",
        "/ritz-lounge_1.jpg": "50% 50%",
        "/ritz-lounge.JPG": "50% 50%"
      };
      return arr.map((it) => {
        if (typeof it === "string") {
          const pos2 = focalMap[it] || "50% 50%";
          return { src: it, position: pos2 };
        }
        const key = it.desktop || it.mobile || it.src;
        const pos = focalMap[key] || "50% 50%";
        return { src: key, position: pos };
      });
    });
    watch(() => form.attendance, (v) => {
      if (v !== "declining") declineConfirm.value = false;
      suppressAutosaveToast.value = true;
    });
    const rsvpOpen = ref(false);
    const letterBoxStyle = ref({});
    ref(null);
    const messageScale = ref(1);
    const messageFontPx = ref(15);
    const messageGapPx = ref(20);
    const messageContentStyle = computed(() => {
      return {
        fontSize: messageFontPx.value + "px",
        ["--msg-gap"]: messageGapPx.value + "px",
        transform: `scale(${messageScale.value})`,
        transformOrigin: "top center",
        willChange: "transform"
      };
    });
    function updateMessageFit() {
      return;
    }
    watch(messageDisplay, () => {
      nextTick(() => updateMessageFit());
    });
    function widowSafe(text, min = 5) {
      try {
        const chars = Array.from((text || "").toString());
        if (chars.length <= min) return text;
        const head = chars.slice(0, -min).join("");
        const tail = chars.slice(-min).join("");
        return `${head}<span class="nowrap-chunk">${tail}</span>`;
      } catch {
        return text;
      }
    }
    const placeDisplayBr = computed(() => softBreakPlace(placeDisplay));
    const venueAddressBr = computed(() => softBreakAddress(venueAddress));
    function softBreakPlace(s) {
      const t = (s || "").toString();
      return t.replace(/・/g, "・<wbr>").replace(/\s+/g, " <wbr>");
    }
    function softBreakAddress(s) {
      let t = (s || "").toString();
      t = t.replace(/(〒\d{3}-\d{4})\s*/, "$1<br>");
      t = t.replace(/丁目/g, "丁目<wbr>");
      t = t.replace(/-(?=\d)/g, "<wbr>-");
      t = t.replace(/、/g, "、<wbr>");
      t = t.replace(/\s{2,}/g, " ");
      return t;
    }
    const photoFiles = ref([]);
    ref([]);
    const photoPreviews = ref([]);
    watch(photoFiles, (files) => {
      return;
    });
    const draftStatus = ref("idle");
    const suppressAutosaveToast = ref(true);
    watch(form, () => {
      return;
    }, { deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Motion = MotionComponent;
      const _component_NuxtLink = __nuxt_component_1;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-royal" }, _attrs))}><section class="relative bg-royal text-white snap-start"><div class="relative h-[62svh] sm:h-[66svh] md:h-auto md:aspect-[21/9] max-h-[800px] overflow-hidden grain">`);
      _push(ssrRenderComponent(HeroSlider, {
        images: unref(heroSlides),
        "default-position": "50% 32%",
        interval: 3800,
        "fill-mode": "blur"
      }, null, _parent));
      _push(`<div class="pointer-events-none absolute inset-0 z-30 grid place-items-center p-3 sm:p-4">`);
      if (unref(welcomeOverlayUrl)) {
        _push(`<img${ssrRenderAttr("src", unref(welcomeOverlayUrl))} alt="" class="w-auto max-w-[62%] sm:max-w-[50%] md:max-w-[38%] lg:max-w-[32%] object-contain drop-shadow-[0_8px_28px_rgba(0,0,0,.45)]" style="${ssrRenderStyle({ "filter": "saturate(0.55) brightness(0.9) contrast(0.9)", "opacity": ".82" })}" loading="eager" decoding="async">`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="absolute inset-0 z-10 flex items-end md:items-center">`);
      _push(ssrRenderComponent(_component_Motion, {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8 },
        class: "mx-auto w-full max-w-screen-md px-6 pb-6 md:pb-10 text-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p class="gold-title inline-block text-xs font-semibold uppercase tracking-[0.4em] leading-tight font-display antialiased bg-gradient-to-b from-[#F7EFD8] via-[#E6D6AA] to-[#C8A769] bg-clip-text text-transparent [text-shadow:_0_1px_6px_rgba(0,0,0,.35)]"${_scopeId}>Welcome to our WEDDING Reception</p><h1 class="mt-2 font-display text-3xl sm:text-4xl md:text-5xl"${_scopeId}>${ssrInterpolate(unref(displayCouple))}</h1>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/#message",
              class: "btn-primary btn-lg btn-icon mt-4 inline-block"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` メッセージへ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"${_scopeId2}></path></svg>`);
                } else {
                  return [
                    createTextVNode(" メッセージへ "),
                    (openBlock(), createBlock("svg", {
                      xmlns: "http://www.w3.org/2000/svg",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "1.6"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        d: "M9 5l7 7-7 7"
                      })
                    ]))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("p", { class: "gold-title inline-block text-xs font-semibold uppercase tracking-[0.4em] leading-tight font-display antialiased bg-gradient-to-b from-[#F7EFD8] via-[#E6D6AA] to-[#C8A769] bg-clip-text text-transparent [text-shadow:_0_1px_6px_rgba(0,0,0,.35)]" }, "Welcome to our WEDDING Reception"),
              createVNode("h1", { class: "mt-2 font-display text-3xl sm:text-4xl md:text-5xl" }, toDisplayString(unref(displayCouple)), 1),
              createVNode(_component_NuxtLink, {
                to: "/#message",
                class: "btn-primary btn-lg btn-icon mt-4 inline-block"
              }, {
                default: withCtx(() => [
                  createTextVNode(" メッセージへ "),
                  (openBlock(), createBlock("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "1.6"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      d: "M9 5l7 7-7 7"
                    })
                  ]))
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="scroll-cue" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"></path></svg></div></div><div class="relative z-20 mx-auto w-full max-w-screen-md px-6 pb-12 pt-8 text-center">`);
      if (unref(monogramUrl)) {
        _push(`<div class="mx-auto mb-3 grid place-items-center"><img${ssrRenderAttr("src", unref(monogramUrl))} alt="monogram" class="h-10 w-auto opacity-90" loading="lazy"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="font-display text-3xl md:text-4xl tracking-[0.18em] text-white/95 text-shadow-soft leading-tight flex items-center justify-center"><span>${ssrInterpolate(unref(displayDateParts).date)}</span><span class="ml-2 inline-block" style="${ssrRenderStyle({ "position": "relative", "top": "3px", "font-size": "0.72em", "letter-spacing": "0.12em" })}">${ssrInterpolate(unref(displayDateParts).dow)}</span></p><p class="mt-2 text-3xl md:text-4xl font-display tracking-[0.12em] text-white/90 text-shadow-soft uppercase">${ssrInterpolate(unref(displayCouple))}</p></div></section><section id="message" class="relative scroll-mt-40 md:scroll-mt-28 band-gold snap-start snap-always min-h-[100svh] border-t border-gold/20"><div class="mx-auto h-full w-full max-w-screen-lg grid place-items-center px-2 sm:px-4 py-0"><div class="relative mx-auto w-[94%] sm:w-[92%] max-w-screen-md bg-white/95 p-12 md:p-14 lg:p-16 text-royal shadow-sm" style="${ssrRenderStyle(unref(letterBoxStyle))}"><span class="absolute left-0 right-0 top-0 h-2 bg-gradient-to-b from-white/55 to-transparent" aria-hidden="true"></span><span class="pointer-events-none absolute inset-[18px]" aria-hidden="true" style="${ssrRenderStyle({ "border": "1.5px solid rgba(220,192,142,.88)" })}"></span><span class="pointer-events-none absolute inset-[18px] border border-[#DCC08E]/60" aria-hidden="true" style="${ssrRenderStyle({ "transform": "translate(8px,-8px)" })}"></span><header class="mb-4 md:mb-6 text-center"><h2 class="mt-0 text-2xl md:text-3xl font-display tracking-wide text-gold uppercase foil-text">MESSAGE</h2><div class="my-2 flex items-center justify-center gap-8"><span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span><span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span></div><p class="mt-1 text-xs text-royal/70">ご挨拶</p>`);
      _push(ssrRenderComponent(_sfc_main$4, null, null, _parent));
      _push(`</header><div class="mx-auto mt-4 md:mt-6 mb-4 md:mb-6 max-w-[60ch] sm:max-w-[54ch] md:max-w-[46ch] text-center message-content" style="${ssrRenderStyle(unref(messageContentStyle))}">`);
      if (unref(parts).startLine) {
        _push(`<p class="font-display leading-relaxed tracking-normal text-left text-royal/90 mb-4 md:mb-5">${widowSafe(unref(parts).startLine) ?? ""}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="text-center message-paras"><!--[-->`);
      ssrRenderList(unref(bodyBlocks), (para, i) => {
        _push(`<p class="font-display leading-[2.2] md:leading-[2.7] tracking-normal text-royal/90" style="${ssrRenderStyle({ "text-wrap": "pretty" })}">${widowSafe(para) ?? ""}</p>`);
      });
      _push(`<!--]--></div>`);
      if (unref(parts).endLine) {
        _push(`<p class="font-display leading-relaxed tracking-normal text-right text-royal/90 mt-6 md:mt-7">${widowSafe(unref(parts).endLine) ?? ""}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(parts).nameLines.length) {
        _push(`<div class="mt-3 md:mt-4 text-center text-royal/90"><!--[-->`);
        ssrRenderList(unref(parts).nameLines, (nm, i) => {
          _push(`<p class="font-display leading-relaxed tracking-normal">${widowSafe(nm) ?? ""}</p>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></section><section id="profile" class="mx-auto w-full max-w-screen-md scroll-mt-32 md:scroll-mt-24 px-6 pt-12 pb-20 md:pt-16 md:pb-28 snap-start min-h-[100svh] md:min-h-fit border-t border-gold/20"><header class="mb-6 text-center"><h2 class="mt-0 text-2xl font-display tracking-wide text-gold uppercase foil-text">PROFILE</h2><div class="my-2 flex items-center justify-center gap-8"><span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span><span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span></div><p class="mt-1 text-xs text-white/70">ご紹介</p>`);
      _push(ssrRenderComponent(_sfc_main$4, null, null, _parent));
      _push(`</header><div class="grid gap-6"><div class="luxe-card fade-in-soft"><div class="luxe-card__inner"><div class="flex items-center gap-5 md:gap-8 pl-0">`);
      if (unref(groomPhotoUrl)) {
        _push(`<div class="h-28 w-28 md:h-40 md:w-40 overflow-hidden rounded-full ring-2 ring-champagne/60 shrink-0"><img${ssrRenderAttr("src", unref(groomPhotoUrl))} alt="新郎写真" class="h-full w-full object-cover scale-[1.15] md:scale-[1.25] transition-transform duration-300"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="leading-relaxed"><p class="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">GROOM / 新郎</p><p class="mt-1 text-xl md:text-2xl font-semibold font-serif leading-relaxed text-white/95">${ssrInterpolate(unref(groomName))}</p></div></div>`);
      if (unref(groomIntro)) {
        _push(`<p class="mt-3 text-sm leading-relaxed text-white/90 wrap-nice">${ssrInterpolate(unref(groomIntro))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(groomMessage)) {
        _push(`<p class="mt-3 text-sm leading-relaxed whitespace-pre-line text-white/90 wrap-nice">${ssrInterpolate(unref(groomMessage))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="luxe-card fade-in-soft"><div class="luxe-card__inner"><div class="flex flex-row-reverse items-center gap-5 md:gap-8 pl-0">`);
      if (unref(bridePhotoUrl)) {
        _push(`<div class="h-28 w-28 md:h-40 md:w-40 overflow-hidden rounded-full ring-2 ring-champagne/60 shrink-0"><img${ssrRenderAttr("src", unref(bridePhotoUrl))} alt="新婦写真" class="h-full w-full object-cover object-[50%_35%] scale-150 md:scale-[1.7] transition-transform duration-300"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="leading-relaxed"><p class="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">BRIDE / 新婦</p><p class="mt-1 text-xl md:text-2xl font-semibold font-serif leading-relaxed text-white/95">${ssrInterpolate(unref(brideName))}</p></div></div>`);
      if (unref(brideIntro)) {
        _push(`<p class="mt-3 text-sm leading-relaxed text-white/90 wrap-nice">${ssrInterpolate(unref(brideIntro))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(brideMessage)) {
        _push(`<p class="mt-3 text-sm leading-relaxed whitespace-pre-line text-white/90 wrap-nice">${ssrInterpolate(unref(brideMessage))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></section>`);
      if (unref(hasValidDate)) {
        _push(`<section id="countdown" class="relative scroll-mt-40 md:scroll-mt-28 band-photo snap-start snap-always border-t border-gold/20" style="${ssrRenderStyle({ backgroundImage: `url('${unref(countdownBg)}')` })}"><div class="relative mx-auto w-full max-w-screen-md px-6 py-12"><header class="mb-6 text-center"><h2 class="mt-0 text-2xl md:text-3xl font-display tracking-wide text-gold uppercase foil-text">COUNTDOWN</h2><div class="my-2 flex items-center justify-center gap-8"><span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span><span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span></div><p class="mt-1 text-xs text-white/80">当日まで</p>`);
        _push(ssrRenderComponent(_sfc_main$4, null, null, _parent));
        _push(`</header><div class="grid grid-cols-4 gap-6 md:gap-8"><div class="counter"><div class="counter__inner"><p class="counter__num font-display">${ssrInterpolate(unref(timeLeft).days)}</p><p class="counter__label text-[10px] md:text-xs">Days</p></div></div><div class="counter"><div class="counter__inner"><p class="counter__num font-display">${ssrInterpolate(unref(timeLeft).hours)}</p><p class="counter__label text-[10px] md:text-xs">Hours</p></div></div><div class="counter"><div class="counter__inner"><p class="counter__num font-display">${ssrInterpolate(unref(timeLeft).minutes)}</p><p class="counter__label text-[10px] md:text-xs">Minutes</p></div></div><div class="counter"><div class="counter__inner"><p class="counter__num font-display">${ssrInterpolate(unref(timeLeft).seconds)}</p><p class="counter__label text-[10px] md:text-xs">Seconds</p></div></div></div><p class="mt-4 text-center text-sm text-gold/90 text-glow">to ${ssrInterpolate(unref(toDateLabel))}</p></div></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section id="events" class="mx-auto w-full max-w-screen-md scroll-mt-40 md:scroll-mt-28 px-6 pt-12 pb-20 md:pt-16 md:pb-28 snap-start snap-always border-t border-gold/20"><header class="mb-6 text-center"><h2 class="mt-0 text-2xl font-display tracking-wide text-gold uppercase foil-text">INFORMATION</h2><div class="my-2 flex items-center justify-center gap-8"><span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span><span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span></div><p class="mt-1 text-xs text-white/70">ご案内</p>`);
      _push(ssrRenderComponent(_sfc_main$4, null, null, _parent));
      _push(`</header><div class="grid gap-6"><div class="luxe-card fade-in-soft"><div class="luxe-card__inner"><dl class="mx-auto grid max-w-lg grid-cols-[5.5rem_1fr] md:grid-cols-[6.25rem_1fr] gap-y-1.5 gap-x-3 text-base md:text-lg"><dt class="text-white/70 tracking-wide leading-snug">日　時</dt><dd class="text-white/90 leading-snug nums-unified">${ssrInterpolate(unref(dateLabel))}</dd><div class="col-span-2 h-px bg-[#DCC08E]/25 my-1"></div><dt class="text-white/70 tracking-wide leading-snug">受　付</dt><dd class="text-white/90 leading-snug nums-unified">${ssrInterpolate(unref(receptionOpenTime) || "—")}</dd><div class="col-span-2 h-px bg-[#DCC08E]/25 my-1"></div>`);
      if (unref(ceremonyTime)) {
        _push(`<!--[--><dt class="text-white/70 tracking-wide leading-snug">挙　式</dt><dd class="text-white/90 leading-snug nums-unified">${ssrInterpolate(unref(ceremonyTime))}</dd><div class="col-span-2 h-px bg-[#DCC08E]/25 my-1"></div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`<dt class="text-white/70 tracking-wide leading-snug">披露宴</dt><dd class="text-white/90 leading-snug nums-unified">${ssrInterpolate(unref(receptionTime) || "—")}</dd><div class="col-span-2 h-px bg-[#DCC08E]/25 my-1"></div><dt class="text-white/70 tracking-wide leading-snug">場　所</dt><dd class="text-white/90 leading-snug wrap-nice">${unref(placeDisplayBr) ?? ""}</dd><div class="col-span-2 h-px bg-[#DCC08E]/25 my-1"></div><dt class="text-white/70 tracking-wide leading-snug">住　所</dt><dd class="text-white/90 leading-snug nums-unified wrap-nice">`);
      if (unref(mapPlaceUrl)) {
        _push(`<a${ssrRenderAttr("href", unref(mapPlaceUrl))} target="_blank" rel="noopener" class="underline decoration-[#DCC08E]/40 underline-offset-4 hover:text-[#DCC08E]">${unref(venueAddressBr) ?? ""}</a>`);
      } else {
        _push(`<span>${unref(venueAddressBr) ?? ""}</span>`);
      }
      _push(`</dd><div class="col-span-2 h-px bg-[#DCC08E]/25 my-3"></div><dt class="text-white/70 tracking-wide leading-snug">電話番号</dt><dd class="text-white/90 leading-snug nums-unified">${ssrInterpolate(unref(venuePhoneDisplay))}</dd></dl></div></div><div class="luxe-card fade-in-soft"><div class="luxe-card__inner text-center">`);
      if (unref(mapEmbedUrl)) {
        _push(`<div class="mt-2 mx-auto max-w-md overflow-hidden rounded-xl ring-1 ring-gold/30"><iframe${ssrRenderAttr("src", unref(mapEmbedUrl))} width="100%" height="300" style="${ssrRenderStyle({ "border": "0" })}" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Google Map - 会場"></iframe></div>`);
      } else {
        _push(`<div class="mt-4 mx-auto max-w-md"><p class="text-sm text-white/70">地図URLが未設定です</p></div>`);
      }
      _push(`</div></div><div class="luxe-card fade-in-soft"><div class="luxe-card__inner"><p class="text-sm font-semibold text-white/90">会場までのアクセスについて</p><ul class="mt-2 list-disc space-y-1 pl-6 text-sm text-white/80"><li>JR大阪駅 西改札口より徒歩4分</li><li>大阪メトロ四ツ橋線 西梅田駅より徒歩5分</li><li>阪神電鉄 大阪梅田駅より徒歩5分</li><li><span>JR新大阪駅から 約12分（JR東海道線）</span><span class="block text-xs text-white/65">大阪駅（西改札口）より徒歩4分</span></li></ul><div class="mt-4 border-t border-champagne/50 pt-3"><p class="text-sm font-semibold text-white/90">駐車場のご案内</p><p class="mt-2 text-sm text-white/80">ホテル地下駐車場をご利用ください。</p><p class="mt-1 text-sm text-white/80">優待券をご用意しておりますので、お引き上げの際はクロークスタッフへお申し出ください。</p><ul class="mt-1 pl-5 text-xs text-white/70 list-disc space-y-1"><li>収容台数に限りがございます。</li><li>混雑時は周辺駐車場をご案内する場合がございます。</li></ul></div></div></div></div></section><section id="rsvp" class="mx-auto w-full max-w-screen-md scroll-mt-40 md:scroll-mt-28 px-6 pt-10 pb-8 md:pt-14 md:pb-12 snap-start snap-always border-t border-gold/20"><header class="mb-6 text-center"><h2 class="mt-0 text-2xl font-display tracking-wide text-gold uppercase foil-text">RSVP</h2><div class="my-2 flex items-center justify-center gap-8"><span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span><span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span></div><p class="mt-1 text-xs text-white/70">ご出欠のご回答</p>`);
      _push(ssrRenderComponent(_sfc_main$4, null, null, _parent));
      _push(`</header><div class="panel-navy panel-navy--flat fade-in-soft mx-auto max-w-lg"><div class="panel__inner text-center pt-4 pb-2 md:pt-6 md:pb-3"><p class="text-sm leading-relaxed text-white/90 wrap-nice">${widowSafe("ご多用のところ誠に恐れ入りますが、下記の期日までにご出欠の旨をご登録くださいますようお願い申し上げます。") ?? ""}</p>`);
      if (unref(hasValidDate)) {
        _push(`<p class="mt-2 text-sm leading-relaxed text-white/90 wrap-nice"><span class="text-white/65 tracking-wide">ご回答期限：</span><span class="ml-1 nums-unified text-lg text-gold">${ssrInterpolate(unref(rsvpDateHuman))}</span><span class="ml-1">まで</span></p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="button" class="btn-callout btn-lg btn-icon mt-3" aria-label="ご出欠のご回答フォームを開く"> 招待状に回答する <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg></button></div></div></section>`);
      if (unref(rsvpOpen)) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" tabindex="-1" role="dialog" aria-modal="true"${ssrRenderAttr("aria-labelledby", "rsvp-title")}><div class="absolute inset-0 bg-royal/80 backdrop-blur-sm" aria-hidden="true"></div>`);
        if (unref(draftStatus) === "saved" || unref(draftStatus) === "cleared") {
          _push(`<div class="pointer-events-none fixed inset-0 z-[60] grid place-items-center"><div class="toast-center">${ssrInterpolate(unref(draftStatus) === "cleared" ? "下書きを削除しました（入力はそのままです）" : "下書きを保存しました")}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="relative z-10 w-full max-w-screen-md modal-panel"><div class="letter letter--navy fade-in-soft"><div class="letter__inner"><button type="button" class="pointer-events-auto absolute right-2 top-2 md:right-3 md:top-3 z-10 grid h-11 w-11 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/80" aria-label="閉じる"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg></button><header class="letter__header"><p class="letter__eyebrow">RSVP</p><h2 class="letter__title" id="rsvp-title">ご出欠のご回答</h2><div class="letter__divider"></div></header>`);
        if (unref(publicConfig).rsvpMode === "google" && unref(publicConfig).googleFormEmbedUrl) {
          _push(`<div class="mt-4 overflow-hidden rounded-xl" style="${ssrRenderStyle({ "height": "680px" })}"><iframe class="h-full w-full"${ssrRenderAttr("src", unref(publicConfig).googleFormEmbedUrl)} frameborder="0" marginheight="0" marginwidth="0">読み込んでいます…</iframe></div>`);
        } else {
          _push(`<form class="mt-4 grid gap-6" aria-labelledby="rsvp-title"><p class="text-center text-sm text-white/80">お手数ではございますが　出席情報のご登録をお願い申し上げます</p><div class="mx-auto mb-1 flex max-w-md items-center justify-center gap-3 text-xs text-white/60">`);
          if (unref(draftStatus) === "restored") {
            _push(`<span>下書きを読み込みました</span>`);
          } else if (unref(draftStatus) === "saved") {
            _push(`<span>下書きを保存しました</span>`);
          } else {
            _push(`<span>自動で下書き保存されます</span>`);
          }
          _push(`<button type="button" class="underline decoration-white/30 underline-offset-4 hover:text-white">下書きを削除</button></div><div class="flex items-center justify-center mt-2" role="group" aria-label="出欠選択"><div class="choice-toggle"><button type="button" class="${ssrRenderClass([{ "is-active": unref(form).attendance === "attending" }, "rsvp-choice rsvp-choice--attend h-11 md:h-12 px-7 text-base"])}"${ssrRenderAttr("aria-pressed", unref(form).attendance === "attending")} aria-label="ご出席を選択"><span class="rsvp-choice__label">ご出席</span></button><button type="button" class="${ssrRenderClass([{ "is-active": unref(form).attendance === "declining" }, "rsvp-choice rsvp-choice--decline h-11 md:h-12 px-7 text-base"])}"${ssrRenderAttr("aria-pressed", unref(form).attendance === "declining")} aria-label="ご欠席を選択"><span class="rsvp-choice__label">ご欠席</span></button></div></div>`);
          if (unref(form).attendance === "attending") {
            _push(`<!--[--><div class="grid gap-4 md:grid-cols-2"><label class="field"><span class="field__label">お名前</span><input${ssrRenderAttr("value", unref(form).name)} type="text" class="field__control" required aria-required="true" placeholder="例）山田 太郎"></label><label class="field"><span class="field__label">メールアドレス</span><input${ssrRenderAttr("value", unref(form).email)} type="email" class="field__control" required aria-required="true" placeholder="例）taro@example.com"></label></div><div class="grid gap-4 md:grid-cols-3"><label class="field md:col-span-1"><span class="field__label">郵便番号（任意）</span><input${ssrRenderAttr("value", unref(form).postalCode)} type="text" inputmode="numeric" pattern="[0-9\\-]*" class="field__control" placeholder="例）123-4567"></label><label class="field md:col-span-2"><span class="field__label">ご住所（任意）</span><input${ssrRenderAttr("value", unref(form).address1)} type="text" class="field__control" placeholder="例）大阪府大阪市北区梅田2-5-25"></label></div><label class="field"><span class="field__label">建物名・号室（任意）</span><input${ssrRenderAttr("value", unref(form).address2)} type="text" class="field__control" placeholder="例）○○マンション 101号室"></label><label class="field"><span class="field__label">お飲み物</span><select class="field__control"><option value="ok"${ssrIncludeBooleanAttr(Array.isArray(unref(form).alcohol) ? ssrLooseContain(unref(form).alcohol, "ok") : ssrLooseEqual(unref(form).alcohol, "ok")) ? " selected" : ""}>アルコール可</option><option value="no"${ssrIncludeBooleanAttr(Array.isArray(unref(form).alcohol) ? ssrLooseContain(unref(form).alcohol, "no") : ssrLooseEqual(unref(form).alcohol, "no")) ? " selected" : ""}>アルコール不可</option></select></label><label class="field"><span class="field__label">アレルギー・苦手な食材（任意）</span><textarea rows="2" class="field__control" placeholder="例）甲殻類アレルギー／生魚が苦手 など">${ssrInterpolate(unref(form).dietaryRestrictions)}</textarea></label><div class="grid gap-4 md:grid-cols-2"><label class="field"><span class="field__label">電話番号（任意）</span><input${ssrRenderAttr("value", unref(form).phone)} type="tel" inputmode="tel" class="field__control" placeholder="例）090-1234-5678"></label></div><label class="field"><span class="field__label">メッセージ（任意）</span><textarea rows="3" class="field__control" placeholder="ご要望などございましたらご自由にお書きください">${ssrInterpolate(unref(form).message)}</textarea><span class="field__hint">送信後の変更も承ります。ご遠慮なくお知らせください。</span></label><div class="grid gap-2"><span class="field__label">写真の共有（任意、最大10枚・各10MBまで）</span><div class="flex flex-wrap gap-2"><label class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-champagne/60 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg><span>写真を選択</span><input type="file" accept="image/*" multiple class="hidden"></label></div>`);
            if (unref(photoFiles).length) {
              _push(`<div class="mt-2 flex flex-wrap gap-3"><!--[-->`);
              ssrRenderList(unref(photoFiles), (f, i) => {
                _push(`<div class="relative overflow-hidden rounded-lg border border-champagne/40 bg-white/5"><img${ssrRenderAttr("src", unref(photoPreviews)[i])}${ssrRenderAttr("alt", f.name)} class="h-20 w-20 object-cover"><button type="button" class="absolute right-1 top-1 rounded-full bg-royal/70 p-1 text-white/80 hover:bg-royal/90" aria-label="削除"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
              });
              _push(`<!--]--></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<span class="field__hint">ご提供いただいた写真は、当日のスライド等に使用させていただく場合がございます。</span></div><div class="mt-2 grid gap-2 text-center md:flex md:flex-col md:items-center md:justify-center"><div class="order-2 md:order-2"><p class="text-xs text-white/70">ご返信期日: 披露宴の1ヶ月前までを目安にお願いいたします。</p><p class="sr-only" aria-live="polite">${ssrInterpolate(unref(draftStatus) === "saved" ? "下書きを保存しました" : unref(draftStatus) === "restored" ? "下書きを読み込みました" : unref(draftStatus) === "cleared" ? "下書きを削除しました" : "")}</p></div><div class="order-1 md:order-1 flex w-full justify-center flex-col gap-2 sm:flex-row md:w-auto"><button type="submit" class="btn-gold btn-lg w-full sm:w-auto"${ssrIncludeBooleanAttr(unref(isSubmitting)) ? " disabled" : ""}>${ssrInterpolate(unref(isSubmitting) ? "送信中…" : unref(rsvpStatus) === "ok" ? "変更を再送信" : "送信")}</button></div></div><!--]-->`);
          } else if (unref(form).attendance === "declining") {
            _push(`<div class="mx-auto max-w-sm space-y-4 text-center"><p class="text-sm text-white/85">誤操作防止のため、確認の上で確定してください。</p><label class="inline-flex cursor-pointer items-center justify-center gap-2 text-sm text-white/85"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(declineConfirm)) ? ssrLooseContain(unref(declineConfirm), null) : unref(declineConfirm)) ? " checked" : ""} class="h-4 w-4 rounded border-champagne/60 text-gold focus:ring-gold"><span>ご欠席にて確定します</span></label><div class="flex w-full justify-center flex-col gap-2 sm:flex-row md:w-auto"><button type="submit" class="btn-gold btn-lg w-full sm:w-auto"${ssrIncludeBooleanAttr(!unref(declineConfirm) || unref(isSubmitting)) ? " disabled" : ""}>${ssrInterpolate(unref(isSubmitting) ? "送信中…" : unref(rsvpStatus) === "ok" ? "ご欠席を再送信" : "ご欠席を送信")}</button></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(rsvpStatus) === "ok") {
            _push(`<p class="alert alert-ok" role="status" aria-live="polite">送信しました。ありがとうございました。</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(rsvpStatus) === "error") {
            _push(`<p class="alert alert-error" role="status" aria-live="polite">送信に失敗しました。時間を置いて再度お試しください。</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</form>`);
        }
        _push(`</div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CxzUkh2q.mjs.map
