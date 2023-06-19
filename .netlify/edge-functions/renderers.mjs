import { s as server_default$1 } from './chunks/astro.80725e1e.mjs';
import { r as renderToString, s as ssr, c as createComponent } from './chunks/pages/controller.astro.8e4a0438.mjs';
/* empty css                                      */
const contexts = /* @__PURE__ */ new WeakMap();
function getContext(result) {
  if (contexts.has(result)) {
    return contexts.get(result);
  }
  let ctx = {
    c: 0,
    get id() {
      return "s" + this.c.toString();
    }
  };
  contexts.set(result, ctx);
  return ctx;
}
function incrementId(ctx) {
  let id = ctx.id;
  ctx.c++;
  return id;
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function check(Component, props, children) {
  if (typeof Component !== "function")
    return false;
  const { html } = renderToStaticMarkup.call(this, Component, props, children);
  return typeof html === "string";
}
function renderToStaticMarkup(Component, props, { default: children, ...slotted }, metadata) {
  const renderId = (metadata == null ? void 0 : metadata.hydrate) ? incrementId(getContext(this.result)) : "";
  const needsHydrate = (metadata == null ? void 0 : metadata.astroStaticSlot) ? !!metadata.hydrate : true;
  const tagName = needsHydrate ? "astro-slot" : "astro-static-slot";
  const html = renderToString(
    () => {
      const slots = {};
      for (const [key, value] of Object.entries(slotted)) {
        const name = slotName(key);
        slots[name] = ssr(`<${tagName} name="${name}">${value}</${tagName}>`);
      }
      const newProps = {
        ...props,
        ...slots,
        // In Solid SSR mode, `ssr` creates the expected structure for `children`.
        children: children != null ? ssr(`<${tagName}>${children}</${tagName}>`) : children
      };
      return createComponent(Component, newProps);
    },
    {
      renderId
    }
  );
  return {
    attrs: {
      "data-solid-render-id": renderId
    },
    html
  };
}
var server_default = {
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true
};

const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default$1 }),Object.assign({"name":"@astrojs/solid-js","clientEntrypoint":"@astrojs/solid-js/client.js","serverEntrypoint":"@astrojs/solid-js/server.js","jsxImportSource":"solid-js"}, { ssr: server_default }),];

export { renderers };
