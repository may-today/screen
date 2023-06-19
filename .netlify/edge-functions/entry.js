globalThis.process = {
	argv: [],
	env: Deno.env.toObject(),
};
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// .netlify/edge-functions/chunks/astro.80725e1e.mjs
function normalizeLF(code) {
  return code.replace(/\r\n|\r(?!\n)|\n/g, "\n");
}
function getErrorDataByCode(code) {
  const entry = Object.entries(AstroErrorData).find((data) => data[1].code === code);
  if (entry) {
    return {
      name: entry[0],
      data: entry[1]
    };
  }
}
function codeFrame(src, loc) {
  if (!loc || loc.line === void 0 || loc.column === void 0) {
    return "";
  }
  const lines = normalizeLF(src).split("\n").map((ln) => ln.replace(/\t/g, "  "));
  const visibleLines = [];
  for (let n = -2; n <= 2; n++) {
    if (lines[loc.line + n])
      visibleLines.push(loc.line + n);
  }
  let gutterWidth = 0;
  for (const lineNo of visibleLines) {
    let w2 = `> ${lineNo}`;
    if (w2.length > gutterWidth)
      gutterWidth = w2.length;
  }
  let output = "";
  for (const lineNo of visibleLines) {
    const isFocusedLine = lineNo === loc.line - 1;
    output += isFocusedLine ? "> " : "  ";
    output += `${lineNo + 1} | ${lines[lineNo]}
`;
    if (isFocusedLine)
      output += `${Array.from({ length: gutterWidth }).join(" ")}  | ${Array.from({
        length: loc.column
      }).join(" ")}^
`;
  }
  return output;
}
function validateArgs(args) {
  if (args.length !== 3)
    return false;
  if (!args[0] || typeof args[0] !== "object")
    return false;
  return true;
}
function baseCreateComponent(cb, moduleId) {
  var _a2;
  const name = ((_a2 = moduleId == null ? void 0 : moduleId.split("/").pop()) == null ? void 0 : _a2.replace(".astro", "")) ?? "";
  const fn = (...args) => {
    if (!validateArgs(args)) {
      throw new AstroError({
        ...AstroErrorData.InvalidComponentArgs,
        message: AstroErrorData.InvalidComponentArgs.message(name)
      });
    }
    return cb(...args);
  };
  Object.defineProperty(fn, "name", { value: name, writable: false });
  fn.isAstroComponentFactory = true;
  fn.moduleId = moduleId;
  return fn;
}
function createComponentWithOptions(opts) {
  const cb = baseCreateComponent(opts.factory, opts.moduleId);
  cb.propagation = opts.propagation;
  return cb;
}
function createComponent(arg1, moduleId) {
  if (typeof arg1 === "function") {
    return baseCreateComponent(arg1, moduleId);
  } else {
    return createComponentWithOptions(arg1);
  }
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    if (typeof importMetaGlobResult === "string") {
      throw new AstroError({
        ...AstroErrorData.AstroGlobUsedOutside,
        message: AstroErrorData.AstroGlobUsedOutside.message(JSON.stringify(importMetaGlobResult))
      });
    }
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new AstroError({
        ...AstroErrorData.AstroGlobNoMatch,
        message: AstroErrorData.AstroGlobNoMatch.message(JSON.stringify(importMetaGlobResult))
      });
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(site) {
  return {
    site: site ? new URL(site) : void 0,
    generator: `Astro v${ASTRO_VERSION}`,
    glob: createAstroGlobFn()
  };
}
function getHandlerFromModule(mod, method) {
  if (mod[method]) {
    return mod[method];
  }
  if (method === "delete" && mod["del"]) {
    return mod["del"];
  }
  if (mod["all"]) {
    return mod["all"];
  }
  return void 0;
}
async function renderEndpoint(mod, context, ssr2) {
  var _a2;
  const { request, params, locals } = context;
  const chosenMethod = (_a2 = request.method) == null ? void 0 : _a2.toLowerCase();
  const handler = getHandlerFromModule(mod, chosenMethod);
  if (!ssr2 && ssr2 === false && chosenMethod && chosenMethod !== "get") {
    console.warn(`
${chosenMethod} requests are not available when building a static site. Update your config to \`output: 'server'\` or \`output: 'hybrid'\` with an \`export const prerender = false\` to handle ${chosenMethod} requests.`);
  }
  if (!handler || typeof handler !== "function") {
    let response = new Response(null, {
      status: 404,
      headers: {
        "X-Astro-Response": "Not-Found"
      }
    });
    return response;
  }
  if (handler.length > 1) {
    console.warn(`
API routes with 2 arguments have been deprecated. Instead they take a single argument in the form of:

export function get({ params, request }) {
	//...
}

Update your code to remove this warning.`);
  }
  const proxy = new Proxy(context, {
    get(target, prop) {
      if (prop in target) {
        return Reflect.get(target, prop);
      } else if (prop in params) {
        console.warn(`
API routes no longer pass params as the first argument. Instead an object containing a params property is provided in the form of:

export function get({ params }) {
	// ...
}

Update your code to remove this warning.`);
        return Reflect.get(params, prop);
      } else {
        return void 0;
      }
    }
  });
  return handler.call(mod, proxy, request);
}
function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}
function isPromise(value) {
  return !!value && typeof value === "object" && typeof value.then === "function";
}
async function* streamAsyncIterator(stream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
function isHTMLString(value) {
  return Object.prototype.toString.call(value) === "[object HTMLString]";
}
function markHTMLBytes(bytes) {
  return new HTMLBytes(bytes);
}
function hasGetReader(obj) {
  return typeof obj.getReader === "function";
}
async function* unescapeChunksAsync(iterable) {
  if (hasGetReader(iterable)) {
    for await (const chunk of streamAsyncIterator(iterable)) {
      yield unescapeHTML(chunk);
    }
  } else {
    for await (const chunk of iterable) {
      yield unescapeHTML(chunk);
    }
  }
}
function* unescapeChunks(iterable) {
  for (const chunk of iterable) {
    yield unescapeHTML(chunk);
  }
}
function unescapeHTML(str) {
  if (!!str && typeof str === "object") {
    if (str instanceof Uint8Array) {
      return markHTMLBytes(str);
    } else if (str instanceof Response && str.body) {
      const body = str.body;
      return unescapeChunksAsync(body);
    } else if (typeof str.then === "function") {
      return Promise.resolve(str).then((value) => {
        return unescapeHTML(value);
      });
    } else if (Symbol.iterator in str) {
      return unescapeChunks(str);
    } else if (Symbol.asyncIterator in str || hasGetReader(str)) {
      return unescapeChunksAsync(str);
    }
  }
  return markHTMLString(str);
}
function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(result, directive) {
  const clientDirectives = result._metadata.clientDirectives;
  const clientDirective = clientDirectives.get(directive);
  if (!clientDirective) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  return clientDirective;
}
function getPrescripts(result, type, directive) {
  switch (type) {
    case "both":
      return `${ISLAND_STYLES}<script>${getDirectiveScriptText(
        result,
        directive
      )};${astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(result, directive)}<\/script>`;
  }
  return "";
}
function defineScriptVars(vars) {
  var _a2;
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `const ${toIdent(key)} = ${(_a2 = JSON.stringify(value)) == null ? void 0 : _a2.replace(
      /<\/script>/g,
      "\\x3C/script>"
    )};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value), shouldEscape);
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toAttributeString(toStyleString(value), shouldEscape)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children: children2 = "" }, shouldEscape = true) {
  const { lang: _2, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children2 = defineScriptVars(defineVars) + "\n" + children2;
    }
  }
  if ((children2 == null || children2 == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children2}</${name}>`;
}
function bufferIterators(iterators) {
  const eagerIterators = iterators.map((it) => new EagerAsyncIterableIterator(it));
  setTimeout(() => {
    eagerIterators.forEach((it) => !it.isStarted() && it.buffer());
  }, 0);
  return eagerIterators;
}
function renderAllHeadContent(result) {
  result._metadata.hasRenderedHead = true;
  const styles = Array.from(result.styles).filter(uniqueElements).map(
    (style) => style.props.rel === "stylesheet" ? renderElement$1("link", style) : renderElement$1("style", style)
  );
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  let content = links.join("\n") + styles.join("\n") + scripts.join("\n");
  if (result.extraHead.length > 0) {
    for (const part of result.extraHead) {
      content += part;
    }
  }
  return markHTMLString(content);
}
function* renderHead(result) {
  yield { type: "head", result };
}
function* maybeRenderHead(result) {
  if (result._metadata.hasRenderedHead) {
    return;
  }
  yield { type: "maybe-head", result, scope: result.scope };
}
function isHeadAndContent(obj) {
  return typeof obj === "object" && !!obj[headAndContentSym];
}
function isRenderTemplateResult(obj) {
  return typeof obj === "object" && !!obj[renderTemplateResultSym];
}
async function* renderAstroTemplateResult(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
function renderTemplate(htmlParts, ...expressions) {
  return new RenderTemplateResult(htmlParts, expressions);
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : obj.isAstroComponentFactory === true;
}
async function renderToString(result, componentFactory, props, children2) {
  const factoryResult = await componentFactory(result, props, children2);
  if (factoryResult instanceof Response) {
    const response = factoryResult;
    throw response;
  }
  let parts = new HTMLParts();
  const templateResult = isHeadAndContent(factoryResult) ? factoryResult.content : factoryResult;
  for await (const chunk of renderAstroTemplateResult(templateResult)) {
    parts.append(chunk, result);
  }
  return parts.toString();
}
function isAPropagatingComponent(result, factory) {
  let hint = factory.propagation || "none";
  if (factory.moduleId && result.componentMetadata.has(factory.moduleId) && hint === "none") {
    hint = result.componentMetadata.get(factory.moduleId).propagation;
  }
  return hint === "in-tree" || hint === "self";
}
function validateComponentProps(props, displayName) {
  if (props != null) {
    for (const prop of Object.keys(props)) {
      if (prop.startsWith("client:")) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
function createAstroComponentInstance(result, displayName, factory, props, slots = {}) {
  validateComponentProps(props, displayName);
  const instance = new AstroComponentInstance(result, props, slots, factory);
  if (isAPropagatingComponent(result, factory) && !result.propagators.has(factory)) {
    result.propagators.set(factory, instance);
  }
  return instance;
}
function isAstroComponentInstance(obj) {
  return typeof obj === "object" && !!obj[astroComponentInstanceSym];
}
async function* renderChild(child) {
  child = await child;
  if (child instanceof SlotString) {
    if (child.instructions) {
      yield* child.instructions;
    }
    yield child;
  } else if (isHTMLString(child)) {
    yield child;
  } else if (Array.isArray(child)) {
    const bufferedIterators = bufferIterators(child.map((c) => renderChild(c)));
    for (const value of bufferedIterators) {
      yield markHTMLString(await value);
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0)
    ;
  else if (isRenderTemplateResult(child)) {
    yield* renderAstroTemplateResult(child);
  } else if (isAstroComponentInstance(child)) {
    yield* child.render();
  } else if (ArrayBuffer.isView(child)) {
    yield child;
  } else if (typeof child === "object" && (Symbol.asyncIterator in child || Symbol.iterator in child)) {
    yield* child;
  } else {
    yield child;
  }
}
function isSlotString(str) {
  return !!str[slotString];
}
async function* renderSlot(result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(typeof slotted === "function" ? slotted(result) : slotted);
    yield* iterator;
  }
  if (fallback && !slotted) {
    yield* renderSlot(result, fallback);
  }
}
async function renderSlotToString(result, slotted, fallback) {
  let content = "";
  let instructions = null;
  let iterator = renderSlot(result, slotted, fallback);
  for await (const chunk of iterator) {
    if (typeof chunk.type === "string") {
      if (instructions === null) {
        instructions = [];
      }
      instructions.push(chunk);
    } else {
      content += chunk;
    }
  }
  return markHTMLString(new SlotString(content, instructions));
}
async function renderSlots(result, slots = {}) {
  let slotInstructions = null;
  let children2 = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlotToString(result, value).then((output) => {
          if (output.instructions) {
            if (slotInstructions === null) {
              slotInstructions = [];
            }
            slotInstructions.push(...output.instructions);
          }
          children2[key] = output;
        })
      )
    );
  }
  return { slotInstructions, children: children2 };
}
function stringifyChunk(result, chunk) {
  if (typeof chunk.type === "string") {
    const instruction = chunk;
    switch (instruction.type) {
      case "directive": {
        const { hydration } = instruction;
        let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
        let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
        let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
        if (prescriptType) {
          let prescripts = getPrescripts(result, prescriptType, hydration.directive);
          return markHTMLString(prescripts);
        } else {
          return "";
        }
      }
      case "head": {
        if (result._metadata.hasRenderedHead) {
          return "";
        }
        return renderAllHeadContent(result);
      }
      case "maybe-head": {
        if (result._metadata.hasRenderedHead || result._metadata.headInTree) {
          return "";
        }
        return renderAllHeadContent(result);
      }
      default: {
        if (chunk instanceof Response) {
          return "";
        }
        throw new Error(`Unknown chunk type: ${chunk.type}`);
      }
    }
  } else {
    if (isSlotString(chunk)) {
      let out = "";
      const c = chunk;
      if (c.instructions) {
        for (const instr of c.instructions) {
          out += stringifyChunk(result, instr);
        }
      }
      out += chunk.toString();
      return out;
    }
    return chunk.toString();
  }
}
function chunkToByteArray(result, chunk) {
  if (chunk instanceof Uint8Array) {
    return chunk;
  }
  let stringified = stringifyChunk(result, chunk);
  return encoder.encode(stringified.toString());
}
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case typeof vnode === "function":
      return vnode;
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  let skip;
  if (vnode.props) {
    if (vnode.props[Skip.symbol]) {
      skip = vnode.props[Skip.symbol];
    } else {
      skip = new Skip(vnode);
    }
  } else {
    skip = new Skip(vnode);
  }
  return renderJSXVNode(result, vnode, skip);
}
async function renderJSXVNode(result, vnode, skip) {
  if (isVNode(vnode)) {
    switch (true) {
      case !vnode.type: {
        throw new Error(`Unable to render ${result._metadata.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
      }
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        const html = markHTMLString(await renderToString(result, vnode.type, props, slots));
        return html;
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots2.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots2[child.props.slot] = [..._slots2[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots2.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skip.increment();
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function") {
        if (skip.haveNoTried() || skip.isCompleted()) {
          useConsoleFilter();
          try {
            const output2 = await vnode.type(vnode.props ?? {});
            let renderResult;
            if (output2 && output2[AstroJSX]) {
              renderResult = await renderJSXVNode(result, output2, skip);
              return renderResult;
            } else if (!output2) {
              renderResult = await renderJSXVNode(result, output2, skip);
              return renderResult;
            }
          } catch (e) {
            if (skip.isCompleted()) {
              throw e;
            }
            skip.increment();
          } finally {
            finishUsingConsoleFilter();
          }
        } else {
          skip.increment();
        }
      }
      const { children: children2 = null, ...props } = vnode.props ?? {};
      const _slots2 = {
        default: []
      };
      extractSlots2(children2);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots2[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots2)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      props[Skip.symbol] = skip;
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponentToIterable(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponentToIterable(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let parts = new HTMLParts();
        for await (const chunk of output) {
          parts.append(chunk, result);
        }
        return markHTMLString(parts.toString());
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children: children2, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children2 == null || children2 == "") && voidElementNames.test(tag) ? `/>` : `>${children2 == null ? "" : await renderJSX(result, prerenderElementChildren(tag, children2))}</${tag}>`
    )}`
  );
}
function prerenderElementChildren(tag, children2) {
  if (typeof children2 === "string" && (tag === "style" || tag === "script")) {
    return markHTMLString(children2);
  } else {
    return children2;
  }
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error2) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
  originalConsoleError(msg, ...rest);
}
function serializeArray(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = value.map((v) => {
    return convertToSerializedForm(v, metadata, parents);
  });
  parents.delete(value);
  return serialized;
}
function serializeObject(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = Object.fromEntries(
    Object.entries(value).map(([k2, v]) => {
      return [k2, convertToSerializedForm(v, metadata, parents)];
    })
  );
  parents.delete(value);
  return serialized;
}
function convertToSerializedForm(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [
        PROP_TYPE.Map,
        JSON.stringify(serializeArray(Array.from(value), metadata, parents))
      ];
    }
    case "[object Set]": {
      return [
        PROP_TYPE.Set,
        JSON.stringify(serializeArray(Array.from(value), metadata, parents))
      ];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value, metadata, parents))];
    }
    case "[object Uint8Array]": {
      return [PROP_TYPE.Uint8Array, JSON.stringify(Array.from(value))];
    }
    case "[object Uint16Array]": {
      return [PROP_TYPE.Uint16Array, JSON.stringify(Array.from(value))];
    }
    case "[object Uint32Array]": {
      return [PROP_TYPE.Uint32Array, JSON.stringify(Array.from(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value, metadata, parents)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props, metadata) {
  const serialized = JSON.stringify(serializeObject(props, metadata));
  return serialized;
}
function extractDirectives(inputProps, clientDirectives) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!clientDirectives.has(extracted.hydration.directive)) {
            const hydrationMethods = Array.from(clientDirectives.keys()).map((d) => `client:${d}`).join(", ");
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${hydrationMethods}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new AstroError(AstroErrorData.MissingMediaQueryDirective);
          }
          break;
        }
      }
    } else if (key === "class:list") {
      if (value) {
        extracted.props[key.slice(0, -5)] = serializeListValue(value);
      }
    } else {
      extracted.props[key] = value;
    }
  }
  for (const sym of Object.getOwnPropertySymbols(inputProps)) {
    extracted.props[sym] = inputProps[sym];
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = escapeHTML(value);
    }
  }
  island.props["component-url"] = await result.resolve(decodeURI(componentUrl));
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(decodeURI(renderer.clientEntrypoint));
    island.props["props"] = escapeHTML(serializeProps(props, metadata));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  let beforeHydrationUrl = await result.resolve("astro:scripts/before-hydration.js");
  if (beforeHydrationUrl.length) {
    island.props["before-hydration-url"] = beforeHydrationUrl;
  }
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}
function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlotToString(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/solid-js", "@astrojs/vue (jsx)"];
    default:
      return [
        "@astrojs/react",
        "@astrojs/preact",
        "@astrojs/solid-js",
        "@astrojs/vue",
        "@astrojs/svelte",
        "@astrojs/lit"
      ];
  }
}
function isFragmentComponent(Component) {
  return Component === Fragment;
}
function isHTMLComponent(Component) {
  return Component && Component["astro:html"] === true;
}
function removeStaticAstroSlot(html, supportsAstroStaticSlot) {
  const exp = supportsAstroStaticSlot ? ASTRO_STATIC_SLOT_EXP : ASTRO_SLOT_EXP;
  return html.replace(exp, "");
}
async function renderFrameworkComponent(result, displayName, Component, _props, slots = {}) {
  var _a2, _b, _c;
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers: renderers2, clientDirectives } = result._metadata;
  const metadata = {
    astroStaticSlot: true,
    displayName
  };
  const { hydration, isPage, props } = extractDirectives(_props, clientDirectives);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  const validRenderers = renderers2.filter((r) => r.name !== "astro:jsx");
  const { children: children2, slotInstructions } = await renderSlots(result, slots);
  let renderer;
  if (metadata.hydrate !== "only") {
    let isTagged = false;
    try {
      isTagged = Component && Component[Renderer];
    } catch {
    }
    if (isTagged) {
      const rendererName = Component[Renderer];
      renderer = renderers2.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error2;
      for (const r of renderers2) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children2)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error2 ?? (error2 = e);
        }
      }
      if (!renderer && error2) {
        throw error2;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers2.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && validRenderers.length === 1) {
      renderer = validRenderers[0];
    }
    if (!renderer) {
      const extname = (_a2 = metadata.componentUrl) == null ? void 0 : _a2.split(".").pop();
      renderer = renderers2.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new AstroError({
        ...AstroErrorData.NoClientOnlyHint,
        message: AstroErrorData.NoClientOnlyHint.message(metadata.displayName),
        hint: AstroErrorData.NoClientOnlyHint.hint(
          probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")
        )
      });
    } else if (typeof Component !== "string") {
      const matchingRenderers = validRenderers.filter(
        (r) => probableRendererNames.includes(r.name)
      );
      const plural = validRenderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new AstroError({
          ...AstroErrorData.NoMatchingRenderer,
          message: AstroErrorData.NoMatchingRenderer.message(
            metadata.displayName,
            (_b = metadata == null ? void 0 : metadata.componentUrl) == null ? void 0 : _b.split(".").pop(),
            plural,
            validRenderers.length
          ),
          hint: AstroErrorData.NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r) => "`" + r + "`"))
          )
        });
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children2,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlotToString(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children2,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new AstroError({
      ...AstroErrorData.NoClientEntrypoint,
      message: AstroErrorData.NoClientEntrypoint.message(
        displayName,
        metadata.hydrate,
        renderer.name
      )
    });
  }
  if (!html && typeof Component === "string") {
    const Tag = sanitizeElementName(Component);
    const childSlots = Object.values(children2).join("");
    const iterable = renderAstroTemplateResult(
      await renderTemplate`<${Tag}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Tag) ? `/>` : `>${childSlots}</${Tag}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    return async function* () {
      var _a22;
      if (slotInstructions) {
        yield* slotInstructions;
      }
      if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
        yield html;
      } else if (html && html.length > 0) {
        yield markHTMLString(
          removeStaticAstroSlot(html, ((_a22 = renderer == null ? void 0 : renderer.ssr) == null ? void 0 : _a22.supportsAstroStaticSlot) ?? false)
        );
      } else {
        yield "";
      }
    }();
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props,
      metadata
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children2).length > 0) {
      for (const key of Object.keys(children2)) {
        let tagName = ((_c = renderer == null ? void 0 : renderer.ssr) == null ? void 0 : _c.supportsAstroStaticSlot) ? !!metadata.hydrate ? "astro-slot" : "astro-static-slot" : "astro-slot";
        let expectedHTML = key === "default" ? `<${tagName}>` : `<${tagName} name="${key}">`;
        if (!html.includes(expectedHTML)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children2);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children2[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    if (slotInstructions) {
      yield* slotInstructions;
    }
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement$1("astro-island", island, false));
  }
  return renderAll();
}
function sanitizeElementName(tag) {
  const unsafe = /[&<>'"\s]+/g;
  if (!unsafe.test(tag))
    return tag;
  return tag.trim().split(unsafe)[0].trim();
}
async function renderFragmentComponent(result, slots = {}) {
  const children2 = await renderSlotToString(result, slots == null ? void 0 : slots.default);
  if (children2 == null) {
    return children2;
  }
  return markHTMLString(children2);
}
async function renderHTMLComponent(result, Component, _props, slots = {}) {
  const { slotInstructions, children: children2 } = await renderSlots(result, slots);
  const html = Component({ slots: children2 });
  const hydrationHtml = slotInstructions ? slotInstructions.map((instr) => stringifyChunk(result, instr)).join("") : "";
  return markHTMLString(hydrationHtml + html);
}
function renderComponent(result, displayName, Component, props, slots = {}) {
  if (isPromise(Component)) {
    return Promise.resolve(Component).then((Unwrapped) => {
      return renderComponent(result, displayName, Unwrapped, props, slots);
    });
  }
  if (isFragmentComponent(Component)) {
    return renderFragmentComponent(result, slots);
  }
  if (isHTMLComponent(Component)) {
    return renderHTMLComponent(result, Component, props, slots);
  }
  if (isAstroComponentFactory(Component)) {
    return createAstroComponentInstance(result, displayName, Component, props, slots);
  }
  return renderFrameworkComponent(result, displayName, Component, props, slots);
}
function renderComponentToIterable(result, displayName, Component, props, slots = {}) {
  const renderResult = renderComponent(result, displayName, Component, props, slots);
  if (isAstroComponentInstance(renderResult)) {
    return renderResult.render();
  }
  return renderResult;
}
function createResponseClass() {
  var _isStream, _body, _a2;
  StreamingCompatibleResponse = (_a2 = class extends Response {
    constructor(body, init2) {
      let isStream = body instanceof ReadableStream;
      super(isStream ? null : body, init2);
      __privateAdd(this, _isStream, void 0);
      __privateAdd(this, _body, void 0);
      __privateSet(this, _isStream, isStream);
      __privateSet(this, _body, body);
    }
    get body() {
      return __privateGet(this, _body);
    }
    async text() {
      if (__privateGet(this, _isStream) && isNodeJS) {
        let decoder2 = new TextDecoder();
        let body = __privateGet(this, _body);
        let out = "";
        for await (let chunk of streamAsyncIterator(body)) {
          out += decoder2.decode(chunk);
        }
        return out;
      }
      return super.text();
    }
    async arrayBuffer() {
      if (__privateGet(this, _isStream) && isNodeJS) {
        let body = __privateGet(this, _body);
        let chunks = [];
        let len = 0;
        for await (let chunk of streamAsyncIterator(body)) {
          chunks.push(chunk);
          len += chunk.length;
        }
        let ab = new Uint8Array(len);
        let offset = 0;
        for (const chunk of chunks) {
          ab.set(chunk, offset);
          offset += chunk.length;
        }
        return ab;
      }
      return super.arrayBuffer();
    }
  }, _isStream = new WeakMap(), _body = new WeakMap(), _a2);
  return StreamingCompatibleResponse;
}
function nonAstroPageNeedsHeadInjection(pageComponent) {
  return needsHeadRenderingSymbol in pageComponent && !!pageComponent[needsHeadRenderingSymbol];
}
async function iterableToHTMLBytes(result, iterable, isCompressHTML, onDocTypeInjection) {
  const parts = new HTMLParts();
  let i = 0;
  for await (const chunk of iterable) {
    if (isHTMLString(chunk)) {
      if (i === 0) {
        i++;
        if (!/<!doctype html/i.test(String(chunk))) {
          parts.append(`${isCompressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n"}`, result);
          if (onDocTypeInjection) {
            await onDocTypeInjection(parts);
          }
        }
      }
    }
    parts.append(chunk, result);
  }
  return parts.toArrayBuffer();
}
async function bufferHeadContent(result) {
  const iterator = result.propagators.values();
  while (true) {
    const { value, done } = iterator.next();
    if (done) {
      break;
    }
    const returnValue = await value.init(result);
    if (isHeadAndContent(returnValue)) {
      result.extraHead.push(returnValue.head);
    }
  }
}
async function renderPage$1(result, componentFactory, props, children2, streaming, isCompressHTML, route) {
  var _a2, _b;
  if (!isAstroComponentFactory(componentFactory)) {
    result._metadata.headInTree = ((_a2 = result.componentMetadata.get(componentFactory.moduleId)) == null ? void 0 : _a2.containsHead) ?? false;
    const pageProps = { ...props ?? {}, "server:root": true };
    let output;
    let head = "";
    try {
      if (nonAstroPageNeedsHeadInjection(componentFactory)) {
        const parts = new HTMLParts();
        for await (const chunk of maybeRenderHead(result)) {
          parts.append(chunk, result);
        }
        head = parts.toString();
      }
      const renderResult = await renderComponent(
        result,
        componentFactory.name,
        componentFactory,
        pageProps,
        null
      );
      if (isAstroComponentInstance(renderResult)) {
        output = renderResult.render();
      } else {
        output = renderResult;
      }
    } catch (e) {
      if (AstroError.is(e) && !e.loc) {
        e.setLocation({
          file: route == null ? void 0 : route.component
        });
      }
      throw e;
    }
    const bytes = await iterableToHTMLBytes(result, output, isCompressHTML, async (parts) => {
      parts.append(head, result);
    });
    return new Response(bytes, {
      headers: new Headers([
        ["Content-Type", "text/html; charset=utf-8"],
        ["Content-Length", bytes.byteLength.toString()]
      ])
    });
  }
  result._metadata.headInTree = ((_b = result.componentMetadata.get(componentFactory.moduleId)) == null ? void 0 : _b.containsHead) ?? false;
  const factoryReturnValue = await componentFactory(result, props, children2);
  const factoryIsHeadAndContent = isHeadAndContent(factoryReturnValue);
  if (isRenderTemplateResult(factoryReturnValue) || factoryIsHeadAndContent) {
    await bufferHeadContent(result);
    const templateResult = factoryIsHeadAndContent ? factoryReturnValue.content : factoryReturnValue;
    let iterable = renderAstroTemplateResult(templateResult);
    let init2 = result.response;
    let headers = new Headers(init2.headers);
    let body;
    if (streaming) {
      body = new ReadableStream({
        start(controller2) {
          async function read() {
            let i = 0;
            try {
              for await (const chunk of iterable) {
                if (isHTMLString(chunk)) {
                  if (i === 0) {
                    if (!/<!doctype html/i.test(String(chunk))) {
                      controller2.enqueue(
                        encoder.encode(
                          `${isCompressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n"}`
                        )
                      );
                    }
                  }
                }
                if (chunk instanceof Response) {
                  throw new AstroError({
                    ...AstroErrorData.ResponseSentError
                  });
                }
                const bytes = chunkToByteArray(result, chunk);
                controller2.enqueue(bytes);
                i++;
              }
              controller2.close();
            } catch (e) {
              if (AstroError.is(e) && !e.loc) {
                e.setLocation({
                  file: route == null ? void 0 : route.component
                });
              }
              controller2.error(e);
            }
          }
          read();
        }
      });
    } else {
      body = await iterableToHTMLBytes(result, iterable, isCompressHTML);
      headers.set("Content-Length", body.byteLength.toString());
    }
    let response = createResponse(body, { ...init2, headers });
    return response;
  }
  if (!(factoryReturnValue instanceof Response)) {
    throw new AstroError({
      ...AstroErrorData.OnlyResponseCanBeReturned,
      message: AstroErrorData.OnlyResponseCanBeReturned.message(
        route == null ? void 0 : route.route,
        typeof factoryReturnValue
      ),
      location: {
        file: route == null ? void 0 : route.component
      }
    });
  }
  return factoryReturnValue;
}
function __astro_tag_component__(Component, rendererName) {
  if (!Component)
    return;
  if (typeof Component !== "function")
    return;
  Object.defineProperty(Component, Renderer, {
    value: rendererName,
    enumerable: false,
    writable: false
  });
}
function spreadAttributes(values = {}, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children2 = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children: children2 });
    return;
  }
  if ("set:text" in vnode.props) {
    const children2 = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children: children2 });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [Renderer]: "astro:jsx",
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}
async function check(Component, props, { default: children2 = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children: children2 });
    return result[AstroJSX];
  } catch (e) {
    const error2 = e;
    if (Component[Symbol.for("mdx-component")]) {
      throw createFormattedError({
        message: error2.message,
        title: error2.name,
        hint: `This issue often occurs when your MDX component encounters runtime errors.`,
        name: error2.name,
        stack: error2.stack
      });
    }
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children2 = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children: children2 }));
  return { html };
}
function createFormattedError({ message, name, stack, hint }) {
  const error2 = new Error(message);
  error2.name = name;
  error2.stack = stack;
  error2.hint = hint;
  return error2;
}
function getDefaultExportFromCjs(x2) {
  return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
function Mime$1() {
  this._types = /* @__PURE__ */ Object.create(null);
  this._extensions = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }
  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}
function parse$1(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  var obj = {};
  var opt = options || {};
  var dec = opt.decode || decode;
  var index = 0;
  while (index < str.length) {
    var eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    var endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    var key = str.slice(index, eqIdx).trim();
    if (void 0 === obj[key]) {
      var val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.charCodeAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function serialize(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  var value = enc(val);
  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError("argument val is invalid");
  }
  var str = name + "=" + value;
  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;
    if (isNaN(maxAge) || !isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    var expires = opt.expires;
    if (!isDate(expires) || isNaN(expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low":
        str += "; Priority=Low";
        break;
      case "medium":
        str += "; Priority=Medium";
        break;
      case "high":
        str += "; Priority=High";
        break;
      default:
        throw new TypeError("option priority is invalid");
    }
  }
  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true:
        str += "; SameSite=Strict";
        break;
      case "lax":
        str += "; SameSite=Lax";
        break;
      case "strict":
        str += "; SameSite=Strict";
        break;
      case "none":
        str += "; SameSite=None";
        break;
      default:
        throw new TypeError("option sameSite is invalid");
    }
  }
  return str;
}
function decode(str) {
  return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
}
function encode(val) {
  return encodeURIComponent(val);
}
function isDate(val) {
  return __toString.call(val) === "[object Date]" || val instanceof Date;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch (e) {
    return str;
  }
}
function attachToResponse(response, cookies) {
  Reflect.set(response, astroCookiesSymbol, cookies);
}
function getFromResponse(response) {
  let cookies = Reflect.get(response, astroCookiesSymbol);
  if (cookies != null) {
    return cookies;
  } else {
    return void 0;
  }
}
function* getSetCookiesFromResponse(response) {
  const cookies = getFromResponse(response);
  if (!cookies) {
    return [];
  }
  for (const headerValue of cookies.headers()) {
    yield headerValue;
  }
  return [];
}
function init(x2, y2) {
  let rgx = new RegExp(`\\x1b\\[${y2}m`, "g");
  let open = `\x1B[${x2}m`, close = `\x1B[${y2}m`;
  return function(txt) {
    if (!$.enabled || txt == null)
      return txt;
    return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}
function log(opts, level, type, message) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    type,
    level,
    message
  };
  if (levels[logLevel] > levels[level]) {
    return;
  }
  dest.write(event);
}
function warn(opts, type, message) {
  return log(opts, "warn", type, message);
}
function error(opts, type, message) {
  return log(opts, "error", type, message);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
async function callMiddleware(logging, onRequest, apiContext, responseFunction) {
  new Promise((resolve) => {
  });
  let nextCalled = false;
  let responseFunctionPromise = void 0;
  const next = async () => {
    nextCalled = true;
    responseFunctionPromise = responseFunction();
    return responseFunctionPromise;
  };
  let middlewarePromise = onRequest(apiContext, next);
  return await Promise.resolve(middlewarePromise).then(async (value) => {
    if (isEndpointOutput(value)) {
      warn(
        logging,
        "middleware",
        `Using simple endpoints can cause unexpected issues in the chain of middleware functions.
It's strongly suggested to use full ${bold("Response")} objects.`
      );
    }
    if (nextCalled) {
      if (typeof value !== "undefined") {
        if (value instanceof Response === false) {
          throw new AstroError(AstroErrorData.MiddlewareNotAResponse);
        }
        return value;
      } else {
        if (responseFunctionPromise) {
          return responseFunctionPromise;
        } else {
          throw new AstroError(AstroErrorData.MiddlewareNotAResponse);
        }
      }
    } else if (typeof value === "undefined") {
      throw new AstroError(AstroErrorData.MiddlewareNoDataOrNextCalled);
    } else if (value instanceof Response === false) {
      throw new AstroError(AstroErrorData.MiddlewareNotAResponse);
    } else {
      return value;
    }
  });
}
function isEndpointOutput(endpointResult) {
  return !(endpointResult instanceof Response) && typeof endpointResult === "object" && typeof endpointResult.body === "string";
}
function createAPIContext({
  request,
  params,
  site,
  props,
  adapterName
}) {
  const context = {
    cookies: new AstroCookies(request),
    request,
    params,
    site: site ? new URL(site) : void 0,
    generator: `Astro v${ASTRO_VERSION}`,
    props,
    redirect(path, status) {
      return new Response(null, {
        status: status || 302,
        headers: {
          Location: path
        }
      });
    },
    url: new URL(request.url),
    get clientAddress() {
      if (!(clientAddressSymbol$1 in request)) {
        if (adapterName) {
          throw new AstroError({
            ...AstroErrorData.ClientAddressNotAvailable,
            message: AstroErrorData.ClientAddressNotAvailable.message(adapterName)
          });
        } else {
          throw new AstroError(AstroErrorData.StaticClientAddressNotAvailable);
        }
      }
      return Reflect.get(request, clientAddressSymbol$1);
    }
  };
  Object.defineProperty(context, "locals", {
    get() {
      return Reflect.get(request, clientLocalsSymbol$1);
    },
    set(val) {
      if (typeof val !== "object") {
        throw new AstroError(AstroErrorData.LocalsNotAnObject);
      } else {
        Reflect.set(request, clientLocalsSymbol$1, val);
      }
    }
  });
  return context;
}
async function callEndpoint(mod, env, ctx, logging, middleware) {
  var _a2;
  const context = createAPIContext({
    request: ctx.request,
    params: ctx.params,
    props: ctx.props,
    site: env.site,
    adapterName: env.adapterName
  });
  let response;
  if (middleware && middleware.onRequest) {
    const onRequest = middleware.onRequest;
    response = await callMiddleware(
      env.logging,
      onRequest,
      context,
      async () => {
        return await renderEndpoint(mod, context, env.ssr);
      }
    );
  } else {
    response = await renderEndpoint(mod, context, env.ssr);
  }
  if (response instanceof Response) {
    attachToResponse(response, context.cookies);
    return {
      type: "response",
      response
    };
  }
  if (env.ssr && !((_a2 = ctx.route) == null ? void 0 : _a2.prerender)) {
    if (response.hasOwnProperty("headers")) {
      warn(
        logging,
        "ssr",
        "Setting headers is not supported when returning an object. Please return an instance of Response. See https://docs.astro.build/en/core-concepts/endpoints/#server-endpoints-api-routes for more information."
      );
    }
    if (response.encoding) {
      warn(
        logging,
        "ssr",
        "`encoding` is ignored in SSR. To return a charset other than UTF-8, please return an instance of Response. See https://docs.astro.build/en/core-concepts/endpoints/#server-endpoints-api-routes for more information."
      );
    }
  }
  return {
    type: "simple",
    body: response.body,
    encoding: response.encoding,
    cookies: context.cookies
  };
}
function prependForwardSlash(path) {
  return path[0] === "/" ? path : "/" + path;
}
function removeTrailingForwardSlash(path) {
  return path.endsWith("/") ? path.slice(0, path.length - 1) : path;
}
function removeLeadingForwardSlash(path) {
  return path.startsWith("/") ? path.substring(1) : path;
}
function trimSlashes(path) {
  return path.replace(/^\/|\/$/g, "");
}
function isString(path) {
  return typeof path === "string" || path instanceof String;
}
function joinPaths(...paths) {
  return paths.filter(isString).map((path, i) => {
    if (i === 0) {
      return removeTrailingForwardSlash(path);
    } else if (i === paths.length - 1) {
      return removeLeadingForwardSlash(path);
    } else {
      return trimSlashes(path);
    }
  }).join("/");
}
function routeIsRedirect(route) {
  return (route == null ? void 0 : route.type) === "redirect";
}
function redirectRouteGenerate(redirectRoute, data) {
  const routeData = redirectRoute.redirectRoute;
  const route = redirectRoute.redirect;
  if (typeof routeData !== "undefined") {
    return (routeData == null ? void 0 : routeData.generate(data)) || (routeData == null ? void 0 : routeData.pathname) || "/";
  } else if (typeof route === "string") {
    return route;
  } else if (typeof route === "undefined") {
    return "/";
  }
  return route.destination;
}
function redirectRouteStatus(redirectRoute, method = "GET") {
  const routeData = redirectRoute.redirectRoute;
  if (typeof (routeData == null ? void 0 : routeData.redirect) === "object") {
    return routeData.redirect.status;
  } else if (method !== "GET") {
    return 308;
  }
  return 301;
}
function validateGetStaticPathsParameter([key, value], route) {
  if (!VALID_PARAM_TYPES.includes(typeof value)) {
    throw new AstroError({
      ...AstroErrorData.GetStaticPathsInvalidRouteParam,
      message: AstroErrorData.GetStaticPathsInvalidRouteParam.message(key, value, typeof value),
      location: {
        file: route
      }
    });
  }
}
function validateDynamicRouteModule(mod, {
  ssr: ssr2,
  logging,
  route
}) {
  if (ssr2 && mod.getStaticPaths && !route.prerender) {
    warn(
      logging,
      "getStaticPaths",
      `getStaticPaths() in ${bold(route.component)} is ignored when "output: server" is set.`
    );
  }
  if ((!ssr2 || route.prerender) && !mod.getStaticPaths) {
    throw new AstroError({
      ...AstroErrorData.GetStaticPathsRequired,
      location: { file: route.component }
    });
  }
}
function validateGetStaticPathsResult(result, logging, route) {
  if (!Array.isArray(result)) {
    throw new AstroError({
      ...AstroErrorData.InvalidGetStaticPathsReturn,
      message: AstroErrorData.InvalidGetStaticPathsReturn.message(typeof result),
      location: {
        file: route.component
      }
    });
  }
  result.forEach((pathObject) => {
    if (pathObject.params === void 0 || pathObject.params === null || pathObject.params && Object.keys(pathObject.params).length === 0) {
      throw new AstroError({
        ...AstroErrorData.GetStaticPathsExpectedParams,
        location: {
          file: route.component
        }
      });
    }
    if (typeof pathObject.params !== "object") {
      throw new AstroError({
        ...AstroErrorData.InvalidGetStaticPathParam,
        message: AstroErrorData.InvalidGetStaticPathParam.message(typeof pathObject.params),
        location: {
          file: route.component
        }
      });
    }
    for (const [key, val] of Object.entries(pathObject.params)) {
      if (!(typeof val === "undefined" || typeof val === "string" || typeof val === "number")) {
        warn(
          logging,
          "getStaticPaths",
          `invalid path param: ${key}. A string, number or undefined value was expected, but got \`${JSON.stringify(
            val
          )}\`.`
        );
      }
      if (typeof val === "string" && val === "") {
        warn(
          logging,
          "getStaticPaths",
          `invalid path param: ${key}. \`undefined\` expected for an optional param, but got empty string.`
        );
      }
    }
  });
}
function getParams(array) {
  const fn = (match) => {
    const params = {};
    array.forEach((key, i) => {
      if (key.startsWith("...")) {
        params[key.slice(3)] = match[i + 1] ? decodeURIComponent(match[i + 1]) : void 0;
      } else {
        params[key] = decodeURIComponent(match[i + 1]);
      }
    });
    return params;
  };
  return fn;
}
function stringifyParams(params, routeComponent) {
  const validatedParams = Object.entries(params).reduce((acc, next) => {
    validateGetStaticPathsParameter(next, routeComponent);
    const [key, value] = next;
    acc[key] = value == null ? void 0 : value.toString();
    return acc;
  }, {});
  return JSON.stringify(validatedParams, Object.keys(params).sort());
}
function getFunctionExpression(slot) {
  var _a2;
  if (!slot)
    return;
  if (((_a2 = slot.expressions) == null ? void 0 : _a2.length) !== 1)
    return;
  return slot.expressions[0];
}
function createResult(args) {
  const { markdown, params, pathname, renderers: renderers2, clientDirectives, request, resolve, locals } = args;
  const url = new URL(request.url);
  const headers = new Headers();
  headers.set("Content-Type", "text/html");
  const response = {
    status: args.status,
    statusText: "OK",
    headers
  };
  Object.defineProperty(response, "headers", {
    value: response.headers,
    enumerable: true,
    writable: false
  });
  let cookies = args.cookies;
  let componentMetadata = args.componentMetadata ?? /* @__PURE__ */ new Map();
  const result = {
    styles: args.styles ?? /* @__PURE__ */ new Set(),
    scripts: args.scripts ?? /* @__PURE__ */ new Set(),
    links: args.links ?? /* @__PURE__ */ new Set(),
    componentMetadata,
    propagators: /* @__PURE__ */ new Map(),
    extraHead: [],
    scope: 0,
    cookies,
    createAstro(astroGlobal, props, slots) {
      const astroSlots = new Slots(result, slots, args.logging);
      const Astro = {
        __proto__: astroGlobal,
        get clientAddress() {
          if (!(clientAddressSymbol in request)) {
            if (args.adapterName) {
              throw new AstroError({
                ...AstroErrorData.ClientAddressNotAvailable,
                message: AstroErrorData.ClientAddressNotAvailable.message(args.adapterName)
              });
            } else {
              throw new AstroError(AstroErrorData.StaticClientAddressNotAvailable);
            }
          }
          return Reflect.get(request, clientAddressSymbol);
        },
        get cookies() {
          if (cookies) {
            return cookies;
          }
          cookies = new AstroCookies(request);
          result.cookies = cookies;
          return cookies;
        },
        params,
        props,
        locals,
        request,
        url,
        redirect(path, status) {
          if (request[responseSentSymbol$1]) {
            throw new AstroError({
              ...AstroErrorData.ResponseSentError
            });
          }
          return new Response(null, {
            status: status || 302,
            headers: {
              Location: path
            }
          });
        },
        response,
        slots: astroSlots
      };
      Object.defineProperty(Astro, "__renderMarkdown", {
        enumerable: false,
        writable: false,
        value: async function(content, opts) {
          if (typeof Deno !== "undefined") {
            throw new Error("Markdown is not supported in Deno SSR");
          }
          if (!renderMarkdown) {
            let astroRemark = "@astrojs/";
            astroRemark += "markdown-remark";
            renderMarkdown = (await import(astroRemark)).renderMarkdown;
          }
          const { code } = await renderMarkdown(content, { ...markdown, ...opts ?? {} });
          return code;
        }
      });
      return Astro;
    },
    resolve,
    _metadata: {
      renderers: renderers2,
      pathname,
      hasHydrationScript: false,
      hasRenderedHead: false,
      hasDirectives: /* @__PURE__ */ new Set(),
      headInTree: false,
      clientDirectives
    },
    response
  };
  return result;
}
function generatePaginateFunction(routeMatch) {
  return function paginateUtility(data, args = {}) {
    let { pageSize: _pageSize, params: _params, props: _props } = args;
    const pageSize = _pageSize || 10;
    const paramName = "page";
    const additionalParams = _params || {};
    const additionalProps = _props || {};
    let includesFirstPageNumber;
    if (routeMatch.params.includes(`...${paramName}`)) {
      includesFirstPageNumber = false;
    } else if (routeMatch.params.includes(`${paramName}`)) {
      includesFirstPageNumber = true;
    } else {
      throw new AstroError({
        ...AstroErrorData.PageNumberParamNotFound,
        message: AstroErrorData.PageNumberParamNotFound.message(paramName)
      });
    }
    const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
    const result = [...Array(lastPage).keys()].map((num) => {
      const pageNum = num + 1;
      const start = pageSize === Infinity ? 0 : (pageNum - 1) * pageSize;
      const end = Math.min(start + pageSize, data.length);
      const params = {
        ...additionalParams,
        [paramName]: includesFirstPageNumber || pageNum > 1 ? String(pageNum) : void 0
      };
      const current = correctIndexRoute(routeMatch.generate({ ...params }));
      const next = pageNum === lastPage ? void 0 : correctIndexRoute(routeMatch.generate({ ...params, page: String(pageNum + 1) }));
      const prev = pageNum === 1 ? void 0 : correctIndexRoute(
        routeMatch.generate({
          ...params,
          page: !includesFirstPageNumber && pageNum - 1 === 1 ? void 0 : String(pageNum - 1)
        })
      );
      return {
        params,
        props: {
          ...additionalProps,
          page: {
            data: data.slice(start, end),
            start,
            end: end - 1,
            size: pageSize,
            total: data.length,
            currentPage: pageNum,
            lastPage,
            url: { current, next, prev }
          }
        }
      };
    });
    return result;
  };
}
function correctIndexRoute(route) {
  if (route === "") {
    return "/";
  }
  return route;
}
async function callGetStaticPaths({
  isValidate,
  logging,
  mod,
  route,
  ssr: ssr2
}) {
  validateDynamicRouteModule(mod, { ssr: ssr2, logging, route });
  if (ssr2 && !route.prerender) {
    return { staticPaths: Object.assign([], { keyed: /* @__PURE__ */ new Map() }) };
  }
  if (!mod.getStaticPaths) {
    throw new Error("Unexpected Error.");
  }
  let staticPaths = [];
  staticPaths = await mod.getStaticPaths({
    paginate: generatePaginateFunction(route),
    rss() {
      throw new AstroError(AstroErrorData.GetStaticPathsRemovedRSSHelper);
    }
  });
  if (Array.isArray(staticPaths)) {
    staticPaths = staticPaths.flat();
  }
  if (isValidate) {
    validateGetStaticPathsResult(staticPaths, logging, route);
  }
  const keyedStaticPaths = staticPaths;
  keyedStaticPaths.keyed = /* @__PURE__ */ new Map();
  for (const sp of keyedStaticPaths) {
    const paramsKey = stringifyParams(sp.params, route.component);
    keyedStaticPaths.keyed.set(paramsKey, sp);
  }
  return {
    staticPaths: keyedStaticPaths
  };
}
function findPathItemByKey(staticPaths, params, route) {
  const paramsKey = stringifyParams(params, route.component);
  const matchedStaticPath = staticPaths.keyed.get(paramsKey);
  if (matchedStaticPath) {
    return matchedStaticPath;
  }
  debug("findPathItemByKey", `Unexpected cache miss looking for ${paramsKey}`);
}
async function getParamsAndPropsOrThrow(options) {
  var _a2, _b;
  let paramsAndPropsResp = await getParamsAndProps(options);
  if (paramsAndPropsResp === 0) {
    throw new AstroError({
      ...AstroErrorData.NoMatchingStaticPathFound,
      message: AstroErrorData.NoMatchingStaticPathFound.message(options.pathname),
      hint: ((_a2 = options.route) == null ? void 0 : _a2.component) ? AstroErrorData.NoMatchingStaticPathFound.hint([(_b = options.route) == null ? void 0 : _b.component]) : ""
    });
  }
  return paramsAndPropsResp;
}
async function getParamsAndProps(opts) {
  const { logging, mod, route, routeCache, pathname, ssr: ssr2 } = opts;
  let params = {};
  let pageProps;
  if (route && !route.pathname) {
    if (route.params.length) {
      const paramsMatch = route.pattern.exec(decodeURIComponent(pathname));
      if (paramsMatch) {
        params = getParams(route.params)(paramsMatch);
        if (route.type === "endpoint" && mod.getStaticPaths) {
          const lastSegment = route.segments[route.segments.length - 1];
          const paramValues = Object.values(params);
          const lastParam = paramValues[paramValues.length - 1];
          if (lastSegment.length === 1 && lastSegment[0].dynamic && lastParam === void 0) {
            throw new AstroError({
              ...AstroErrorData.PrerenderDynamicEndpointPathCollide,
              message: AstroErrorData.PrerenderDynamicEndpointPathCollide.message(route.route),
              hint: AstroErrorData.PrerenderDynamicEndpointPathCollide.hint(route.component),
              location: {
                file: route.component
              }
            });
          }
        }
      }
    }
    let routeCacheEntry = routeCache.get(route);
    if (!routeCacheEntry) {
      routeCacheEntry = await callGetStaticPaths({ mod, route, isValidate: true, logging, ssr: ssr2 });
      routeCache.set(route, routeCacheEntry);
    }
    const matchedStaticPath = findPathItemByKey(routeCacheEntry.staticPaths, params, route);
    if (!matchedStaticPath && (ssr2 ? route.prerender : true)) {
      return 0;
    }
    pageProps = (matchedStaticPath == null ? void 0 : matchedStaticPath.props) ? { ...matchedStaticPath.props } : {};
  } else {
    pageProps = {};
  }
  return [params, pageProps];
}
async function renderPage({
  mod,
  renderContext,
  env,
  apiContext,
  isCompressHTML = false
}) {
  if (routeIsRedirect(renderContext.route)) {
    return new Response(null, {
      status: redirectRouteStatus(renderContext.route, renderContext.request.method),
      headers: {
        location: redirectRouteGenerate(renderContext.route, renderContext.params)
      }
    });
  }
  const Component = mod.default;
  if (!Component)
    throw new Error(`Expected an exported Astro component but received typeof ${typeof Component}`);
  let locals = (apiContext == null ? void 0 : apiContext.locals) ?? {};
  const result = createResult({
    adapterName: env.adapterName,
    links: renderContext.links,
    styles: renderContext.styles,
    logging: env.logging,
    markdown: env.markdown,
    mode: env.mode,
    origin: renderContext.origin,
    params: renderContext.params,
    props: renderContext.props,
    pathname: renderContext.pathname,
    componentMetadata: renderContext.componentMetadata,
    resolve: env.resolve,
    renderers: env.renderers,
    clientDirectives: env.clientDirectives,
    request: renderContext.request,
    site: env.site,
    scripts: renderContext.scripts,
    ssr: env.ssr,
    status: renderContext.status ?? 200,
    cookies: apiContext == null ? void 0 : apiContext.cookies,
    locals
  });
  if (typeof mod.components === "object") {
    Object.assign(renderContext.props, { components: mod.components });
  }
  let response = await renderPage$1(
    result,
    Component,
    renderContext.props,
    null,
    env.streaming,
    isCompressHTML,
    renderContext.route
  );
  if (result.cookies) {
    attachToResponse(response, result.cookies);
  }
  return response;
}
async function createRenderContext(options) {
  const request = options.request;
  const url = new URL(request.url);
  const origin = options.origin ?? url.origin;
  const pathname = options.pathname ?? url.pathname;
  const [params, props] = await getParamsAndPropsOrThrow({
    mod: options.mod,
    route: options.route,
    routeCache: options.env.routeCache,
    pathname,
    logging: options.env.logging,
    ssr: options.env.ssr
  });
  return {
    ...options,
    origin,
    pathname,
    url,
    params,
    props
  };
}
function createEnvironment(options) {
  return options;
}
function slash(path) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path);
  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }
  return path.replace(/\\/g, "/");
}
function createAssetLink(href, base, assetsPrefix) {
  if (assetsPrefix) {
    return joinPaths(assetsPrefix, slash(href));
  } else if (base) {
    return prependForwardSlash(joinPaths(base, slash(href)));
  } else {
    return href;
  }
}
function createStylesheetElement(stylesheet, base, assetsPrefix) {
  if (stylesheet.type === "inline") {
    return {
      props: {
        type: "text/css"
      },
      children: stylesheet.content
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix)
      },
      children: ""
    };
  }
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix) {
  return new Set(stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix)));
}
function createModuleScriptElement(script, base, assetsPrefix) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix)
    },
    children: ""
  };
}
function matchRoute(pathname, manifest) {
  return manifest.routes.find((route) => route.pattern.test(decodeURI(pathname)));
}
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j2 = i + 1;
      while (j2 < str.length) {
        var code = str.charCodeAt(j2);
        if (code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 95) {
          name += str[j2++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j2;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j2 = i + 1;
      if (str[j2] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j2));
      }
      while (j2 < str.length) {
        if (str[j2] === "\\") {
          pattern += str[j2++] + str[j2++];
          continue;
        }
        if (str[j2] === ")") {
          count--;
          if (count === 0) {
            j2++;
            break;
          }
        } else if (str[j2] === "(") {
          count++;
          if (str[j2 + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j2));
          }
        }
        pattern += str[j2++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j2;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a2 = options.prefixes, prefixes = _a2 === void 0 ? "./" : _a2;
  var defaultPattern = "[^".concat(escapeString(options.delimiter || "/#?"), "]+?");
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a3 = tokens[i], nextType = _a3.type, index = _a3.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || defaultPattern,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a2 = options.encode, encode2 = _a2 === void 0 ? function(x2) {
    return x2;
  } : _a2, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j2 = 0; j2 < value.length; j2++) {
          var segment = encode2(value[j2], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode2(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path;
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}
function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender
  };
}
function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    ...serializedManifest,
    assets,
    componentMetadata,
    clientDirectives,
    routes
  };
}
var AstroErrorData, AstroError, ASTRO_VERSION, replace, ca, esca, pe, escape, escapeHTML, HTMLBytes, HTMLString, markHTMLString, astro_island_prebuilt_default, ISLAND_STYLES, voidElementNames, htmlBooleanAttributes, htmlEnumAttributes, svgEnumAttributes, STATIC_DIRECTIVES, toIdent, toAttributeString, kebab, toStyleString, _iterable, _queue, _error, _next, _isBuffering, _gen, _isStarted, EagerAsyncIterableIterator, Queue, uniqueElements, headAndContentSym, _a$1, renderTemplateResultSym, RenderTemplateResult, _a, astroComponentInstanceSym, AstroComponentInstance, slotString, SlotString, Fragment, Renderer, encoder, decoder, HTMLParts, ClientOnlyPlaceholder, Skip, originalConsoleError, consoleFilterRefs, PROP_TYPE, dictionary, binary, rendererAliases, ASTRO_SLOT_EXP, ASTRO_STATIC_SLOT_EXP, isNodeJS, StreamingCompatibleResponse, createResponse, needsHeadRenderingSymbol, AstroJSX, Empty, toSlotName, slotName, server_default, Mime_1, standard, other, Mime, mime, mime$1, parse_1, serialize_1, __toString, fieldContentRegExp, DELETED_EXPIRATION, DELETED_VALUE, responseSentSymbol$2, AstroCookie, _request, _requestValues, _outgoing, _ensureParsed, ensureParsed_fn, _ensureOutgoingMap, ensureOutgoingMap_fn, _parse, parse_fn, AstroCookies, astroCookiesSymbol, FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY, $, reset, bold, dim, red, yellow, cyan, eastasianwidth, dateTimeFormat, levels, clientAddressSymbol$1, clientLocalsSymbol$1, lastMessage, lastMessageCount, consoleLogDestination, RedirectComponentInstance, StaticMiddlewareInstance, RedirectSinglePageBuiltModule, VALID_PARAM_TYPES, clientAddressSymbol, responseSentSymbol$1, _result, _slots, _loggingOpts, Slots, renderMarkdown, RouteCache, clientLocalsSymbol, responseSentSymbol, _env, _manifest, _manifestData, _routeDataToRouteInfo, _encoder, _logging, _base, _baseWithoutTrailingSlash, _getModuleForRoute, getModuleForRoute_fn, _renderPage, renderPage_fn, _callEndpoint, callEndpoint_fn, App;
var init_astro_80725e1e = __esm({
  ".netlify/edge-functions/chunks/astro.80725e1e.mjs"() {
    "use strict";
    AstroErrorData = {
      UnknownCompilerError: {
        title: "Unknown compiler error.",
        code: 1e3,
        hint: "This is almost always a problem with the Astro compiler, not your code. Please open an issue at https://astro.build/issues/compiler."
      },
      StaticRedirectNotAvailable: {
        title: "`Astro.redirect` is not available in static mode.",
        code: 3001,
        message: "Redirects are only available when using `output: 'server'` or `output: 'hybrid'`. Update your Astro config if you need SSR features.",
        hint: "See https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project for more information on how to enable SSR."
      },
      ClientAddressNotAvailable: {
        title: "`Astro.clientAddress` is not available in current adapter.",
        code: 3002,
        message: (adapterName) => `\`Astro.clientAddress\` is not available in the \`${adapterName}\` adapter. File an issue with the adapter to add support.`
      },
      StaticClientAddressNotAvailable: {
        title: "`Astro.clientAddress` is not available in static mode.",
        code: 3003,
        message: "`Astro.clientAddress` is only available when using `output: 'server'` or `output: 'hybrid'`. Update your Astro config if you need SSR features.",
        hint: "See https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project for more information on how to enable SSR."
      },
      NoMatchingStaticPathFound: {
        title: "No static path found for requested path.",
        code: 3004,
        message: (pathName) => `A \`getStaticPaths()\` route pattern was matched, but no matching static path was found for requested path \`${pathName}\`.`,
        hint: (possibleRoutes) => `Possible dynamic routes being matched: ${possibleRoutes.join(", ")}.`
      },
      OnlyResponseCanBeReturned: {
        title: "Invalid type returned by Astro page.",
        code: 3005,
        message: (route, returnedValue) => `Route \`${route ? route : ""}\` returned a \`${returnedValue}\`. Only a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) can be returned from Astro files.`,
        hint: "See https://docs.astro.build/en/guides/server-side-rendering/#response for more information."
      },
      MissingMediaQueryDirective: {
        title: "Missing value for `client:media` directive.",
        code: 3006,
        message: 'Media query not provided for `client:media` directive. A media query similar to `client:media="(max-width: 600px)"` must be provided'
      },
      NoMatchingRenderer: {
        title: "No matching renderer found.",
        code: 3007,
        message: (componentName, componentExtension, plural, validRenderersCount) => `Unable to render \`${componentName}\`.

${validRenderersCount > 0 ? `There ${plural ? "are" : "is"} ${validRenderersCount} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render \`${componentName}\`.` : `No valid renderer was found ${componentExtension ? `for the \`.${componentExtension}\` file extension.` : `for this file extension.`}`}`,
        hint: (probableRenderers) => `Did you mean to enable the ${probableRenderers} integration?

See https://docs.astro.build/en/core-concepts/framework-components/ for more information on how to install and configure integrations.`
      },
      NoClientEntrypoint: {
        title: "No client entrypoint specified in renderer.",
        code: 3008,
        message: (componentName, clientDirective, rendererName) => `\`${componentName}\` component has a \`client:${clientDirective}\` directive, but no client entrypoint was provided by \`${rendererName}\`.`,
        hint: "See https://docs.astro.build/en/reference/integrations-reference/#addrenderer-option for more information on how to configure your renderer."
      },
      NoClientOnlyHint: {
        title: "Missing hint on client:only directive.",
        code: 3009,
        message: (componentName) => `Unable to render \`${componentName}\`. When using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.`,
        hint: (probableRenderers) => `Did you mean to pass \`client:only="${probableRenderers}"\`? See https://docs.astro.build/en/reference/directives-reference/#clientonly for more information on client:only`
      },
      InvalidGetStaticPathParam: {
        title: "Invalid value returned by a `getStaticPaths` path.",
        code: 3010,
        message: (paramType) => `Invalid params given to \`getStaticPaths\` path. Expected an \`object\`, got \`${paramType}\``,
        hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
      },
      InvalidGetStaticPathsReturn: {
        title: "Invalid value returned by getStaticPaths.",
        code: 3011,
        message: (returnType) => `Invalid type returned by \`getStaticPaths\`. Expected an \`array\`, got \`${returnType}\``,
        hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
      },
      GetStaticPathsRemovedRSSHelper: {
        title: "getStaticPaths RSS helper is not available anymore.",
        code: 3012,
        message: "The RSS helper has been removed from `getStaticPaths`. Try the new @astrojs/rss package instead.",
        hint: "See https://docs.astro.build/en/guides/rss/ for more information."
      },
      GetStaticPathsExpectedParams: {
        title: "Missing params property on `getStaticPaths` route.",
        code: 3013,
        message: "Missing or empty required `params` property on `getStaticPaths` route.",
        hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
      },
      GetStaticPathsInvalidRouteParam: {
        title: "Invalid value for `getStaticPaths` route parameter.",
        code: 3014,
        message: (key, value, valueType) => `Invalid getStaticPaths route parameter for \`${key}\`. Expected undefined, a string or a number, received \`${valueType}\` (\`${value}\`)`,
        hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
      },
      GetStaticPathsRequired: {
        title: "`getStaticPaths()` function required for dynamic routes.",
        code: 3015,
        message: "`getStaticPaths()` function is required for dynamic routes. Make sure that you `export` a `getStaticPaths` function from your dynamic route.",
        hint: `See https://docs.astro.build/en/core-concepts/routing/#dynamic-routes for more information on dynamic routes.

Alternatively, set \`output: "server"\` in your Astro config file to switch to a non-static server build. This error can also occur if using \`export const prerender = true;\`.
See https://docs.astro.build/en/guides/server-side-rendering/ for more information on non-static rendering.`
      },
      ReservedSlotName: {
        title: "Invalid slot name.",
        code: 3016,
        message: (slotName3) => `Unable to create a slot named \`${slotName3}\`. \`${slotName3}\` is a reserved slot name. Please update the name of this slot.`
      },
      NoAdapterInstalled: {
        title: "Cannot use Server-side Rendering without an adapter.",
        code: 3017,
        message: `Cannot use \`output: 'server'\` or \`output: 'hybrid'\` without an adapter. Please install and configure the appropriate server adapter for your final deployment.`,
        hint: "See https://docs.astro.build/en/guides/server-side-rendering/ for more information."
      },
      NoMatchingImport: {
        title: "No import found for component.",
        code: 3018,
        message: (componentName) => `Could not render \`${componentName}\`. No matching import has been found for \`${componentName}\`.`,
        hint: "Please make sure the component is properly imported."
      },
      InvalidPrerenderExport: {
        title: "Invalid prerender export.",
        code: 3019,
        message: (prefix, suffix, isHydridOuput) => {
          const defaultExpectedValue = isHydridOuput ? "false" : "true";
          let msg = `A \`prerender\` export has been detected, but its value cannot be statically analyzed.`;
          if (prefix !== "const")
            msg += `
Expected \`const\` declaration but got \`${prefix}\`.`;
          if (suffix !== "true")
            msg += `
Expected \`${defaultExpectedValue}\` value but got \`${suffix}\`.`;
          return msg;
        },
        hint: "Mutable values declared at runtime are not supported. Please make sure to use exactly `export const prerender = true`."
      },
      InvalidComponentArgs: {
        title: "Invalid component arguments.",
        code: 3020,
        message: (name) => `Invalid arguments passed to${name ? ` <${name}>` : ""} component.`,
        hint: "Astro components cannot be rendered directly via function call, such as `Component()` or `{items.map(Component)}`."
      },
      PageNumberParamNotFound: {
        title: "Page number param not found.",
        code: 3021,
        message: (paramName) => `[paginate()] page number param \`${paramName}\` not found in your filepath.`,
        hint: "Rename your file to `[page].astro` or `[...page].astro`."
      },
      ImageMissingAlt: {
        title: "Missing alt property.",
        code: 3022,
        message: "The alt property is required.",
        hint: "The `alt` property is important for the purpose of accessibility, without it users using screen readers or other assistive technologies won't be able to understand what your image is supposed to represent. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-alt for more information."
      },
      InvalidImageService: {
        title: "Error while loading image service.",
        code: 3023,
        message: "There was an error loading the configured image service. Please see the stack trace for more information."
      },
      MissingImageDimension: {
        title: "Missing image dimensions",
        code: 3024,
        message: (missingDimension, imageURL) => `Missing ${missingDimension === "both" ? "width and height attributes" : `${missingDimension} attribute`} for ${imageURL}. When using remote images, both dimensions are always required in order to avoid CLS.`,
        hint: "If your image is inside your `src` folder, you probably meant to import it instead. See [the Imports guide for more information](https://docs.astro.build/en/guides/imports/#other-assets)."
      },
      UnsupportedImageFormat: {
        title: "Unsupported image format",
        code: 3025,
        message: (format, imagePath, supportedFormats) => `Received unsupported format \`${format}\` from \`${imagePath}\`. Currently only ${supportedFormats.join(
          ", "
        )} are supported for optimization.`,
        hint: "If you do not need optimization, using an `img` tag directly instead of the `Image` component might be what you're looking for."
      },
      PrerenderDynamicEndpointPathCollide: {
        title: "Prerendered dynamic endpoint has path collision.",
        code: 3026,
        message: (pathname) => `Could not render \`${pathname}\` with an \`undefined\` param as the generated path will collide during prerendering. Prevent passing \`undefined\` as \`params\` for the endpoint's \`getStaticPaths()\` function, or add an additional extension to the endpoint's filename.`,
        hint: (filename) => `Rename \`${filename}\` to \`${filename.replace(/\.(js|ts)/, (m2) => `.json` + m2)}\``
      },
      ExpectedImage: {
        title: "Expected src to be an image.",
        code: 3027,
        message: (options) => `Expected \`src\` property to be either an ESM imported image or a string with the path of a remote image. Received \`${options}\`.`,
        hint: "This error can often happen because of a wrong path. Make sure the path to your image is correct."
      },
      ExpectedImageOptions: {
        title: "Expected image options.",
        code: 3028,
        message: (options) => `Expected getImage() parameter to be an object. Received \`${options}\`.`
      },
      MarkdownImageNotFound: {
        title: "Image not found.",
        code: 3029,
        message: (imagePath, fullImagePath) => `Could not find requested image \`${imagePath}\`${fullImagePath ? ` at \`${fullImagePath}\`.` : "."}`,
        hint: "This is often caused by a typo in the image path. Please make sure the file exists, and is spelled correctly."
      },
      ResponseSentError: {
        title: "Unable to set response.",
        code: 3030,
        message: "The response has already been sent to the browser and cannot be altered."
      },
      MiddlewareNoDataOrNextCalled: {
        title: "The middleware didn't return a response or call `next`.",
        code: 3031,
        message: "The middleware needs to either return a `Response` object or call the `next` function."
      },
      MiddlewareNotAResponse: {
        title: "The middleware returned something that is not a `Response` object.",
        code: 3032,
        message: "Any data returned from middleware must be a valid `Response` object."
      },
      LocalsNotAnObject: {
        title: "Value assigned to `locals` is not accepted.",
        code: 3033,
        message: "`locals` can only be assigned to an object. Other values like numbers, strings, etc. are not accepted.",
        hint: "If you tried to remove some information from the `locals` object, try to use `delete` or set the property to `undefined`."
      },
      LocalImageUsedWrongly: {
        title: "ESM imported images must be passed as-is.",
        code: 3034,
        message: (imageFilePath) => `\`Image\`'s and \`getImage\`'s \`src\` parameter must be an imported image or an URL, it cannot be a filepath. Received \`${imageFilePath}\`.`
      },
      AstroGlobUsedOutside: {
        title: "Astro.glob() used outside of an Astro file.",
        code: 3035,
        message: (globStr) => `\`Astro.glob(${globStr})\` can only be used in \`.astro\` files. \`import.meta.glob(${globStr})\` can be used instead to achieve a similar result.`,
        hint: "See Vite's documentation on `import.meta.glob` for more information: https://vitejs.dev/guide/features.html#glob-import"
      },
      AstroGlobNoMatch: {
        title: "Astro.glob() did not match any files.",
        code: 3036,
        message: (globStr) => `\`Astro.glob(${globStr})\` did not return any matching files. Check the pattern for typos.`
      },
      RedirectWithNoLocation: {
        title: "A redirect must be given a location with the `Location` header.",
        code: 3037
      },
      InvalidDynamicRoute: {
        title: "Invalid dynamic route.",
        code: 3038,
        message: (route, invalidParam, received) => `The ${invalidParam} param for route ${route} is invalid. Received **${received}**.`
      },
      UnknownViteError: {
        title: "Unknown Vite Error.",
        code: 4e3
      },
      FailedToLoadModuleSSR: {
        title: "Could not import file.",
        code: 4001,
        message: (importName) => `Could not import \`${importName}\`.`,
        hint: "This is often caused by a typo in the import path. Please make sure the file exists."
      },
      InvalidGlob: {
        title: "Invalid glob pattern.",
        code: 4002,
        message: (globPattern) => `Invalid glob pattern: \`${globPattern}\`. Glob patterns must start with './', '../' or '/'.`,
        hint: "See https://docs.astro.build/en/guides/imports/#glob-patterns for more information on supported glob patterns."
      },
      UnknownCSSError: {
        title: "Unknown CSS Error.",
        code: 5e3
      },
      CSSSyntaxError: {
        title: "CSS Syntax Error.",
        code: 5001
      },
      UnknownMarkdownError: {
        title: "Unknown Markdown Error.",
        code: 6e3
      },
      MarkdownFrontmatterParseError: {
        title: "Failed to parse Markdown frontmatter.",
        code: 6001
      },
      InvalidFrontmatterInjectionError: {
        title: "Invalid frontmatter injection.",
        code: 6003,
        message: 'A remark or rehype plugin attempted to inject invalid frontmatter. Ensure "astro.frontmatter" is set to a valid JSON object that is not `null` or `undefined`.',
        hint: "See the frontmatter injection docs https://docs.astro.build/en/guides/markdown-content/#modifying-frontmatter-programmatically for more information."
      },
      MdxIntegrationMissingError: {
        title: "MDX integration missing.",
        code: 6004,
        message: (file) => `Unable to render ${file}. Ensure that the \`@astrojs/mdx\` integration is installed.`,
        hint: "See the MDX integration docs for installation and usage instructions: https://docs.astro.build/en/guides/integrations-guide/mdx/"
      },
      UnknownConfigError: {
        title: "Unknown configuration error.",
        code: 7e3
      },
      ConfigNotFound: {
        title: "Specified configuration file not found.",
        code: 7001,
        message: (configFile) => `Unable to resolve \`--config "${configFile}"\`. Does the file exist?`
      },
      ConfigLegacyKey: {
        title: "Legacy configuration detected.",
        code: 7002,
        message: (legacyConfigKey) => `Legacy configuration detected: \`${legacyConfigKey}\`.`,
        hint: "Please update your configuration to the new format.\nSee https://astro.build/config for more information."
      },
      UnknownCLIError: {
        title: "Unknown CLI Error.",
        code: 8e3
      },
      GenerateContentTypesError: {
        title: "Failed to generate content types.",
        code: 8001,
        message: (errorMessage) => `\`astro sync\` command failed to generate content collection types: ${errorMessage}`,
        hint: "Check your `src/content/config.*` file for typos."
      },
      UnknownContentCollectionError: {
        title: "Unknown Content Collection Error.",
        code: 9e3
      },
      InvalidContentEntryFrontmatterError: {
        title: "Content entry frontmatter does not match schema.",
        code: 9001,
        message: (collection, entryId, error2) => {
          return [
            `**${String(collection)} \u2192 ${String(
              entryId
            )}** frontmatter does not match collection schema.`,
            ...error2.errors.map((zodError) => zodError.message)
          ].join("\n");
        },
        hint: "See https://docs.astro.build/en/guides/content-collections/ for more information on content schemas."
      },
      InvalidContentEntrySlugError: {
        title: "Invalid content entry slug.",
        code: 9002,
        message: (collection, entryId) => {
          return `${String(collection)} \u2192 ${String(
            entryId
          )} has an invalid slug. \`slug\` must be a string.`;
        },
        hint: "See https://docs.astro.build/en/guides/content-collections/ for more on the `slug` field."
      },
      ContentSchemaContainsSlugError: {
        title: "Content Schema should not contain `slug`.",
        code: 9003,
        message: (collectionName) => `A content collection schema should not contain \`slug\` since it is reserved for slug generation. Remove this from your ${collectionName} collection schema.`,
        hint: "See https://docs.astro.build/en/guides/content-collections/ for more on the `slug` field."
      },
      CollectionDoesNotExistError: {
        title: "Collection does not exist",
        code: 9004,
        message: (collectionName) => `The collection **${collectionName}** does not exist. Ensure a collection directory with this name exists.`,
        hint: "See https://docs.astro.build/en/guides/content-collections/ for more on creating collections."
      },
      MixedContentDataCollectionError: {
        title: "Content and data cannot be in same collection.",
        code: 9005,
        message: (collection) => {
          return `**${collection}** contains a mix of content and data entries. All entries must be of the same type.`;
        },
        hint: "Store data entries in a new collection separate from your content collection."
      },
      ContentCollectionTypeMismatchError: {
        title: "Collection contains entries of a different type.",
        code: 9006,
        message: (collection, expectedType, actualType) => {
          return `${collection} contains ${expectedType} entries, but is configured as a ${actualType} collection.`;
        }
      },
      DataCollectionEntryParseError: {
        title: "Data collection entry failed to parse.",
        code: 9007,
        message: (entryId, errorMessage) => {
          return `**${entryId}** failed to parse: ${errorMessage}`;
        },
        hint: "Ensure your data entry is an object with valid JSON (for `.json` entries) or YAML (for `.yaml` entries)."
      },
      DuplicateContentEntrySlugError: {
        title: "Duplicate content entry slug.",
        code: 9008,
        message: (collection, slug) => {
          return `**${collection}** contains multiple entries with the same slug: \`${slug}\`. Slugs must be unique.`;
        }
      },
      UnsupportedConfigTransformError: {
        title: "Unsupported transform in content config.",
        code: 9008,
        message: (parseError) => `\`transform()\` functions in your content config must return valid JSON, or data types compatible with the devalue library (including Dates, Maps, and Sets).
Full error: ${parseError}`,
        hint: "See the devalue library for all supported types: https://github.com/rich-harris/devalue"
      },
      UnknownError: {
        title: "Unknown Error.",
        code: 99999
      }
    };
    AstroError = class extends Error {
      constructor(props, ...params) {
        var _a2;
        super(...params);
        this.type = "AstroError";
        const { code, name, title, message, stack, location, hint, frame } = props;
        this.errorCode = code;
        if (name && name !== "Error") {
          this.name = name;
        } else {
          this.name = ((_a2 = getErrorDataByCode(this.errorCode)) == null ? void 0 : _a2.name) ?? "UnknownError";
        }
        this.title = title;
        if (message)
          this.message = message;
        this.stack = stack ? stack : this.stack;
        this.loc = location;
        this.hint = hint;
        this.frame = frame;
      }
      setErrorCode(errorCode) {
        this.errorCode = errorCode;
      }
      setLocation(location) {
        this.loc = location;
      }
      setName(name) {
        this.name = name;
      }
      setMessage(message) {
        this.message = message;
      }
      setHint(hint) {
        this.hint = hint;
      }
      setFrame(source, location) {
        this.frame = codeFrame(source, location);
      }
      static is(err) {
        return err.type === "AstroError";
      }
    };
    ASTRO_VERSION = "2.6.4";
    ({ replace } = "");
    ca = /[&<>'"]/g;
    esca = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };
    pe = (m2) => esca[m2];
    escape = (es) => replace.call(es, ca, pe);
    escapeHTML = escape;
    HTMLBytes = class extends Uint8Array {
    };
    Object.defineProperty(HTMLBytes.prototype, Symbol.toStringTag, {
      get() {
        return "HTMLBytes";
      }
    });
    HTMLString = class extends String {
      get [Symbol.toStringTag]() {
        return "HTMLString";
      }
    };
    markHTMLString = (value) => {
      if (value instanceof HTMLString) {
        return value;
      }
      if (typeof value === "string") {
        return new HTMLString(value);
      }
      return value;
    };
    astro_island_prebuilt_default = `(()=>{var c;{let d={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(JSON.parse(t)),9:t=>new Uint16Array(JSON.parse(t)),10:t=>new Uint32Array(JSON.parse(t))},o=(t,r)=>{if(t===""||!Array.isArray(r))return r;let[e,n]=r;return e in d?d[e](n):void 0};customElements.get("astro-island")||customElements.define("astro-island",(c=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{var l;if(!this.hydrator||!this.isConnected||(l=this.parentElement)!=null&&l.closest("astro-island[ssr]"))return;let r=this.querySelectorAll("astro-slot"),e={},n=this.querySelectorAll("template[data-astro-template]");for(let s of n){let i=s.closest(this.tagName);!i||!i.isSameNode(this)||(e[s.getAttribute("data-astro-template")||"default"]=s.innerHTML,s.remove())}for(let s of r){let i=s.closest(this.tagName);!i||!i.isSameNode(this)||(e[s.getAttribute("name")||"default"]=s.innerHTML)}let a=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,a,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((r,e)=>{e.disconnect(),setTimeout(()=>this.childrenConnectedCallback(),0)}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate);let r=this.getAttribute("before-hydration-url");r&&await import(r),this.start()}start(){let r=JSON.parse(this.getAttribute("opts")),e=this.getAttribute("client");if(Astro[e]===void 0){window.addEventListener(\`astro:\${e}\`,()=>this.start(),{once:!0});return}Astro[e](async()=>{let n=this.getAttribute("renderer-url"),[a,{default:l}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),s=this.getAttribute("component-export")||"default";if(!s.includes("."))this.Component=a[s];else{this.Component=a;for(let i of s.split("."))this.Component=this.Component[i]}return this.hydrator=l,this.hydrate},r,this)}attributeChangedCallback(){this.hydrate()}},c.observedAttributes=["props"],c))}})();`;
    ISLAND_STYLES = `<style>astro-island,astro-slot,astro-static-slot{display:contents}</style>`;
    voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
    htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
    htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
    svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
    STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
    toIdent = (k2) => k2.trim().replace(/(?:(?!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
      if (/[^\w]|\s/.test(match))
        return "";
      return index === 0 ? match : match.toUpperCase();
    });
    toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
    kebab = (k2) => k2.toLowerCase() === k2 ? k2 : k2.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    toStyleString = (obj) => Object.entries(obj).map(([k2, v]) => {
      if (k2[0] !== "-" && k2[1] !== "-")
        return `${kebab(k2)}:${v}`;
      if (kebab(k2) !== k2)
        return `${kebab(k2)}:var(${k2});${k2}:${v}`;
      return `${k2}:${v}`;
    }).join(";");
    EagerAsyncIterableIterator = class {
      constructor(iterable) {
        __privateAdd(this, _iterable, void 0);
        __privateAdd(this, _queue, new Queue());
        __privateAdd(this, _error, void 0);
        __privateAdd(this, _next, void 0);
        __privateAdd(this, _isBuffering, false);
        __privateAdd(this, _gen, void 0);
        __privateAdd(this, _isStarted, false);
        __privateSet(this, _iterable, iterable);
      }
      async buffer() {
        if (__privateGet(this, _gen)) {
          throw new Error("Cannot not switch from non-buffer to buffer mode");
        }
        __privateSet(this, _isBuffering, true);
        __privateSet(this, _isStarted, true);
        __privateSet(this, _gen, __privateGet(this, _iterable)[Symbol.asyncIterator]());
        let value = void 0;
        do {
          __privateSet(this, _next, __privateGet(this, _gen).next());
          try {
            value = await __privateGet(this, _next);
            __privateGet(this, _queue).push(value);
          } catch (e) {
            __privateSet(this, _error, e);
          }
        } while (value && !value.done);
      }
      async next() {
        if (__privateGet(this, _error)) {
          throw __privateGet(this, _error);
        }
        if (!__privateGet(this, _isBuffering)) {
          if (!__privateGet(this, _gen)) {
            __privateSet(this, _isStarted, true);
            __privateSet(this, _gen, __privateGet(this, _iterable)[Symbol.asyncIterator]());
          }
          return await __privateGet(this, _gen).next();
        }
        if (!__privateGet(this, _queue).isEmpty()) {
          return __privateGet(this, _queue).shift();
        }
        await __privateGet(this, _next);
        return __privateGet(this, _queue).shift();
      }
      isStarted() {
        return __privateGet(this, _isStarted);
      }
      [Symbol.asyncIterator]() {
        return this;
      }
    };
    _iterable = new WeakMap();
    _queue = new WeakMap();
    _error = new WeakMap();
    _next = new WeakMap();
    _isBuffering = new WeakMap();
    _gen = new WeakMap();
    _isStarted = new WeakMap();
    Queue = class {
      constructor() {
        this.head = void 0;
        this.tail = void 0;
      }
      push(item) {
        if (this.head === void 0) {
          this.head = { item };
          this.tail = this.head;
        } else {
          this.tail.next = { item };
          this.tail = this.tail.next;
        }
      }
      isEmpty() {
        return this.head === void 0;
      }
      shift() {
        var _a2, _b;
        const val = (_a2 = this.head) == null ? void 0 : _a2.item;
        this.head = (_b = this.head) == null ? void 0 : _b.next;
        return val;
      }
    };
    uniqueElements = (item, index, all) => {
      const props = JSON.stringify(item.props);
      const children2 = item.children;
      return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children2);
    };
    headAndContentSym = Symbol.for("astro.headAndContent");
    renderTemplateResultSym = Symbol.for("astro.renderTemplateResult");
    RenderTemplateResult = class {
      constructor(htmlParts, expressions) {
        this[_a$1] = true;
        this.htmlParts = htmlParts;
        this.error = void 0;
        this.expressions = expressions.map((expression) => {
          if (isPromise(expression)) {
            return Promise.resolve(expression).catch((err) => {
              if (!this.error) {
                this.error = err;
                throw err;
              }
            });
          }
          return expression;
        });
      }
      async *[(_a$1 = renderTemplateResultSym, Symbol.asyncIterator)]() {
        const { htmlParts, expressions } = this;
        let iterables = bufferIterators(expressions.map((e) => renderChild(e)));
        for (let i = 0; i < htmlParts.length; i++) {
          const html = htmlParts[i];
          const iterable = iterables[i];
          yield markHTMLString(html);
          if (iterable) {
            yield* iterable;
          }
        }
      }
    };
    astroComponentInstanceSym = Symbol.for("astro.componentInstance");
    AstroComponentInstance = class {
      constructor(result, props, slots, factory) {
        this[_a] = true;
        this.result = result;
        this.props = props;
        this.factory = factory;
        this.slotValues = {};
        for (const name in slots) {
          const value = slots[name](result);
          this.slotValues[name] = () => value;
        }
      }
      async init(result) {
        this.returnValue = this.factory(result, this.props, this.slotValues);
        return this.returnValue;
      }
      async *render() {
        if (this.returnValue === void 0) {
          await this.init(this.result);
        }
        let value = this.returnValue;
        if (isPromise(value)) {
          value = await value;
        }
        if (isHeadAndContent(value)) {
          yield* value.content;
        } else {
          yield* renderChild(value);
        }
      }
    };
    _a = astroComponentInstanceSym;
    slotString = Symbol.for("astro:slot-string");
    SlotString = class extends HTMLString {
      constructor(content, instructions) {
        super(content);
        this.instructions = instructions;
        this[slotString] = true;
      }
    };
    Fragment = Symbol.for("astro:fragment");
    Renderer = Symbol.for("astro:renderer");
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    HTMLParts = class {
      constructor() {
        this.parts = "";
      }
      append(part, result) {
        if (ArrayBuffer.isView(part)) {
          this.parts += decoder.decode(part);
        } else {
          this.parts += stringifyChunk(result, part);
        }
      }
      toString() {
        return this.parts;
      }
      toArrayBuffer() {
        return encoder.encode(this.parts);
      }
    };
    ClientOnlyPlaceholder = "astro-client-only";
    Skip = class {
      constructor(vnode) {
        this.vnode = vnode;
        this.count = 0;
      }
      increment() {
        this.count++;
      }
      haveNoTried() {
        return this.count === 0;
      }
      isCompleted() {
        return this.count > 2;
      }
    };
    Skip.symbol = Symbol("astro:jsx:skip");
    consoleFilterRefs = 0;
    PROP_TYPE = {
      Value: 0,
      JSON: 1,
      RegExp: 2,
      Date: 3,
      Map: 4,
      Set: 5,
      BigInt: 6,
      URL: 7,
      Uint8Array: 8,
      Uint16Array: 9,
      Uint32Array: 10
    };
    dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
    binary = dictionary.length;
    rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
    ASTRO_SLOT_EXP = /\<\/?astro-slot\b[^>]*>/g;
    ASTRO_STATIC_SLOT_EXP = /\<\/?astro-static-slot\b[^>]*>/g;
    isNodeJS = typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";
    createResponse = isNodeJS ? (body, init2) => {
      if (typeof body === "string" || ArrayBuffer.isView(body)) {
        return new Response(body, init2);
      }
      if (typeof StreamingCompatibleResponse === "undefined") {
        return new (createResponseClass())(body, init2);
      }
      return new StreamingCompatibleResponse(body, init2);
    } : (body, init2) => new Response(body, init2);
    needsHeadRenderingSymbol = Symbol.for("astro.needsHeadRendering");
    AstroJSX = "astro:jsx";
    Empty = Symbol("empty");
    toSlotName = (slotAttr) => slotAttr;
    slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_2, w2) => w2.toUpperCase());
    server_default = {
      check,
      renderToStaticMarkup
    };
    Mime$1.prototype.define = function(typeMap, force) {
      for (let type in typeMap) {
        let extensions = typeMap[type].map(function(t) {
          return t.toLowerCase();
        });
        type = type.toLowerCase();
        for (let i = 0; i < extensions.length; i++) {
          const ext = extensions[i];
          if (ext[0] === "*") {
            continue;
          }
          if (!force && ext in this._types) {
            throw new Error(
              'Attempt to change mapping for "' + ext + '" extension from "' + this._types[ext] + '" to "' + type + '". Pass `force=true` to allow this, otherwise remove "' + ext + '" from the list of extensions for "' + type + '".'
            );
          }
          this._types[ext] = type;
        }
        if (force || !this._extensions[type]) {
          const ext = extensions[0];
          this._extensions[type] = ext[0] !== "*" ? ext : ext.substr(1);
        }
      }
    };
    Mime$1.prototype.getType = function(path) {
      path = String(path);
      let last = path.replace(/^.*[/\\]/, "").toLowerCase();
      let ext = last.replace(/^.*\./, "").toLowerCase();
      let hasPath = last.length < path.length;
      let hasDot = ext.length < last.length - 1;
      return (hasDot || !hasPath) && this._types[ext] || null;
    };
    Mime$1.prototype.getExtension = function(type) {
      type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
      return type && this._extensions[type.toLowerCase()] || null;
    };
    Mime_1 = Mime$1;
    standard = { "application/andrew-inset": ["ez"], "application/applixware": ["aw"], "application/atom+xml": ["atom"], "application/atomcat+xml": ["atomcat"], "application/atomdeleted+xml": ["atomdeleted"], "application/atomsvc+xml": ["atomsvc"], "application/atsc-dwd+xml": ["dwd"], "application/atsc-held+xml": ["held"], "application/atsc-rsat+xml": ["rsat"], "application/bdoc": ["bdoc"], "application/calendar+xml": ["xcs"], "application/ccxml+xml": ["ccxml"], "application/cdfx+xml": ["cdfx"], "application/cdmi-capability": ["cdmia"], "application/cdmi-container": ["cdmic"], "application/cdmi-domain": ["cdmid"], "application/cdmi-object": ["cdmio"], "application/cdmi-queue": ["cdmiq"], "application/cu-seeme": ["cu"], "application/dash+xml": ["mpd"], "application/davmount+xml": ["davmount"], "application/docbook+xml": ["dbk"], "application/dssc+der": ["dssc"], "application/dssc+xml": ["xdssc"], "application/ecmascript": ["es", "ecma"], "application/emma+xml": ["emma"], "application/emotionml+xml": ["emotionml"], "application/epub+zip": ["epub"], "application/exi": ["exi"], "application/express": ["exp"], "application/fdt+xml": ["fdt"], "application/font-tdpfr": ["pfr"], "application/geo+json": ["geojson"], "application/gml+xml": ["gml"], "application/gpx+xml": ["gpx"], "application/gxf": ["gxf"], "application/gzip": ["gz"], "application/hjson": ["hjson"], "application/hyperstudio": ["stk"], "application/inkml+xml": ["ink", "inkml"], "application/ipfix": ["ipfix"], "application/its+xml": ["its"], "application/java-archive": ["jar", "war", "ear"], "application/java-serialized-object": ["ser"], "application/java-vm": ["class"], "application/javascript": ["js", "mjs"], "application/json": ["json", "map"], "application/json5": ["json5"], "application/jsonml+json": ["jsonml"], "application/ld+json": ["jsonld"], "application/lgr+xml": ["lgr"], "application/lost+xml": ["lostxml"], "application/mac-binhex40": ["hqx"], "application/mac-compactpro": ["cpt"], "application/mads+xml": ["mads"], "application/manifest+json": ["webmanifest"], "application/marc": ["mrc"], "application/marcxml+xml": ["mrcx"], "application/mathematica": ["ma", "nb", "mb"], "application/mathml+xml": ["mathml"], "application/mbox": ["mbox"], "application/mediaservercontrol+xml": ["mscml"], "application/metalink+xml": ["metalink"], "application/metalink4+xml": ["meta4"], "application/mets+xml": ["mets"], "application/mmt-aei+xml": ["maei"], "application/mmt-usd+xml": ["musd"], "application/mods+xml": ["mods"], "application/mp21": ["m21", "mp21"], "application/mp4": ["mp4s", "m4p"], "application/msword": ["doc", "dot"], "application/mxf": ["mxf"], "application/n-quads": ["nq"], "application/n-triples": ["nt"], "application/node": ["cjs"], "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"], "application/oda": ["oda"], "application/oebps-package+xml": ["opf"], "application/ogg": ["ogx"], "application/omdoc+xml": ["omdoc"], "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"], "application/oxps": ["oxps"], "application/p2p-overlay+xml": ["relo"], "application/patch-ops-error+xml": ["xer"], "application/pdf": ["pdf"], "application/pgp-encrypted": ["pgp"], "application/pgp-signature": ["asc", "sig"], "application/pics-rules": ["prf"], "application/pkcs10": ["p10"], "application/pkcs7-mime": ["p7m", "p7c"], "application/pkcs7-signature": ["p7s"], "application/pkcs8": ["p8"], "application/pkix-attr-cert": ["ac"], "application/pkix-cert": ["cer"], "application/pkix-crl": ["crl"], "application/pkix-pkipath": ["pkipath"], "application/pkixcmp": ["pki"], "application/pls+xml": ["pls"], "application/postscript": ["ai", "eps", "ps"], "application/provenance+xml": ["provx"], "application/pskc+xml": ["pskcxml"], "application/raml+yaml": ["raml"], "application/rdf+xml": ["rdf", "owl"], "application/reginfo+xml": ["rif"], "application/relax-ng-compact-syntax": ["rnc"], "application/resource-lists+xml": ["rl"], "application/resource-lists-diff+xml": ["rld"], "application/rls-services+xml": ["rs"], "application/route-apd+xml": ["rapd"], "application/route-s-tsid+xml": ["sls"], "application/route-usd+xml": ["rusd"], "application/rpki-ghostbusters": ["gbr"], "application/rpki-manifest": ["mft"], "application/rpki-roa": ["roa"], "application/rsd+xml": ["rsd"], "application/rss+xml": ["rss"], "application/rtf": ["rtf"], "application/sbml+xml": ["sbml"], "application/scvp-cv-request": ["scq"], "application/scvp-cv-response": ["scs"], "application/scvp-vp-request": ["spq"], "application/scvp-vp-response": ["spp"], "application/sdp": ["sdp"], "application/senml+xml": ["senmlx"], "application/sensml+xml": ["sensmlx"], "application/set-payment-initiation": ["setpay"], "application/set-registration-initiation": ["setreg"], "application/shf+xml": ["shf"], "application/sieve": ["siv", "sieve"], "application/smil+xml": ["smi", "smil"], "application/sparql-query": ["rq"], "application/sparql-results+xml": ["srx"], "application/srgs": ["gram"], "application/srgs+xml": ["grxml"], "application/sru+xml": ["sru"], "application/ssdl+xml": ["ssdl"], "application/ssml+xml": ["ssml"], "application/swid+xml": ["swidtag"], "application/tei+xml": ["tei", "teicorpus"], "application/thraud+xml": ["tfi"], "application/timestamped-data": ["tsd"], "application/toml": ["toml"], "application/trig": ["trig"], "application/ttml+xml": ["ttml"], "application/ubjson": ["ubj"], "application/urc-ressheet+xml": ["rsheet"], "application/urc-targetdesc+xml": ["td"], "application/voicexml+xml": ["vxml"], "application/wasm": ["wasm"], "application/widget": ["wgt"], "application/winhlp": ["hlp"], "application/wsdl+xml": ["wsdl"], "application/wspolicy+xml": ["wspolicy"], "application/xaml+xml": ["xaml"], "application/xcap-att+xml": ["xav"], "application/xcap-caps+xml": ["xca"], "application/xcap-diff+xml": ["xdf"], "application/xcap-el+xml": ["xel"], "application/xcap-ns+xml": ["xns"], "application/xenc+xml": ["xenc"], "application/xhtml+xml": ["xhtml", "xht"], "application/xliff+xml": ["xlf"], "application/xml": ["xml", "xsl", "xsd", "rng"], "application/xml-dtd": ["dtd"], "application/xop+xml": ["xop"], "application/xproc+xml": ["xpl"], "application/xslt+xml": ["*xsl", "xslt"], "application/xspf+xml": ["xspf"], "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"], "application/yang": ["yang"], "application/yin+xml": ["yin"], "application/zip": ["zip"], "audio/3gpp": ["*3gpp"], "audio/adpcm": ["adp"], "audio/amr": ["amr"], "audio/basic": ["au", "snd"], "audio/midi": ["mid", "midi", "kar", "rmi"], "audio/mobile-xmf": ["mxmf"], "audio/mp3": ["*mp3"], "audio/mp4": ["m4a", "mp4a"], "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"], "audio/ogg": ["oga", "ogg", "spx", "opus"], "audio/s3m": ["s3m"], "audio/silk": ["sil"], "audio/wav": ["wav"], "audio/wave": ["*wav"], "audio/webm": ["weba"], "audio/xm": ["xm"], "font/collection": ["ttc"], "font/otf": ["otf"], "font/ttf": ["ttf"], "font/woff": ["woff"], "font/woff2": ["woff2"], "image/aces": ["exr"], "image/apng": ["apng"], "image/avif": ["avif"], "image/bmp": ["bmp"], "image/cgm": ["cgm"], "image/dicom-rle": ["drle"], "image/emf": ["emf"], "image/fits": ["fits"], "image/g3fax": ["g3"], "image/gif": ["gif"], "image/heic": ["heic"], "image/heic-sequence": ["heics"], "image/heif": ["heif"], "image/heif-sequence": ["heifs"], "image/hej2k": ["hej2"], "image/hsj2": ["hsj2"], "image/ief": ["ief"], "image/jls": ["jls"], "image/jp2": ["jp2", "jpg2"], "image/jpeg": ["jpeg", "jpg", "jpe"], "image/jph": ["jph"], "image/jphc": ["jhc"], "image/jpm": ["jpm"], "image/jpx": ["jpx", "jpf"], "image/jxr": ["jxr"], "image/jxra": ["jxra"], "image/jxrs": ["jxrs"], "image/jxs": ["jxs"], "image/jxsc": ["jxsc"], "image/jxsi": ["jxsi"], "image/jxss": ["jxss"], "image/ktx": ["ktx"], "image/ktx2": ["ktx2"], "image/png": ["png"], "image/sgi": ["sgi"], "image/svg+xml": ["svg", "svgz"], "image/t38": ["t38"], "image/tiff": ["tif", "tiff"], "image/tiff-fx": ["tfx"], "image/webp": ["webp"], "image/wmf": ["wmf"], "message/disposition-notification": ["disposition-notification"], "message/global": ["u8msg"], "message/global-delivery-status": ["u8dsn"], "message/global-disposition-notification": ["u8mdn"], "message/global-headers": ["u8hdr"], "message/rfc822": ["eml", "mime"], "model/3mf": ["3mf"], "model/gltf+json": ["gltf"], "model/gltf-binary": ["glb"], "model/iges": ["igs", "iges"], "model/mesh": ["msh", "mesh", "silo"], "model/mtl": ["mtl"], "model/obj": ["obj"], "model/step+xml": ["stpx"], "model/step+zip": ["stpz"], "model/step-xml+zip": ["stpxz"], "model/stl": ["stl"], "model/vrml": ["wrl", "vrml"], "model/x3d+binary": ["*x3db", "x3dbz"], "model/x3d+fastinfoset": ["x3db"], "model/x3d+vrml": ["*x3dv", "x3dvz"], "model/x3d+xml": ["x3d", "x3dz"], "model/x3d-vrml": ["x3dv"], "text/cache-manifest": ["appcache", "manifest"], "text/calendar": ["ics", "ifb"], "text/coffeescript": ["coffee", "litcoffee"], "text/css": ["css"], "text/csv": ["csv"], "text/html": ["html", "htm", "shtml"], "text/jade": ["jade"], "text/jsx": ["jsx"], "text/less": ["less"], "text/markdown": ["markdown", "md"], "text/mathml": ["mml"], "text/mdx": ["mdx"], "text/n3": ["n3"], "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"], "text/richtext": ["rtx"], "text/rtf": ["*rtf"], "text/sgml": ["sgml", "sgm"], "text/shex": ["shex"], "text/slim": ["slim", "slm"], "text/spdx": ["spdx"], "text/stylus": ["stylus", "styl"], "text/tab-separated-values": ["tsv"], "text/troff": ["t", "tr", "roff", "man", "me", "ms"], "text/turtle": ["ttl"], "text/uri-list": ["uri", "uris", "urls"], "text/vcard": ["vcard"], "text/vtt": ["vtt"], "text/xml": ["*xml"], "text/yaml": ["yaml", "yml"], "video/3gpp": ["3gp", "3gpp"], "video/3gpp2": ["3g2"], "video/h261": ["h261"], "video/h263": ["h263"], "video/h264": ["h264"], "video/iso.segment": ["m4s"], "video/jpeg": ["jpgv"], "video/jpm": ["*jpm", "jpgm"], "video/mj2": ["mj2", "mjp2"], "video/mp2t": ["ts"], "video/mp4": ["mp4", "mp4v", "mpg4"], "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"], "video/ogg": ["ogv"], "video/quicktime": ["qt", "mov"], "video/webm": ["webm"] };
    other = { "application/prs.cww": ["cww"], "application/vnd.1000minds.decision-model+xml": ["1km"], "application/vnd.3gpp.pic-bw-large": ["plb"], "application/vnd.3gpp.pic-bw-small": ["psb"], "application/vnd.3gpp.pic-bw-var": ["pvb"], "application/vnd.3gpp2.tcap": ["tcap"], "application/vnd.3m.post-it-notes": ["pwn"], "application/vnd.accpac.simply.aso": ["aso"], "application/vnd.accpac.simply.imp": ["imp"], "application/vnd.acucobol": ["acu"], "application/vnd.acucorp": ["atc", "acutc"], "application/vnd.adobe.air-application-installer-package+zip": ["air"], "application/vnd.adobe.formscentral.fcdt": ["fcdt"], "application/vnd.adobe.fxp": ["fxp", "fxpl"], "application/vnd.adobe.xdp+xml": ["xdp"], "application/vnd.adobe.xfdf": ["xfdf"], "application/vnd.ahead.space": ["ahead"], "application/vnd.airzip.filesecure.azf": ["azf"], "application/vnd.airzip.filesecure.azs": ["azs"], "application/vnd.amazon.ebook": ["azw"], "application/vnd.americandynamics.acc": ["acc"], "application/vnd.amiga.ami": ["ami"], "application/vnd.android.package-archive": ["apk"], "application/vnd.anser-web-certificate-issue-initiation": ["cii"], "application/vnd.anser-web-funds-transfer-initiation": ["fti"], "application/vnd.antix.game-component": ["atx"], "application/vnd.apple.installer+xml": ["mpkg"], "application/vnd.apple.keynote": ["key"], "application/vnd.apple.mpegurl": ["m3u8"], "application/vnd.apple.numbers": ["numbers"], "application/vnd.apple.pages": ["pages"], "application/vnd.apple.pkpass": ["pkpass"], "application/vnd.aristanetworks.swi": ["swi"], "application/vnd.astraea-software.iota": ["iota"], "application/vnd.audiograph": ["aep"], "application/vnd.balsamiq.bmml+xml": ["bmml"], "application/vnd.blueice.multipass": ["mpm"], "application/vnd.bmi": ["bmi"], "application/vnd.businessobjects": ["rep"], "application/vnd.chemdraw+xml": ["cdxml"], "application/vnd.chipnuts.karaoke-mmd": ["mmd"], "application/vnd.cinderella": ["cdy"], "application/vnd.citationstyles.style+xml": ["csl"], "application/vnd.claymore": ["cla"], "application/vnd.cloanto.rp9": ["rp9"], "application/vnd.clonk.c4group": ["c4g", "c4d", "c4f", "c4p", "c4u"], "application/vnd.cluetrust.cartomobile-config": ["c11amc"], "application/vnd.cluetrust.cartomobile-config-pkg": ["c11amz"], "application/vnd.commonspace": ["csp"], "application/vnd.contact.cmsg": ["cdbcmsg"], "application/vnd.cosmocaller": ["cmc"], "application/vnd.crick.clicker": ["clkx"], "application/vnd.crick.clicker.keyboard": ["clkk"], "application/vnd.crick.clicker.palette": ["clkp"], "application/vnd.crick.clicker.template": ["clkt"], "application/vnd.crick.clicker.wordbank": ["clkw"], "application/vnd.criticaltools.wbs+xml": ["wbs"], "application/vnd.ctc-posml": ["pml"], "application/vnd.cups-ppd": ["ppd"], "application/vnd.curl.car": ["car"], "application/vnd.curl.pcurl": ["pcurl"], "application/vnd.dart": ["dart"], "application/vnd.data-vision.rdz": ["rdz"], "application/vnd.dbf": ["dbf"], "application/vnd.dece.data": ["uvf", "uvvf", "uvd", "uvvd"], "application/vnd.dece.ttml+xml": ["uvt", "uvvt"], "application/vnd.dece.unspecified": ["uvx", "uvvx"], "application/vnd.dece.zip": ["uvz", "uvvz"], "application/vnd.denovo.fcselayout-link": ["fe_launch"], "application/vnd.dna": ["dna"], "application/vnd.dolby.mlp": ["mlp"], "application/vnd.dpgraph": ["dpg"], "application/vnd.dreamfactory": ["dfac"], "application/vnd.ds-keypoint": ["kpxx"], "application/vnd.dvb.ait": ["ait"], "application/vnd.dvb.service": ["svc"], "application/vnd.dynageo": ["geo"], "application/vnd.ecowin.chart": ["mag"], "application/vnd.enliven": ["nml"], "application/vnd.epson.esf": ["esf"], "application/vnd.epson.msf": ["msf"], "application/vnd.epson.quickanime": ["qam"], "application/vnd.epson.salt": ["slt"], "application/vnd.epson.ssf": ["ssf"], "application/vnd.eszigno3+xml": ["es3", "et3"], "application/vnd.ezpix-album": ["ez2"], "application/vnd.ezpix-package": ["ez3"], "application/vnd.fdf": ["fdf"], "application/vnd.fdsn.mseed": ["mseed"], "application/vnd.fdsn.seed": ["seed", "dataless"], "application/vnd.flographit": ["gph"], "application/vnd.fluxtime.clip": ["ftc"], "application/vnd.framemaker": ["fm", "frame", "maker", "book"], "application/vnd.frogans.fnc": ["fnc"], "application/vnd.frogans.ltf": ["ltf"], "application/vnd.fsc.weblaunch": ["fsc"], "application/vnd.fujitsu.oasys": ["oas"], "application/vnd.fujitsu.oasys2": ["oa2"], "application/vnd.fujitsu.oasys3": ["oa3"], "application/vnd.fujitsu.oasysgp": ["fg5"], "application/vnd.fujitsu.oasysprs": ["bh2"], "application/vnd.fujixerox.ddd": ["ddd"], "application/vnd.fujixerox.docuworks": ["xdw"], "application/vnd.fujixerox.docuworks.binder": ["xbd"], "application/vnd.fuzzysheet": ["fzs"], "application/vnd.genomatix.tuxedo": ["txd"], "application/vnd.geogebra.file": ["ggb"], "application/vnd.geogebra.tool": ["ggt"], "application/vnd.geometry-explorer": ["gex", "gre"], "application/vnd.geonext": ["gxt"], "application/vnd.geoplan": ["g2w"], "application/vnd.geospace": ["g3w"], "application/vnd.gmx": ["gmx"], "application/vnd.google-apps.document": ["gdoc"], "application/vnd.google-apps.presentation": ["gslides"], "application/vnd.google-apps.spreadsheet": ["gsheet"], "application/vnd.google-earth.kml+xml": ["kml"], "application/vnd.google-earth.kmz": ["kmz"], "application/vnd.grafeq": ["gqf", "gqs"], "application/vnd.groove-account": ["gac"], "application/vnd.groove-help": ["ghf"], "application/vnd.groove-identity-message": ["gim"], "application/vnd.groove-injector": ["grv"], "application/vnd.groove-tool-message": ["gtm"], "application/vnd.groove-tool-template": ["tpl"], "application/vnd.groove-vcard": ["vcg"], "application/vnd.hal+xml": ["hal"], "application/vnd.handheld-entertainment+xml": ["zmm"], "application/vnd.hbci": ["hbci"], "application/vnd.hhe.lesson-player": ["les"], "application/vnd.hp-hpgl": ["hpgl"], "application/vnd.hp-hpid": ["hpid"], "application/vnd.hp-hps": ["hps"], "application/vnd.hp-jlyt": ["jlt"], "application/vnd.hp-pcl": ["pcl"], "application/vnd.hp-pclxl": ["pclxl"], "application/vnd.hydrostatix.sof-data": ["sfd-hdstx"], "application/vnd.ibm.minipay": ["mpy"], "application/vnd.ibm.modcap": ["afp", "listafp", "list3820"], "application/vnd.ibm.rights-management": ["irm"], "application/vnd.ibm.secure-container": ["sc"], "application/vnd.iccprofile": ["icc", "icm"], "application/vnd.igloader": ["igl"], "application/vnd.immervision-ivp": ["ivp"], "application/vnd.immervision-ivu": ["ivu"], "application/vnd.insors.igm": ["igm"], "application/vnd.intercon.formnet": ["xpw", "xpx"], "application/vnd.intergeo": ["i2g"], "application/vnd.intu.qbo": ["qbo"], "application/vnd.intu.qfx": ["qfx"], "application/vnd.ipunplugged.rcprofile": ["rcprofile"], "application/vnd.irepository.package+xml": ["irp"], "application/vnd.is-xpr": ["xpr"], "application/vnd.isac.fcs": ["fcs"], "application/vnd.jam": ["jam"], "application/vnd.jcp.javame.midlet-rms": ["rms"], "application/vnd.jisp": ["jisp"], "application/vnd.joost.joda-archive": ["joda"], "application/vnd.kahootz": ["ktz", "ktr"], "application/vnd.kde.karbon": ["karbon"], "application/vnd.kde.kchart": ["chrt"], "application/vnd.kde.kformula": ["kfo"], "application/vnd.kde.kivio": ["flw"], "application/vnd.kde.kontour": ["kon"], "application/vnd.kde.kpresenter": ["kpr", "kpt"], "application/vnd.kde.kspread": ["ksp"], "application/vnd.kde.kword": ["kwd", "kwt"], "application/vnd.kenameaapp": ["htke"], "application/vnd.kidspiration": ["kia"], "application/vnd.kinar": ["kne", "knp"], "application/vnd.koan": ["skp", "skd", "skt", "skm"], "application/vnd.kodak-descriptor": ["sse"], "application/vnd.las.las+xml": ["lasxml"], "application/vnd.llamagraphics.life-balance.desktop": ["lbd"], "application/vnd.llamagraphics.life-balance.exchange+xml": ["lbe"], "application/vnd.lotus-1-2-3": ["123"], "application/vnd.lotus-approach": ["apr"], "application/vnd.lotus-freelance": ["pre"], "application/vnd.lotus-notes": ["nsf"], "application/vnd.lotus-organizer": ["org"], "application/vnd.lotus-screencam": ["scm"], "application/vnd.lotus-wordpro": ["lwp"], "application/vnd.macports.portpkg": ["portpkg"], "application/vnd.mapbox-vector-tile": ["mvt"], "application/vnd.mcd": ["mcd"], "application/vnd.medcalcdata": ["mc1"], "application/vnd.mediastation.cdkey": ["cdkey"], "application/vnd.mfer": ["mwf"], "application/vnd.mfmp": ["mfm"], "application/vnd.micrografx.flo": ["flo"], "application/vnd.micrografx.igx": ["igx"], "application/vnd.mif": ["mif"], "application/vnd.mobius.daf": ["daf"], "application/vnd.mobius.dis": ["dis"], "application/vnd.mobius.mbk": ["mbk"], "application/vnd.mobius.mqy": ["mqy"], "application/vnd.mobius.msl": ["msl"], "application/vnd.mobius.plc": ["plc"], "application/vnd.mobius.txf": ["txf"], "application/vnd.mophun.application": ["mpn"], "application/vnd.mophun.certificate": ["mpc"], "application/vnd.mozilla.xul+xml": ["xul"], "application/vnd.ms-artgalry": ["cil"], "application/vnd.ms-cab-compressed": ["cab"], "application/vnd.ms-excel": ["xls", "xlm", "xla", "xlc", "xlt", "xlw"], "application/vnd.ms-excel.addin.macroenabled.12": ["xlam"], "application/vnd.ms-excel.sheet.binary.macroenabled.12": ["xlsb"], "application/vnd.ms-excel.sheet.macroenabled.12": ["xlsm"], "application/vnd.ms-excel.template.macroenabled.12": ["xltm"], "application/vnd.ms-fontobject": ["eot"], "application/vnd.ms-htmlhelp": ["chm"], "application/vnd.ms-ims": ["ims"], "application/vnd.ms-lrm": ["lrm"], "application/vnd.ms-officetheme": ["thmx"], "application/vnd.ms-outlook": ["msg"], "application/vnd.ms-pki.seccat": ["cat"], "application/vnd.ms-pki.stl": ["*stl"], "application/vnd.ms-powerpoint": ["ppt", "pps", "pot"], "application/vnd.ms-powerpoint.addin.macroenabled.12": ["ppam"], "application/vnd.ms-powerpoint.presentation.macroenabled.12": ["pptm"], "application/vnd.ms-powerpoint.slide.macroenabled.12": ["sldm"], "application/vnd.ms-powerpoint.slideshow.macroenabled.12": ["ppsm"], "application/vnd.ms-powerpoint.template.macroenabled.12": ["potm"], "application/vnd.ms-project": ["mpp", "mpt"], "application/vnd.ms-word.document.macroenabled.12": ["docm"], "application/vnd.ms-word.template.macroenabled.12": ["dotm"], "application/vnd.ms-works": ["wps", "wks", "wcm", "wdb"], "application/vnd.ms-wpl": ["wpl"], "application/vnd.ms-xpsdocument": ["xps"], "application/vnd.mseq": ["mseq"], "application/vnd.musician": ["mus"], "application/vnd.muvee.style": ["msty"], "application/vnd.mynfc": ["taglet"], "application/vnd.neurolanguage.nlu": ["nlu"], "application/vnd.nitf": ["ntf", "nitf"], "application/vnd.noblenet-directory": ["nnd"], "application/vnd.noblenet-sealer": ["nns"], "application/vnd.noblenet-web": ["nnw"], "application/vnd.nokia.n-gage.ac+xml": ["*ac"], "application/vnd.nokia.n-gage.data": ["ngdat"], "application/vnd.nokia.n-gage.symbian.install": ["n-gage"], "application/vnd.nokia.radio-preset": ["rpst"], "application/vnd.nokia.radio-presets": ["rpss"], "application/vnd.novadigm.edm": ["edm"], "application/vnd.novadigm.edx": ["edx"], "application/vnd.novadigm.ext": ["ext"], "application/vnd.oasis.opendocument.chart": ["odc"], "application/vnd.oasis.opendocument.chart-template": ["otc"], "application/vnd.oasis.opendocument.database": ["odb"], "application/vnd.oasis.opendocument.formula": ["odf"], "application/vnd.oasis.opendocument.formula-template": ["odft"], "application/vnd.oasis.opendocument.graphics": ["odg"], "application/vnd.oasis.opendocument.graphics-template": ["otg"], "application/vnd.oasis.opendocument.image": ["odi"], "application/vnd.oasis.opendocument.image-template": ["oti"], "application/vnd.oasis.opendocument.presentation": ["odp"], "application/vnd.oasis.opendocument.presentation-template": ["otp"], "application/vnd.oasis.opendocument.spreadsheet": ["ods"], "application/vnd.oasis.opendocument.spreadsheet-template": ["ots"], "application/vnd.oasis.opendocument.text": ["odt"], "application/vnd.oasis.opendocument.text-master": ["odm"], "application/vnd.oasis.opendocument.text-template": ["ott"], "application/vnd.oasis.opendocument.text-web": ["oth"], "application/vnd.olpc-sugar": ["xo"], "application/vnd.oma.dd2+xml": ["dd2"], "application/vnd.openblox.game+xml": ["obgx"], "application/vnd.openofficeorg.extension": ["oxt"], "application/vnd.openstreetmap.data+xml": ["osm"], "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["pptx"], "application/vnd.openxmlformats-officedocument.presentationml.slide": ["sldx"], "application/vnd.openxmlformats-officedocument.presentationml.slideshow": ["ppsx"], "application/vnd.openxmlformats-officedocument.presentationml.template": ["potx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.template": ["xltx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.template": ["dotx"], "application/vnd.osgeo.mapguide.package": ["mgp"], "application/vnd.osgi.dp": ["dp"], "application/vnd.osgi.subsystem": ["esa"], "application/vnd.palm": ["pdb", "pqa", "oprc"], "application/vnd.pawaafile": ["paw"], "application/vnd.pg.format": ["str"], "application/vnd.pg.osasli": ["ei6"], "application/vnd.picsel": ["efif"], "application/vnd.pmi.widget": ["wg"], "application/vnd.pocketlearn": ["plf"], "application/vnd.powerbuilder6": ["pbd"], "application/vnd.previewsystems.box": ["box"], "application/vnd.proteus.magazine": ["mgz"], "application/vnd.publishare-delta-tree": ["qps"], "application/vnd.pvi.ptid1": ["ptid"], "application/vnd.quark.quarkxpress": ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"], "application/vnd.rar": ["rar"], "application/vnd.realvnc.bed": ["bed"], "application/vnd.recordare.musicxml": ["mxl"], "application/vnd.recordare.musicxml+xml": ["musicxml"], "application/vnd.rig.cryptonote": ["cryptonote"], "application/vnd.rim.cod": ["cod"], "application/vnd.rn-realmedia": ["rm"], "application/vnd.rn-realmedia-vbr": ["rmvb"], "application/vnd.route66.link66+xml": ["link66"], "application/vnd.sailingtracker.track": ["st"], "application/vnd.seemail": ["see"], "application/vnd.sema": ["sema"], "application/vnd.semd": ["semd"], "application/vnd.semf": ["semf"], "application/vnd.shana.informed.formdata": ["ifm"], "application/vnd.shana.informed.formtemplate": ["itp"], "application/vnd.shana.informed.interchange": ["iif"], "application/vnd.shana.informed.package": ["ipk"], "application/vnd.simtech-mindmapper": ["twd", "twds"], "application/vnd.smaf": ["mmf"], "application/vnd.smart.teacher": ["teacher"], "application/vnd.software602.filler.form+xml": ["fo"], "application/vnd.solent.sdkm+xml": ["sdkm", "sdkd"], "application/vnd.spotfire.dxp": ["dxp"], "application/vnd.spotfire.sfs": ["sfs"], "application/vnd.stardivision.calc": ["sdc"], "application/vnd.stardivision.draw": ["sda"], "application/vnd.stardivision.impress": ["sdd"], "application/vnd.stardivision.math": ["smf"], "application/vnd.stardivision.writer": ["sdw", "vor"], "application/vnd.stardivision.writer-global": ["sgl"], "application/vnd.stepmania.package": ["smzip"], "application/vnd.stepmania.stepchart": ["sm"], "application/vnd.sun.wadl+xml": ["wadl"], "application/vnd.sun.xml.calc": ["sxc"], "application/vnd.sun.xml.calc.template": ["stc"], "application/vnd.sun.xml.draw": ["sxd"], "application/vnd.sun.xml.draw.template": ["std"], "application/vnd.sun.xml.impress": ["sxi"], "application/vnd.sun.xml.impress.template": ["sti"], "application/vnd.sun.xml.math": ["sxm"], "application/vnd.sun.xml.writer": ["sxw"], "application/vnd.sun.xml.writer.global": ["sxg"], "application/vnd.sun.xml.writer.template": ["stw"], "application/vnd.sus-calendar": ["sus", "susp"], "application/vnd.svd": ["svd"], "application/vnd.symbian.install": ["sis", "sisx"], "application/vnd.syncml+xml": ["xsm"], "application/vnd.syncml.dm+wbxml": ["bdm"], "application/vnd.syncml.dm+xml": ["xdm"], "application/vnd.syncml.dmddf+xml": ["ddf"], "application/vnd.tao.intent-module-archive": ["tao"], "application/vnd.tcpdump.pcap": ["pcap", "cap", "dmp"], "application/vnd.tmobile-livetv": ["tmo"], "application/vnd.trid.tpt": ["tpt"], "application/vnd.triscape.mxs": ["mxs"], "application/vnd.trueapp": ["tra"], "application/vnd.ufdl": ["ufd", "ufdl"], "application/vnd.uiq.theme": ["utz"], "application/vnd.umajin": ["umj"], "application/vnd.unity": ["unityweb"], "application/vnd.uoml+xml": ["uoml"], "application/vnd.vcx": ["vcx"], "application/vnd.visio": ["vsd", "vst", "vss", "vsw"], "application/vnd.visionary": ["vis"], "application/vnd.vsf": ["vsf"], "application/vnd.wap.wbxml": ["wbxml"], "application/vnd.wap.wmlc": ["wmlc"], "application/vnd.wap.wmlscriptc": ["wmlsc"], "application/vnd.webturbo": ["wtb"], "application/vnd.wolfram.player": ["nbp"], "application/vnd.wordperfect": ["wpd"], "application/vnd.wqd": ["wqd"], "application/vnd.wt.stf": ["stf"], "application/vnd.xara": ["xar"], "application/vnd.xfdl": ["xfdl"], "application/vnd.yamaha.hv-dic": ["hvd"], "application/vnd.yamaha.hv-script": ["hvs"], "application/vnd.yamaha.hv-voice": ["hvp"], "application/vnd.yamaha.openscoreformat": ["osf"], "application/vnd.yamaha.openscoreformat.osfpvg+xml": ["osfpvg"], "application/vnd.yamaha.smaf-audio": ["saf"], "application/vnd.yamaha.smaf-phrase": ["spf"], "application/vnd.yellowriver-custom-menu": ["cmp"], "application/vnd.zul": ["zir", "zirz"], "application/vnd.zzazz.deck+xml": ["zaz"], "application/x-7z-compressed": ["7z"], "application/x-abiword": ["abw"], "application/x-ace-compressed": ["ace"], "application/x-apple-diskimage": ["*dmg"], "application/x-arj": ["arj"], "application/x-authorware-bin": ["aab", "x32", "u32", "vox"], "application/x-authorware-map": ["aam"], "application/x-authorware-seg": ["aas"], "application/x-bcpio": ["bcpio"], "application/x-bdoc": ["*bdoc"], "application/x-bittorrent": ["torrent"], "application/x-blorb": ["blb", "blorb"], "application/x-bzip": ["bz"], "application/x-bzip2": ["bz2", "boz"], "application/x-cbr": ["cbr", "cba", "cbt", "cbz", "cb7"], "application/x-cdlink": ["vcd"], "application/x-cfs-compressed": ["cfs"], "application/x-chat": ["chat"], "application/x-chess-pgn": ["pgn"], "application/x-chrome-extension": ["crx"], "application/x-cocoa": ["cco"], "application/x-conference": ["nsc"], "application/x-cpio": ["cpio"], "application/x-csh": ["csh"], "application/x-debian-package": ["*deb", "udeb"], "application/x-dgc-compressed": ["dgc"], "application/x-director": ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"], "application/x-doom": ["wad"], "application/x-dtbncx+xml": ["ncx"], "application/x-dtbook+xml": ["dtb"], "application/x-dtbresource+xml": ["res"], "application/x-dvi": ["dvi"], "application/x-envoy": ["evy"], "application/x-eva": ["eva"], "application/x-font-bdf": ["bdf"], "application/x-font-ghostscript": ["gsf"], "application/x-font-linux-psf": ["psf"], "application/x-font-pcf": ["pcf"], "application/x-font-snf": ["snf"], "application/x-font-type1": ["pfa", "pfb", "pfm", "afm"], "application/x-freearc": ["arc"], "application/x-futuresplash": ["spl"], "application/x-gca-compressed": ["gca"], "application/x-glulx": ["ulx"], "application/x-gnumeric": ["gnumeric"], "application/x-gramps-xml": ["gramps"], "application/x-gtar": ["gtar"], "application/x-hdf": ["hdf"], "application/x-httpd-php": ["php"], "application/x-install-instructions": ["install"], "application/x-iso9660-image": ["*iso"], "application/x-iwork-keynote-sffkey": ["*key"], "application/x-iwork-numbers-sffnumbers": ["*numbers"], "application/x-iwork-pages-sffpages": ["*pages"], "application/x-java-archive-diff": ["jardiff"], "application/x-java-jnlp-file": ["jnlp"], "application/x-keepass2": ["kdbx"], "application/x-latex": ["latex"], "application/x-lua-bytecode": ["luac"], "application/x-lzh-compressed": ["lzh", "lha"], "application/x-makeself": ["run"], "application/x-mie": ["mie"], "application/x-mobipocket-ebook": ["prc", "mobi"], "application/x-ms-application": ["application"], "application/x-ms-shortcut": ["lnk"], "application/x-ms-wmd": ["wmd"], "application/x-ms-wmz": ["wmz"], "application/x-ms-xbap": ["xbap"], "application/x-msaccess": ["mdb"], "application/x-msbinder": ["obd"], "application/x-mscardfile": ["crd"], "application/x-msclip": ["clp"], "application/x-msdos-program": ["*exe"], "application/x-msdownload": ["*exe", "*dll", "com", "bat", "*msi"], "application/x-msmediaview": ["mvb", "m13", "m14"], "application/x-msmetafile": ["*wmf", "*wmz", "*emf", "emz"], "application/x-msmoney": ["mny"], "application/x-mspublisher": ["pub"], "application/x-msschedule": ["scd"], "application/x-msterminal": ["trm"], "application/x-mswrite": ["wri"], "application/x-netcdf": ["nc", "cdf"], "application/x-ns-proxy-autoconfig": ["pac"], "application/x-nzb": ["nzb"], "application/x-perl": ["pl", "pm"], "application/x-pilot": ["*prc", "*pdb"], "application/x-pkcs12": ["p12", "pfx"], "application/x-pkcs7-certificates": ["p7b", "spc"], "application/x-pkcs7-certreqresp": ["p7r"], "application/x-rar-compressed": ["*rar"], "application/x-redhat-package-manager": ["rpm"], "application/x-research-info-systems": ["ris"], "application/x-sea": ["sea"], "application/x-sh": ["sh"], "application/x-shar": ["shar"], "application/x-shockwave-flash": ["swf"], "application/x-silverlight-app": ["xap"], "application/x-sql": ["sql"], "application/x-stuffit": ["sit"], "application/x-stuffitx": ["sitx"], "application/x-subrip": ["srt"], "application/x-sv4cpio": ["sv4cpio"], "application/x-sv4crc": ["sv4crc"], "application/x-t3vm-image": ["t3"], "application/x-tads": ["gam"], "application/x-tar": ["tar"], "application/x-tcl": ["tcl", "tk"], "application/x-tex": ["tex"], "application/x-tex-tfm": ["tfm"], "application/x-texinfo": ["texinfo", "texi"], "application/x-tgif": ["*obj"], "application/x-ustar": ["ustar"], "application/x-virtualbox-hdd": ["hdd"], "application/x-virtualbox-ova": ["ova"], "application/x-virtualbox-ovf": ["ovf"], "application/x-virtualbox-vbox": ["vbox"], "application/x-virtualbox-vbox-extpack": ["vbox-extpack"], "application/x-virtualbox-vdi": ["vdi"], "application/x-virtualbox-vhd": ["vhd"], "application/x-virtualbox-vmdk": ["vmdk"], "application/x-wais-source": ["src"], "application/x-web-app-manifest+json": ["webapp"], "application/x-x509-ca-cert": ["der", "crt", "pem"], "application/x-xfig": ["fig"], "application/x-xliff+xml": ["*xlf"], "application/x-xpinstall": ["xpi"], "application/x-xz": ["xz"], "application/x-zmachine": ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"], "audio/vnd.dece.audio": ["uva", "uvva"], "audio/vnd.digital-winds": ["eol"], "audio/vnd.dra": ["dra"], "audio/vnd.dts": ["dts"], "audio/vnd.dts.hd": ["dtshd"], "audio/vnd.lucent.voice": ["lvp"], "audio/vnd.ms-playready.media.pya": ["pya"], "audio/vnd.nuera.ecelp4800": ["ecelp4800"], "audio/vnd.nuera.ecelp7470": ["ecelp7470"], "audio/vnd.nuera.ecelp9600": ["ecelp9600"], "audio/vnd.rip": ["rip"], "audio/x-aac": ["aac"], "audio/x-aiff": ["aif", "aiff", "aifc"], "audio/x-caf": ["caf"], "audio/x-flac": ["flac"], "audio/x-m4a": ["*m4a"], "audio/x-matroska": ["mka"], "audio/x-mpegurl": ["m3u"], "audio/x-ms-wax": ["wax"], "audio/x-ms-wma": ["wma"], "audio/x-pn-realaudio": ["ram", "ra"], "audio/x-pn-realaudio-plugin": ["rmp"], "audio/x-realaudio": ["*ra"], "audio/x-wav": ["*wav"], "chemical/x-cdx": ["cdx"], "chemical/x-cif": ["cif"], "chemical/x-cmdf": ["cmdf"], "chemical/x-cml": ["cml"], "chemical/x-csml": ["csml"], "chemical/x-xyz": ["xyz"], "image/prs.btif": ["btif"], "image/prs.pti": ["pti"], "image/vnd.adobe.photoshop": ["psd"], "image/vnd.airzip.accelerator.azv": ["azv"], "image/vnd.dece.graphic": ["uvi", "uvvi", "uvg", "uvvg"], "image/vnd.djvu": ["djvu", "djv"], "image/vnd.dvb.subtitle": ["*sub"], "image/vnd.dwg": ["dwg"], "image/vnd.dxf": ["dxf"], "image/vnd.fastbidsheet": ["fbs"], "image/vnd.fpx": ["fpx"], "image/vnd.fst": ["fst"], "image/vnd.fujixerox.edmics-mmr": ["mmr"], "image/vnd.fujixerox.edmics-rlc": ["rlc"], "image/vnd.microsoft.icon": ["ico"], "image/vnd.ms-dds": ["dds"], "image/vnd.ms-modi": ["mdi"], "image/vnd.ms-photo": ["wdp"], "image/vnd.net-fpx": ["npx"], "image/vnd.pco.b16": ["b16"], "image/vnd.tencent.tap": ["tap"], "image/vnd.valve.source.texture": ["vtf"], "image/vnd.wap.wbmp": ["wbmp"], "image/vnd.xiff": ["xif"], "image/vnd.zbrush.pcx": ["pcx"], "image/x-3ds": ["3ds"], "image/x-cmu-raster": ["ras"], "image/x-cmx": ["cmx"], "image/x-freehand": ["fh", "fhc", "fh4", "fh5", "fh7"], "image/x-icon": ["*ico"], "image/x-jng": ["jng"], "image/x-mrsid-image": ["sid"], "image/x-ms-bmp": ["*bmp"], "image/x-pcx": ["*pcx"], "image/x-pict": ["pic", "pct"], "image/x-portable-anymap": ["pnm"], "image/x-portable-bitmap": ["pbm"], "image/x-portable-graymap": ["pgm"], "image/x-portable-pixmap": ["ppm"], "image/x-rgb": ["rgb"], "image/x-tga": ["tga"], "image/x-xbitmap": ["xbm"], "image/x-xpixmap": ["xpm"], "image/x-xwindowdump": ["xwd"], "message/vnd.wfa.wsc": ["wsc"], "model/vnd.collada+xml": ["dae"], "model/vnd.dwf": ["dwf"], "model/vnd.gdl": ["gdl"], "model/vnd.gtw": ["gtw"], "model/vnd.mts": ["mts"], "model/vnd.opengex": ["ogex"], "model/vnd.parasolid.transmit.binary": ["x_b"], "model/vnd.parasolid.transmit.text": ["x_t"], "model/vnd.sap.vds": ["vds"], "model/vnd.usdz+zip": ["usdz"], "model/vnd.valve.source.compiled-map": ["bsp"], "model/vnd.vtu": ["vtu"], "text/prs.lines.tag": ["dsc"], "text/vnd.curl": ["curl"], "text/vnd.curl.dcurl": ["dcurl"], "text/vnd.curl.mcurl": ["mcurl"], "text/vnd.curl.scurl": ["scurl"], "text/vnd.dvb.subtitle": ["sub"], "text/vnd.fly": ["fly"], "text/vnd.fmi.flexstor": ["flx"], "text/vnd.graphviz": ["gv"], "text/vnd.in3d.3dml": ["3dml"], "text/vnd.in3d.spot": ["spot"], "text/vnd.sun.j2me.app-descriptor": ["jad"], "text/vnd.wap.wml": ["wml"], "text/vnd.wap.wmlscript": ["wmls"], "text/x-asm": ["s", "asm"], "text/x-c": ["c", "cc", "cxx", "cpp", "h", "hh", "dic"], "text/x-component": ["htc"], "text/x-fortran": ["f", "for", "f77", "f90"], "text/x-handlebars-template": ["hbs"], "text/x-java-source": ["java"], "text/x-lua": ["lua"], "text/x-markdown": ["mkd"], "text/x-nfo": ["nfo"], "text/x-opml": ["opml"], "text/x-org": ["*org"], "text/x-pascal": ["p", "pas"], "text/x-processing": ["pde"], "text/x-sass": ["sass"], "text/x-scss": ["scss"], "text/x-setext": ["etx"], "text/x-sfv": ["sfv"], "text/x-suse-ymp": ["ymp"], "text/x-uuencode": ["uu"], "text/x-vcalendar": ["vcs"], "text/x-vcard": ["vcf"], "video/vnd.dece.hd": ["uvh", "uvvh"], "video/vnd.dece.mobile": ["uvm", "uvvm"], "video/vnd.dece.pd": ["uvp", "uvvp"], "video/vnd.dece.sd": ["uvs", "uvvs"], "video/vnd.dece.video": ["uvv", "uvvv"], "video/vnd.dvb.file": ["dvb"], "video/vnd.fvt": ["fvt"], "video/vnd.mpegurl": ["mxu", "m4u"], "video/vnd.ms-playready.media.pyv": ["pyv"], "video/vnd.uvvu.mp4": ["uvu", "uvvu"], "video/vnd.vivo": ["viv"], "video/x-f4v": ["f4v"], "video/x-fli": ["fli"], "video/x-flv": ["flv"], "video/x-m4v": ["m4v"], "video/x-matroska": ["mkv", "mk3d", "mks"], "video/x-mng": ["mng"], "video/x-ms-asf": ["asf", "asx"], "video/x-ms-vob": ["vob"], "video/x-ms-wm": ["wm"], "video/x-ms-wmv": ["wmv"], "video/x-ms-wmx": ["wmx"], "video/x-ms-wvx": ["wvx"], "video/x-msvideo": ["avi"], "video/x-sgi-movie": ["movie"], "video/x-smv": ["smv"], "x-conference/x-cooltalk": ["ice"] };
    Mime = Mime_1;
    mime = new Mime(standard, other);
    mime$1 = /* @__PURE__ */ getDefaultExportFromCjs(mime);
    parse_1 = parse$1;
    serialize_1 = serialize;
    __toString = Object.prototype.toString;
    fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    DELETED_EXPIRATION = /* @__PURE__ */ new Date(0);
    DELETED_VALUE = "deleted";
    responseSentSymbol$2 = Symbol.for("astro.responseSent");
    AstroCookie = class {
      constructor(value) {
        this.value = value;
      }
      json() {
        if (this.value === void 0) {
          throw new Error(`Cannot convert undefined to an object.`);
        }
        return JSON.parse(this.value);
      }
      number() {
        return Number(this.value);
      }
      boolean() {
        if (this.value === "false")
          return false;
        if (this.value === "0")
          return false;
        return Boolean(this.value);
      }
    };
    AstroCookies = class {
      constructor(request) {
        __privateAdd(this, _ensureParsed);
        __privateAdd(this, _ensureOutgoingMap);
        __privateAdd(this, _parse);
        __privateAdd(this, _request, void 0);
        __privateAdd(this, _requestValues, void 0);
        __privateAdd(this, _outgoing, void 0);
        __privateSet(this, _request, request);
        __privateSet(this, _requestValues, null);
        __privateSet(this, _outgoing, null);
      }
      delete(key, options) {
        const serializeOptions = {
          expires: DELETED_EXPIRATION
        };
        if (options == null ? void 0 : options.domain) {
          serializeOptions.domain = options.domain;
        }
        if (options == null ? void 0 : options.path) {
          serializeOptions.path = options.path;
        }
        __privateMethod(this, _ensureOutgoingMap, ensureOutgoingMap_fn).call(this).set(key, [
          DELETED_VALUE,
          serialize_1(key, DELETED_VALUE, serializeOptions),
          false
        ]);
      }
      get(key) {
        if (__privateGet(this, _outgoing) !== null && __privateGet(this, _outgoing).has(key)) {
          let [serializedValue, , isSetValue] = __privateGet(this, _outgoing).get(key);
          if (isSetValue) {
            return new AstroCookie(serializedValue);
          } else {
            return new AstroCookie(void 0);
          }
        }
        const values = __privateMethod(this, _ensureParsed, ensureParsed_fn).call(this);
        const value = values[key];
        return new AstroCookie(value);
      }
      has(key) {
        if (__privateGet(this, _outgoing) !== null && __privateGet(this, _outgoing).has(key)) {
          let [, , isSetValue] = __privateGet(this, _outgoing).get(key);
          return isSetValue;
        }
        const values = __privateMethod(this, _ensureParsed, ensureParsed_fn).call(this);
        return !!values[key];
      }
      set(key, value, options) {
        let serializedValue;
        if (typeof value === "string") {
          serializedValue = value;
        } else {
          let toStringValue = value.toString();
          if (toStringValue === Object.prototype.toString.call(value)) {
            serializedValue = JSON.stringify(value);
          } else {
            serializedValue = toStringValue;
          }
        }
        const serializeOptions = {};
        if (options) {
          Object.assign(serializeOptions, options);
        }
        __privateMethod(this, _ensureOutgoingMap, ensureOutgoingMap_fn).call(this).set(key, [
          serializedValue,
          serialize_1(key, serializedValue, serializeOptions),
          true
        ]);
        if (__privateGet(this, _request)[responseSentSymbol$2]) {
          throw new AstroError({
            ...AstroErrorData.ResponseSentError
          });
        }
      }
      *headers() {
        if (__privateGet(this, _outgoing) == null)
          return;
        for (const [, value] of __privateGet(this, _outgoing)) {
          yield value[1];
        }
      }
    };
    _request = new WeakMap();
    _requestValues = new WeakMap();
    _outgoing = new WeakMap();
    _ensureParsed = new WeakSet();
    ensureParsed_fn = function() {
      if (!__privateGet(this, _requestValues)) {
        __privateMethod(this, _parse, parse_fn).call(this);
      }
      if (!__privateGet(this, _requestValues)) {
        __privateSet(this, _requestValues, {});
      }
      return __privateGet(this, _requestValues);
    };
    _ensureOutgoingMap = new WeakSet();
    ensureOutgoingMap_fn = function() {
      if (!__privateGet(this, _outgoing)) {
        __privateSet(this, _outgoing, /* @__PURE__ */ new Map());
      }
      return __privateGet(this, _outgoing);
    };
    _parse = new WeakSet();
    parse_fn = function() {
      const raw = __privateGet(this, _request).headers.get("cookie");
      if (!raw) {
        return;
      }
      __privateSet(this, _requestValues, parse_1(raw));
    };
    astroCookiesSymbol = Symbol.for("astro.cookies");
    isTTY = true;
    if (typeof process !== "undefined") {
      ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
      isTTY = process.stdout && process.stdout.isTTY;
    }
    $ = {
      enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
    };
    reset = init(0, 0);
    bold = init(1, 22);
    dim = init(2, 22);
    red = init(31, 39);
    yellow = init(33, 39);
    cyan = init(36, 39);
    eastasianwidth = { exports: {} };
    (function(module) {
      var eaw = {};
      {
        module.exports = eaw;
      }
      eaw.eastAsianWidth = function(character) {
        var x2 = character.charCodeAt(0);
        var y2 = character.length == 2 ? character.charCodeAt(1) : 0;
        var codePoint = x2;
        if (55296 <= x2 && x2 <= 56319 && (56320 <= y2 && y2 <= 57343)) {
          x2 &= 1023;
          y2 &= 1023;
          codePoint = x2 << 10 | y2;
          codePoint += 65536;
        }
        if (12288 == codePoint || 65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510) {
          return "F";
        }
        if (8361 == codePoint || 65377 <= codePoint && codePoint <= 65470 || 65474 <= codePoint && codePoint <= 65479 || 65482 <= codePoint && codePoint <= 65487 || 65490 <= codePoint && codePoint <= 65495 || 65498 <= codePoint && codePoint <= 65500 || 65512 <= codePoint && codePoint <= 65518) {
          return "H";
        }
        if (4352 <= codePoint && codePoint <= 4447 || 4515 <= codePoint && codePoint <= 4519 || 4602 <= codePoint && codePoint <= 4607 || 9001 <= codePoint && codePoint <= 9002 || 11904 <= codePoint && codePoint <= 11929 || 11931 <= codePoint && codePoint <= 12019 || 12032 <= codePoint && codePoint <= 12245 || 12272 <= codePoint && codePoint <= 12283 || 12289 <= codePoint && codePoint <= 12350 || 12353 <= codePoint && codePoint <= 12438 || 12441 <= codePoint && codePoint <= 12543 || 12549 <= codePoint && codePoint <= 12589 || 12593 <= codePoint && codePoint <= 12686 || 12688 <= codePoint && codePoint <= 12730 || 12736 <= codePoint && codePoint <= 12771 || 12784 <= codePoint && codePoint <= 12830 || 12832 <= codePoint && codePoint <= 12871 || 12880 <= codePoint && codePoint <= 13054 || 13056 <= codePoint && codePoint <= 19903 || 19968 <= codePoint && codePoint <= 42124 || 42128 <= codePoint && codePoint <= 42182 || 43360 <= codePoint && codePoint <= 43388 || 44032 <= codePoint && codePoint <= 55203 || 55216 <= codePoint && codePoint <= 55238 || 55243 <= codePoint && codePoint <= 55291 || 63744 <= codePoint && codePoint <= 64255 || 65040 <= codePoint && codePoint <= 65049 || 65072 <= codePoint && codePoint <= 65106 || 65108 <= codePoint && codePoint <= 65126 || 65128 <= codePoint && codePoint <= 65131 || 110592 <= codePoint && codePoint <= 110593 || 127488 <= codePoint && codePoint <= 127490 || 127504 <= codePoint && codePoint <= 127546 || 127552 <= codePoint && codePoint <= 127560 || 127568 <= codePoint && codePoint <= 127569 || 131072 <= codePoint && codePoint <= 194367 || 177984 <= codePoint && codePoint <= 196605 || 196608 <= codePoint && codePoint <= 262141) {
          return "W";
        }
        if (32 <= codePoint && codePoint <= 126 || 162 <= codePoint && codePoint <= 163 || 165 <= codePoint && codePoint <= 166 || 172 == codePoint || 175 == codePoint || 10214 <= codePoint && codePoint <= 10221 || 10629 <= codePoint && codePoint <= 10630) {
          return "Na";
        }
        if (161 == codePoint || 164 == codePoint || 167 <= codePoint && codePoint <= 168 || 170 == codePoint || 173 <= codePoint && codePoint <= 174 || 176 <= codePoint && codePoint <= 180 || 182 <= codePoint && codePoint <= 186 || 188 <= codePoint && codePoint <= 191 || 198 == codePoint || 208 == codePoint || 215 <= codePoint && codePoint <= 216 || 222 <= codePoint && codePoint <= 225 || 230 == codePoint || 232 <= codePoint && codePoint <= 234 || 236 <= codePoint && codePoint <= 237 || 240 == codePoint || 242 <= codePoint && codePoint <= 243 || 247 <= codePoint && codePoint <= 250 || 252 == codePoint || 254 == codePoint || 257 == codePoint || 273 == codePoint || 275 == codePoint || 283 == codePoint || 294 <= codePoint && codePoint <= 295 || 299 == codePoint || 305 <= codePoint && codePoint <= 307 || 312 == codePoint || 319 <= codePoint && codePoint <= 322 || 324 == codePoint || 328 <= codePoint && codePoint <= 331 || 333 == codePoint || 338 <= codePoint && codePoint <= 339 || 358 <= codePoint && codePoint <= 359 || 363 == codePoint || 462 == codePoint || 464 == codePoint || 466 == codePoint || 468 == codePoint || 470 == codePoint || 472 == codePoint || 474 == codePoint || 476 == codePoint || 593 == codePoint || 609 == codePoint || 708 == codePoint || 711 == codePoint || 713 <= codePoint && codePoint <= 715 || 717 == codePoint || 720 == codePoint || 728 <= codePoint && codePoint <= 731 || 733 == codePoint || 735 == codePoint || 768 <= codePoint && codePoint <= 879 || 913 <= codePoint && codePoint <= 929 || 931 <= codePoint && codePoint <= 937 || 945 <= codePoint && codePoint <= 961 || 963 <= codePoint && codePoint <= 969 || 1025 == codePoint || 1040 <= codePoint && codePoint <= 1103 || 1105 == codePoint || 8208 == codePoint || 8211 <= codePoint && codePoint <= 8214 || 8216 <= codePoint && codePoint <= 8217 || 8220 <= codePoint && codePoint <= 8221 || 8224 <= codePoint && codePoint <= 8226 || 8228 <= codePoint && codePoint <= 8231 || 8240 == codePoint || 8242 <= codePoint && codePoint <= 8243 || 8245 == codePoint || 8251 == codePoint || 8254 == codePoint || 8308 == codePoint || 8319 == codePoint || 8321 <= codePoint && codePoint <= 8324 || 8364 == codePoint || 8451 == codePoint || 8453 == codePoint || 8457 == codePoint || 8467 == codePoint || 8470 == codePoint || 8481 <= codePoint && codePoint <= 8482 || 8486 == codePoint || 8491 == codePoint || 8531 <= codePoint && codePoint <= 8532 || 8539 <= codePoint && codePoint <= 8542 || 8544 <= codePoint && codePoint <= 8555 || 8560 <= codePoint && codePoint <= 8569 || 8585 == codePoint || 8592 <= codePoint && codePoint <= 8601 || 8632 <= codePoint && codePoint <= 8633 || 8658 == codePoint || 8660 == codePoint || 8679 == codePoint || 8704 == codePoint || 8706 <= codePoint && codePoint <= 8707 || 8711 <= codePoint && codePoint <= 8712 || 8715 == codePoint || 8719 == codePoint || 8721 == codePoint || 8725 == codePoint || 8730 == codePoint || 8733 <= codePoint && codePoint <= 8736 || 8739 == codePoint || 8741 == codePoint || 8743 <= codePoint && codePoint <= 8748 || 8750 == codePoint || 8756 <= codePoint && codePoint <= 8759 || 8764 <= codePoint && codePoint <= 8765 || 8776 == codePoint || 8780 == codePoint || 8786 == codePoint || 8800 <= codePoint && codePoint <= 8801 || 8804 <= codePoint && codePoint <= 8807 || 8810 <= codePoint && codePoint <= 8811 || 8814 <= codePoint && codePoint <= 8815 || 8834 <= codePoint && codePoint <= 8835 || 8838 <= codePoint && codePoint <= 8839 || 8853 == codePoint || 8857 == codePoint || 8869 == codePoint || 8895 == codePoint || 8978 == codePoint || 9312 <= codePoint && codePoint <= 9449 || 9451 <= codePoint && codePoint <= 9547 || 9552 <= codePoint && codePoint <= 9587 || 9600 <= codePoint && codePoint <= 9615 || 9618 <= codePoint && codePoint <= 9621 || 9632 <= codePoint && codePoint <= 9633 || 9635 <= codePoint && codePoint <= 9641 || 9650 <= codePoint && codePoint <= 9651 || 9654 <= codePoint && codePoint <= 9655 || 9660 <= codePoint && codePoint <= 9661 || 9664 <= codePoint && codePoint <= 9665 || 9670 <= codePoint && codePoint <= 9672 || 9675 == codePoint || 9678 <= codePoint && codePoint <= 9681 || 9698 <= codePoint && codePoint <= 9701 || 9711 == codePoint || 9733 <= codePoint && codePoint <= 9734 || 9737 == codePoint || 9742 <= codePoint && codePoint <= 9743 || 9748 <= codePoint && codePoint <= 9749 || 9756 == codePoint || 9758 == codePoint || 9792 == codePoint || 9794 == codePoint || 9824 <= codePoint && codePoint <= 9825 || 9827 <= codePoint && codePoint <= 9829 || 9831 <= codePoint && codePoint <= 9834 || 9836 <= codePoint && codePoint <= 9837 || 9839 == codePoint || 9886 <= codePoint && codePoint <= 9887 || 9918 <= codePoint && codePoint <= 9919 || 9924 <= codePoint && codePoint <= 9933 || 9935 <= codePoint && codePoint <= 9953 || 9955 == codePoint || 9960 <= codePoint && codePoint <= 9983 || 10045 == codePoint || 10071 == codePoint || 10102 <= codePoint && codePoint <= 10111 || 11093 <= codePoint && codePoint <= 11097 || 12872 <= codePoint && codePoint <= 12879 || 57344 <= codePoint && codePoint <= 63743 || 65024 <= codePoint && codePoint <= 65039 || 65533 == codePoint || 127232 <= codePoint && codePoint <= 127242 || 127248 <= codePoint && codePoint <= 127277 || 127280 <= codePoint && codePoint <= 127337 || 127344 <= codePoint && codePoint <= 127386 || 917760 <= codePoint && codePoint <= 917999 || 983040 <= codePoint && codePoint <= 1048573 || 1048576 <= codePoint && codePoint <= 1114109) {
          return "A";
        }
        return "N";
      };
      eaw.characterLength = function(character) {
        var code = this.eastAsianWidth(character);
        if (code == "F" || code == "W" || code == "A") {
          return 2;
        } else {
          return 1;
        }
      };
      function stringToArray(string) {
        return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
      }
      eaw.length = function(string) {
        var characters = stringToArray(string);
        var len = 0;
        for (var i = 0; i < characters.length; i++) {
          len = len + this.characterLength(characters[i]);
        }
        return len;
      };
      eaw.slice = function(text, start, end) {
        textLen = eaw.length(text);
        start = start ? start : 0;
        end = end ? end : 1;
        if (start < 0) {
          start = textLen + start;
        }
        if (end < 0) {
          end = textLen + end;
        }
        var result = "";
        var eawLen = 0;
        var chars = stringToArray(text);
        for (var i = 0; i < chars.length; i++) {
          var char = chars[i];
          var charLen = eaw.length(char);
          if (eawLen >= start - (charLen == 2 ? 1 : 0)) {
            if (eawLen + charLen <= end) {
              result += char;
            } else {
              break;
            }
          }
          eawLen += charLen;
        }
        return result;
      };
    })(eastasianwidth);
    dateTimeFormat = new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    levels = {
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      silent: 90
    };
    if (typeof process !== "undefined") {
      let proc = process;
      if ("argv" in proc && Array.isArray(proc.argv)) {
        if (proc.argv.includes("--verbose"))
          ;
        else if (proc.argv.includes("--silent"))
          ;
        else
          ;
      }
    }
    clientAddressSymbol$1 = Symbol.for("astro.clientAddress");
    clientLocalsSymbol$1 = Symbol.for("astro.locals");
    lastMessageCount = 1;
    consoleLogDestination = {
      write(event) {
        let dest = console.error;
        if (levels[event.level] < levels["error"]) {
          dest = console.log;
        }
        function getPrefix() {
          let prefix = "";
          let type = event.type;
          if (type) {
            prefix += dim(dateTimeFormat.format(/* @__PURE__ */ new Date()) + " ");
            if (event.level === "info") {
              type = bold(cyan(`[${type}]`));
            } else if (event.level === "warn") {
              type = bold(yellow(`[${type}]`));
            } else if (event.level === "error") {
              type = bold(red(`[${type}]`));
            }
            prefix += `${type} `;
          }
          return reset(prefix);
        }
        let message = event.message;
        if (message === lastMessage) {
          lastMessageCount++;
          message = `${message} ${yellow(`(x${lastMessageCount})`)}`;
        } else {
          lastMessage = message;
          lastMessageCount = 1;
        }
        const outMessage = getPrefix() + message;
        dest(outMessage);
        return true;
      }
    };
    RedirectComponentInstance = {
      default() {
        return new Response(null, {
          status: 301
        });
      }
    };
    StaticMiddlewareInstance = {
      onRequest: (ctx, next) => next()
    };
    RedirectSinglePageBuiltModule = {
      page: () => Promise.resolve(RedirectComponentInstance),
      middleware: StaticMiddlewareInstance,
      renderers: []
    };
    VALID_PARAM_TYPES = ["string", "number", "undefined"];
    clientAddressSymbol = Symbol.for("astro.clientAddress");
    responseSentSymbol$1 = Symbol.for("astro.responseSent");
    Slots = class {
      constructor(result, slots, logging) {
        __privateAdd(this, _result, void 0);
        __privateAdd(this, _slots, void 0);
        __privateAdd(this, _loggingOpts, void 0);
        __privateSet(this, _result, result);
        __privateSet(this, _slots, slots);
        __privateSet(this, _loggingOpts, logging);
        if (slots) {
          for (const key of Object.keys(slots)) {
            if (this[key] !== void 0) {
              throw new AstroError({
                ...AstroErrorData.ReservedSlotName,
                message: AstroErrorData.ReservedSlotName.message(key)
              });
            }
            Object.defineProperty(this, key, {
              get() {
                return true;
              },
              enumerable: true
            });
          }
        }
      }
      has(name) {
        if (!__privateGet(this, _slots))
          return false;
        return Boolean(__privateGet(this, _slots)[name]);
      }
      async render(name, args = []) {
        if (!__privateGet(this, _slots) || !this.has(name))
          return;
        const result = __privateGet(this, _result);
        if (!Array.isArray(args)) {
          warn(
            __privateGet(this, _loggingOpts),
            "Astro.slots.render",
            `Expected second parameter to be an array, received a ${typeof args}. If you're trying to pass an array as a single argument and getting unexpected results, make sure you're passing your array as a item of an array. Ex: Astro.slots.render('default', [["Hello", "World"]])`
          );
        } else if (args.length > 0) {
          const slotValue = __privateGet(this, _slots)[name];
          const component = typeof slotValue === "function" ? await slotValue(result) : await slotValue;
          const expression = getFunctionExpression(component);
          if (expression) {
            const slot = async () => isHTMLString(await expression) ? expression : expression(...args);
            return await renderSlotToString(result, slot).then((res) => {
              return res != null ? String(res) : res;
            });
          }
          if (typeof component === "function") {
            return await renderJSX(result, component(...args)).then(
              (res) => res != null ? String(res) : res
            );
          }
        }
        const content = await renderSlotToString(result, __privateGet(this, _slots)[name]);
        const outHTML = stringifyChunk(result, content);
        return outHTML;
      }
    };
    _result = new WeakMap();
    _slots = new WeakMap();
    _loggingOpts = new WeakMap();
    renderMarkdown = null;
    RouteCache = class {
      constructor(logging, mode = "production") {
        this.cache = {};
        this.logging = logging;
        this.mode = mode;
      }
      clearAll() {
        this.cache = {};
      }
      set(route, entry) {
        if (this.mode === "production" && this.cache[route.component]) {
          warn(
            this.logging,
            "routeCache",
            `Internal Warning: route cache overwritten. (${route.component})`
          );
        }
        this.cache[route.component] = entry;
      }
      get(route) {
        return this.cache[route.component];
      }
    };
    clientLocalsSymbol = Symbol.for("astro.locals");
    responseSentSymbol = Symbol.for("astro.responseSent");
    App = class {
      constructor(manifest, streaming = true) {
        __privateAdd(this, _getModuleForRoute);
        __privateAdd(this, _renderPage);
        __privateAdd(this, _callEndpoint);
        __privateAdd(this, _env, void 0);
        __privateAdd(this, _manifest, void 0);
        __privateAdd(this, _manifestData, void 0);
        __privateAdd(this, _routeDataToRouteInfo, void 0);
        __privateAdd(this, _encoder, new TextEncoder());
        __privateAdd(this, _logging, {
          dest: consoleLogDestination,
          level: "info"
        });
        __privateAdd(this, _base, void 0);
        __privateAdd(this, _baseWithoutTrailingSlash, void 0);
        __privateSet(this, _manifest, manifest);
        __privateSet(this, _manifestData, {
          routes: manifest.routes.map((route) => route.routeData)
        });
        __privateSet(this, _routeDataToRouteInfo, new Map(manifest.routes.map((route) => [route.routeData, route])));
        __privateSet(this, _env, createEnvironment({
          adapterName: manifest.adapterName,
          logging: __privateGet(this, _logging),
          markdown: manifest.markdown,
          mode: "production",
          renderers: manifest.renderers,
          clientDirectives: manifest.clientDirectives,
          async resolve(specifier) {
            if (!(specifier in manifest.entryModules)) {
              throw new Error(`Unable to resolve [${specifier}]`);
            }
            const bundlePath = manifest.entryModules[specifier];
            switch (true) {
              case bundlePath.startsWith("data:"):
              case bundlePath.length === 0: {
                return bundlePath;
              }
              default: {
                return createAssetLink(bundlePath, manifest.base, manifest.assetsPrefix);
              }
            }
          },
          routeCache: new RouteCache(__privateGet(this, _logging)),
          site: __privateGet(this, _manifest).site,
          ssr: true,
          streaming
        }));
        __privateSet(this, _base, __privateGet(this, _manifest).base || "/");
        __privateSet(this, _baseWithoutTrailingSlash, removeTrailingForwardSlash(__privateGet(this, _base)));
      }
      removeBase(pathname) {
        if (pathname.startsWith(__privateGet(this, _base))) {
          return pathname.slice(__privateGet(this, _baseWithoutTrailingSlash).length + 1);
        }
        return pathname;
      }
      match(request, { matchNotFound = false } = {}) {
        const url = new URL(request.url);
        if (__privateGet(this, _manifest).assets.has(url.pathname)) {
          return void 0;
        }
        let pathname = prependForwardSlash(this.removeBase(url.pathname));
        let routeData = matchRoute(pathname, __privateGet(this, _manifestData));
        if (routeData) {
          if (routeData.prerender)
            return void 0;
          return routeData;
        } else if (matchNotFound) {
          const notFoundRouteData = matchRoute("/404", __privateGet(this, _manifestData));
          if (notFoundRouteData == null ? void 0 : notFoundRouteData.prerender)
            return void 0;
          return notFoundRouteData;
        } else {
          return void 0;
        }
      }
      async render(request, routeData) {
        let defaultStatus = 200;
        if (!routeData) {
          routeData = this.match(request);
          if (!routeData) {
            defaultStatus = 404;
            routeData = this.match(request, { matchNotFound: true });
          }
          if (!routeData) {
            return new Response(null, {
              status: 404,
              statusText: "Not found"
            });
          }
        }
        Reflect.set(request, clientLocalsSymbol, {});
        if (routeData.route === "/404") {
          defaultStatus = 404;
        }
        let mod = await __privateMethod(this, _getModuleForRoute, getModuleForRoute_fn).call(this, routeData);
        if (routeData.type === "page" || routeData.type === "redirect") {
          let response = await __privateMethod(this, _renderPage, renderPage_fn).call(this, request, routeData, mod, defaultStatus);
          if (response.status === 500 || response.status === 404) {
            const errorRouteData = matchRoute("/" + response.status, __privateGet(this, _manifestData));
            if (errorRouteData && errorRouteData.route !== routeData.route) {
              mod = await __privateMethod(this, _getModuleForRoute, getModuleForRoute_fn).call(this, errorRouteData);
              try {
                let errorResponse = await __privateMethod(this, _renderPage, renderPage_fn).call(this, request, errorRouteData, mod, response.status);
                return errorResponse;
              } catch {
              }
            }
          }
          return response;
        } else if (routeData.type === "endpoint") {
          return __privateMethod(this, _callEndpoint, callEndpoint_fn).call(this, request, routeData, mod, defaultStatus);
        } else {
          throw new Error(`Unsupported route type [${routeData.type}].`);
        }
      }
      setCookieHeaders(response) {
        return getSetCookiesFromResponse(response);
      }
    };
    _env = new WeakMap();
    _manifest = new WeakMap();
    _manifestData = new WeakMap();
    _routeDataToRouteInfo = new WeakMap();
    _encoder = new WeakMap();
    _logging = new WeakMap();
    _base = new WeakMap();
    _baseWithoutTrailingSlash = new WeakMap();
    _getModuleForRoute = new WeakSet();
    getModuleForRoute_fn = async function(route) {
      if (route.type === "redirect") {
        return RedirectSinglePageBuiltModule;
      } else {
        const importComponentInstance = __privateGet(this, _manifest).pageMap.get(route.component);
        if (!importComponentInstance) {
          throw new Error(
            `Unexpectedly unable to find a component instance for route ${route.route}`
          );
        }
        const built = await importComponentInstance();
        return built;
      }
    };
    _renderPage = new WeakSet();
    renderPage_fn = async function(request, routeData, page3, status = 200) {
      var _a2;
      const url = new URL(request.url);
      const pathname = prependForwardSlash(this.removeBase(url.pathname));
      const info = __privateGet(this, _routeDataToRouteInfo).get(routeData);
      const links = /* @__PURE__ */ new Set();
      const styles = createStylesheetElementSet(info.styles);
      let scripts = /* @__PURE__ */ new Set();
      for (const script of info.scripts) {
        if ("stage" in script) {
          if (script.stage === "head-inline") {
            scripts.add({
              props: {},
              children: script.children
            });
          }
        } else {
          scripts.add(createModuleScriptElement(script));
        }
      }
      try {
        const mod = await page3.page();
        const renderContext = await createRenderContext({
          request,
          origin: url.origin,
          pathname,
          componentMetadata: __privateGet(this, _manifest).componentMetadata,
          scripts,
          styles,
          links,
          route: routeData,
          status,
          mod,
          env: __privateGet(this, _env)
        });
        const apiContext = createAPIContext({
          request: renderContext.request,
          params: renderContext.params,
          props: renderContext.props,
          site: __privateGet(this, _env).site,
          adapterName: __privateGet(this, _env).adapterName
        });
        const onRequest = (_a2 = page3.middleware) == null ? void 0 : _a2.onRequest;
        let response;
        if (onRequest) {
          response = await callMiddleware(
            __privateGet(this, _env).logging,
            onRequest,
            apiContext,
            () => {
              return renderPage({ mod, renderContext, env: __privateGet(this, _env), apiContext });
            }
          );
        } else {
          response = await renderPage({
            mod,
            renderContext,
            env: __privateGet(this, _env),
            apiContext
          });
        }
        Reflect.set(request, responseSentSymbol, true);
        return response;
      } catch (err) {
        error(__privateGet(this, _logging), "ssr", err.stack || err.message || String(err));
        return new Response(null, {
          status: 500,
          statusText: "Internal server error"
        });
      }
    };
    _callEndpoint = new WeakSet();
    callEndpoint_fn = async function(request, routeData, page3, status = 200) {
      const url = new URL(request.url);
      const pathname = "/" + this.removeBase(url.pathname);
      const mod = await page3.page();
      const handler = mod;
      const ctx = await createRenderContext({
        request,
        origin: url.origin,
        pathname,
        route: routeData,
        status,
        env: __privateGet(this, _env),
        mod: handler
      });
      const result = await callEndpoint(handler, __privateGet(this, _env), ctx, __privateGet(this, _logging), page3.middleware);
      if (result.type === "response") {
        if (result.response.headers.get("X-Astro-Response") === "Not-Found") {
          const fourOhFourRequest = new Request(new URL("/404", request.url));
          const fourOhFourRouteData = this.match(fourOhFourRequest);
          if (fourOhFourRouteData) {
            return this.render(fourOhFourRequest, fourOhFourRouteData);
          }
        }
        return result.response;
      } else {
        const body = result.body;
        const headers = new Headers();
        const mimeType = mime$1.getType(url.pathname);
        if (mimeType) {
          headers.set("Content-Type", `${mimeType};charset=utf-8`);
        } else {
          headers.set("Content-Type", "text/plain;charset=utf-8");
        }
        const bytes = __privateGet(this, _encoder).encode(body);
        headers.set("Content-Length", bytes.byteLength.toString());
        const response = new Response(bytes, {
          status: 200,
          headers
        });
        attachToResponse(response, result.cookies);
        return response;
      }
    };
  }
});

// .netlify/edge-functions/chunks/pages/controller.astro.8e4a0438.mjs
var controller_astro_8e4a0438_exports = {};
__export(controller_astro_8e4a0438_exports, {
  $: () => $$Layout,
  _: () => _arrow_function,
  a: () => controller,
  c: () => createComponent2,
  r: () => renderToString2,
  s: () => ssr
});
function castError(err) {
  if (err instanceof Error)
    return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
}
function handleError(err) {
  const error2 = castError(err);
  const fns = lookup(Owner, ERROR);
  if (!fns)
    throw error2;
  for (const f of fns)
    f(error2);
}
function createOwner() {
  const o = {
    owner: Owner,
    context: null,
    owned: null,
    cleanups: null
  };
  if (Owner) {
    if (!Owner.owned)
      Owner.owned = [o];
    else
      Owner.owned.push(o);
  }
  return o;
}
function createRoot(fn, detachedOwner) {
  const owner = Owner, root = fn.length === 0 ? UNOWNED : {
    context: null,
    owner: detachedOwner === void 0 ? owner : detachedOwner,
    owned: null,
    cleanups: null
  };
  Owner = root;
  let result;
  try {
    result = fn(fn.length === 0 ? () => {
    } : () => cleanNode(root));
  } catch (err) {
    handleError(err);
  } finally {
    Owner = owner;
  }
  return result;
}
function createMemo(fn, value) {
  Owner = createOwner();
  let v;
  try {
    v = fn(value);
  } catch (err) {
    handleError(err);
  } finally {
    Owner = Owner.owner;
  }
  return () => v;
}
function cleanNode(node) {
  if (node.owned) {
    for (let i = 0; i < node.owned.length; i++)
      cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (let i = 0; i < node.cleanups.length; i++)
      node.cleanups[i]();
    node.cleanups = null;
  }
}
function createContext(defaultValue) {
  const id = Symbol("context");
  return {
    id,
    Provider: createProvider(id),
    defaultValue
  };
}
function useContext(context) {
  let ctx;
  return (ctx = lookup(Owner, context.id)) !== void 0 ? ctx : context.defaultValue;
}
function children(fn) {
  const memo = createMemo(() => resolveChildren(fn()));
  memo.toArray = () => {
    const c = memo();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo;
}
function lookup(owner, key) {
  return owner ? owner.context && owner.context[key] !== void 0 ? owner.context[key] : lookup(owner.owner, key) : void 0;
}
function resolveChildren(children2) {
  if (typeof children2 === "function" && !children2.length)
    return resolveChildren(children2());
  if (Array.isArray(children2)) {
    const results = [];
    for (let i = 0; i < children2.length; i++) {
      const result = resolveChildren(children2[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children2;
}
function createProvider(id) {
  return function provider(props) {
    return createMemo(() => {
      Owner.context = {
        [id]: props.value
      };
      return children(() => props.children);
    });
  };
}
function setHydrateContext(context) {
  sharedConfig.context = context;
}
function nextHydrateContext() {
  return sharedConfig.context ? {
    ...sharedConfig.context,
    id: `${sharedConfig.context.id}${sharedConfig.context.count++}-`,
    count: 0
  } : void 0;
}
function createComponent2(Comp, props) {
  if (sharedConfig.context && !sharedConfig.context.noHydrate) {
    const c = sharedConfig.context;
    setHydrateContext(nextHydrateContext());
    const r = Comp(props || {});
    setHydrateContext(c);
    return r;
  }
  return Comp(props || {});
}
function createResource(source, fetcher, options = {}) {
  if (arguments.length === 2) {
    if (typeof fetcher === "object") {
      options = fetcher;
      fetcher = source;
      source = true;
    }
  } else if (arguments.length === 1) {
    fetcher = source;
    source = true;
  }
  const contexts2 = /* @__PURE__ */ new Set();
  const id = sharedConfig.context.id + sharedConfig.context.count++;
  let resource = {};
  let value = options.storage ? options.storage(options.initialValue)[0]() : options.initialValue;
  let p;
  let error2;
  if (sharedConfig.context.async && options.ssrLoadFrom !== "initial") {
    resource = sharedConfig.context.resources[id] || (sharedConfig.context.resources[id] = {});
    if (resource.ref) {
      if (!resource.data && !resource.ref[0].loading && !resource.ref[0].error)
        resource.ref[1].refetch();
      return resource.ref;
    }
  }
  const read = () => {
    if (error2)
      throw error2;
    if (resourceContext && p)
      resourceContext.push(p);
    const resolved = options.ssrLoadFrom !== "initial" && sharedConfig.context.async && "data" in sharedConfig.context.resources[id];
    if (!resolved && read.loading) {
      const ctx = useContext(SuspenseContext);
      if (ctx) {
        ctx.resources.set(id, read);
        contexts2.add(ctx);
      }
    }
    return resolved ? sharedConfig.context.resources[id].data : value;
  };
  read.loading = false;
  read.error = void 0;
  read.state = "initialValue" in options ? "ready" : "unresolved";
  Object.defineProperty(read, "latest", {
    get() {
      return read();
    }
  });
  function load() {
    const ctx = sharedConfig.context;
    if (!ctx.async)
      return read.loading = !!(typeof source === "function" ? source() : source);
    if (ctx.resources && id in ctx.resources && "data" in ctx.resources[id]) {
      value = ctx.resources[id].data;
      return;
    }
    resourceContext = [];
    const lookup2 = typeof source === "function" ? source() : source;
    if (resourceContext.length) {
      p = Promise.all(resourceContext).then(() => fetcher(source(), {
        value
      }));
    }
    resourceContext = null;
    if (!p) {
      if (lookup2 == null || lookup2 === false)
        return;
      p = fetcher(lookup2, {
        value
      });
    }
    if (p != void 0 && typeof p === "object" && "then" in p) {
      read.loading = true;
      read.state = "pending";
      if (ctx.writeResource)
        ctx.writeResource(id, p, void 0, options.deferStream);
      return p.then((res) => {
        read.loading = false;
        read.state = "ready";
        ctx.resources[id].data = res;
        p = null;
        notifySuspense(contexts2);
        return res;
      }).catch((err) => {
        read.loading = false;
        read.state = "errored";
        read.error = error2 = castError(err);
        p = null;
        notifySuspense(contexts2);
      });
    }
    ctx.resources[id].data = p;
    if (ctx.writeResource)
      ctx.writeResource(id, p);
    p = null;
    return ctx.resources[id].data;
  }
  if (options.ssrLoadFrom !== "initial")
    load();
  return resource.ref = [read, {
    refetch: load,
    mutate: (v) => value = v
  }];
}
function suspenseComplete(c) {
  for (const r of c.resources.values()) {
    if (r.loading)
      return false;
  }
  return true;
}
function notifySuspense(contexts2) {
  for (const c of contexts2) {
    if (!suspenseComplete(c)) {
      continue;
    }
    c.completed();
    contexts2.delete(c);
  }
}
function se(e) {
  let r = e % ve, n = be[r];
  for (e = (e - r) / ve; e > 0; )
    r = e % ge, n += Ae[r], e = (e - r) / ge;
  return n;
}
function h(e = {}) {
  let r = Object.assign({}, Le, e || {});
  return { markedRefs: /* @__PURE__ */ new Set(), refs: /* @__PURE__ */ new Map(), features: 8191 ^ r.disabledFeatures };
}
function V(e) {
  return { stack: [], vars: [], assignments: [], validRefs: [], refSize: 0, features: e.features, markedRefs: new Set(e.markedRefs), valueMap: /* @__PURE__ */ new Map() };
}
function R(e, r) {
  e.markedRefs.add(r);
}
function m(e, r) {
  let n = e.validRefs[r];
  n == null && (n = e.refSize++, e.validRefs[r] = n);
  let t = e.vars[n];
  return t == null && (t = se(n), e.vars[n] = t), t;
}
function P(e, r) {
  let n = e.refs.get(r);
  return n == null ? e.refs.size : n;
}
function z(e, r) {
  let n = e.refs.get(r);
  if (n == null) {
    let t = e.refs.size;
    return e.refs.set(r, t), t;
  }
  return R(e, n), n;
}
function S(e, r) {
  if (!e)
    throw new Error(r);
}
function A(e) {
  let r = "", n = 0;
  for (let t = 0, a = e.length; t < a; t++) {
    let o;
    switch (e[t]) {
      case '"':
        o = '\\"';
        break;
      case "\\":
        o = "\\\\";
        break;
      case "<":
        o = "\\x3C";
        break;
      case `
`:
        o = "\\n";
        break;
      case "\r":
        o = "\\r";
        break;
      case "\u2028":
        o = "\\u2028";
        break;
      case "\u2029":
        o = "\\u2029";
        break;
      default:
        continue;
    }
    r += e.slice(n, t) + o, n = t + 1;
  }
  return n === 0 ? r = e : r += e.slice(n), r;
}
function F(e) {
  return { t: 0, i: void 0, s: e, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
}
function K(e) {
  return { t: 1, i: void 0, s: A(e), l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
}
function W(e, r) {
  return S(e.features & 8, 'Unsupported type "BigInt"'), { t: 9, i: void 0, s: "" + r, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
}
function Y(e) {
  return { t: 10, i: e, s: void 0, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
}
function Z(e, r) {
  return { t: 11, i: e, s: r.toISOString(), l: void 0, c: void 0, m: void 0, d: void 0, f: void 0, a: void 0 };
}
function G(e, r) {
  return { t: 12, i: e, s: void 0, l: void 0, c: r.source, m: r.flags, d: void 0, a: void 0, f: void 0 };
}
function H(e, r, n) {
  let t = n.constructor.name;
  S(e.features & 2048, `Unsupported value type "${t}"`);
  let a = n.length, o = new Array(a);
  for (let i = 0; i < a; i++)
    o[i] = "" + n[i];
  return { t: 22, i: r, s: o, l: n.byteOffset, c: t, m: void 0, d: void 0, a: void 0, f: void 0 };
}
function J(e, r, n) {
  let t = n.constructor.name;
  S((e.features & ke) === ke, `Unsupported value type "${t}"`);
  let a = n.length, o = new Array(a);
  for (let i = 0; i < a; i++)
    o[i] = "" + n[i];
  return { t: 23, i: r, s: o, l: n.byteOffset, c: t, m: void 0, d: void 0, a: void 0, f: void 0 };
}
function $2(e) {
  return { t: 24, i: void 0, s: O[e], l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
}
function w(e) {
  return e instanceof EvalError ? "EvalError" : e instanceof RangeError ? "RangeError" : e instanceof ReferenceError ? "ReferenceError" : e instanceof SyntaxError ? "SyntaxError" : e instanceof TypeError ? "TypeError" : e instanceof URIError ? "URIError" : "Error";
}
function C(e, r) {
  let n, t = w(r);
  r.name !== t ? n = { name: r.name } : r.constructor.name !== t && (n = { name: r.constructor.name });
  let a = Object.getOwnPropertyNames(r);
  for (let o of a)
    o !== "name" && o !== "message" && (o === "stack" ? e.features & 16 && (n = n || {}, n[o] = r[o]) : (n = n || {}, n[o] = r[o]));
  return n;
}
function q(e) {
  let r = Object.getOwnPropertyNames(e);
  if (r.length) {
    let n = {};
    for (let t of r)
      n[t] = e[t];
    return n;
  }
}
function N(e) {
  if (!e || typeof e != "object" || Array.isArray(e))
    return false;
  switch (e.constructor) {
    case Map:
    case Set:
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
    case BigInt64Array:
    case BigUint64Array:
      return false;
  }
  return Symbol.iterator in e;
}
function le(e) {
  let r = e[0];
  return (r === "$" || r === "_" || r >= "A" && r <= "Z" || r >= "a" && r <= "z") && xe.test(e);
}
function ne(e) {
  switch (e.t) {
    case "index":
      return e.s + "=" + e.v;
    case "map":
      return e.s + ".set(" + e.k + "," + e.v + ")";
    case "set":
      return e.s + ".add(" + e.v + ")";
    default:
      return "";
  }
}
function nr(e) {
  let r = [], n = e[0], t = n, a;
  for (let o = 1, i = e.length; o < i; o++) {
    if (a = e[o], a.t === t.t)
      switch (a.t) {
        case "index":
          a.v === t.v ? n = { t: "index", s: a.s, k: void 0, v: ne(n) } : (r.push(n), n = a);
          break;
        case "map":
          a.s === t.s ? n = { t: "map", s: ne(n), k: a.k, v: a.v } : (r.push(n), n = a);
          break;
        case "set":
          a.s === t.s ? n = { t: "set", s: ne(n), k: void 0, v: a.v } : (r.push(n), n = a);
          break;
      }
    else
      r.push(n), n = a;
    t = a;
  }
  return r.push(n), r;
}
function Pe(e) {
  if (e.length) {
    let r = "", n = nr(e);
    for (let t = 0, a = n.length; t < a; t++)
      r += ne(n[t]) + ",";
    return r;
  }
}
function ze(e) {
  return Pe(e.assignments);
}
function Be(e, r, n) {
  e.assignments.push({ t: "index", s: r, k: void 0, v: n });
}
function tr(e, r, n) {
  R(e, r), e.assignments.push({ t: "set", s: m(e, r), k: void 0, v: n });
}
function Se(e, r, n, t) {
  R(e, r), e.assignments.push({ t: "map", s: m(e, r), k: n, v: t });
}
function me(e, r, n, t) {
  R(e, r), Be(e, m(e, r) + "[" + n + "]", t);
}
function Te(e, r, n, t) {
  R(e, r), Be(e, m(e, r) + "." + n, t);
}
function b(e, r, n) {
  return e.markedRefs.has(r) ? m(e, r) + "=" + n : n;
}
function k(e, r) {
  return r.t === 10 && e.stack.includes(r.i);
}
function ye(e, r) {
  let n = r.l, t = "", a, o = false;
  for (let i = 0; i < n; i++)
    i !== 0 && (t += ","), a = r.a[i], a ? k(e, a) ? (me(e, r.i, i, m(e, a.i)), o = true) : (t += y(e, a), o = false) : o = true;
  return "[" + t + (o ? ",]" : "]");
}
function ar(e, r) {
  e.stack.push(r.i);
  let n = ye(e, r);
  return e.stack.pop(), b(e, r.i, n);
}
function Ue(e, r, n) {
  if (n.s === 0)
    return "{}";
  let t = "";
  e.stack.push(r);
  let a, o, i, d, s, u = false;
  for (let l = 0; l < n.s; l++)
    a = n.k[l], o = n.v[l], i = Number(a), d = i >= 0 || le(a), k(e, o) ? (s = m(e, o.i), d && Number.isNaN(i) ? Te(e, r, a, s) : me(e, r, d ? a : '"' + A(a) + '"', s)) : (t += (u ? "," : "") + (d ? a : '"' + A(a) + '"') + ":" + y(e, o), u = true);
  return e.stack.pop(), "{" + t + "}";
}
function or(e, r, n, t) {
  let a = Ue(e, n, r);
  return a !== "{}" ? "Object.assign(" + t + "," + a + ")" : t;
}
function ir(e, r, n) {
  e.stack.push(r);
  let t = [], a, o, i, d, s, u;
  for (let l = 0; l < n.s; l++)
    a = e.stack, e.stack = [], o = y(e, n.v[l]), e.stack = a, i = n.k[l], d = Number(i), s = e.assignments, e.assignments = t, u = d >= 0 || le(i), u && Number.isNaN(d) ? Te(e, r, i, o) : me(e, r, u ? i : '"' + A(i) + '"', o), e.assignments = s;
  return e.stack.pop(), Pe(t);
}
function te(e, r, n, t) {
  if (n)
    if (e.features & 128)
      t = or(e, n, r, t);
    else {
      R(e, r);
      let a = ir(e, r, n);
      if (a)
        return "(" + b(e, r, t) + "," + a + m(e, r) + ")";
    }
  return b(e, r, t);
}
function sr(e, r) {
  return te(e, r.i, r.d, "Object.create(null)");
}
function lr(e, r) {
  return b(e, r.i, Ue(e, r.i, r.d));
}
function dr(e, r) {
  let n = "new Set", t = r.l;
  if (t) {
    let a = "";
    e.stack.push(r.i);
    let o, i = false;
    for (let d = 0; d < t; d++)
      o = r.a[d], k(e, o) ? tr(e, r.i, m(e, o.i)) : (a += (i ? "," : "") + y(e, o), i = true);
    e.stack.pop(), a && (n += "([" + a + "])");
  }
  return b(e, r.i, n);
}
function ur(e, r) {
  let n = "new Map";
  if (r.d.s) {
    let t = "";
    e.stack.push(r.i);
    let a, o, i, d, s, u = false;
    for (let l = 0; l < r.d.s; l++)
      a = r.d.k[l], o = r.d.v[l], k(e, a) ? (i = m(e, a.i), k(e, o) ? (d = m(e, o.i), Se(e, r.i, i, d)) : (s = e.stack, e.stack = [], Se(e, r.i, i, y(e, o)), e.stack = s)) : k(e, o) ? (d = m(e, o.i), s = e.stack, e.stack = [], Se(e, r.i, y(e, a), d), e.stack = s) : (t += (u ? ",[" : "[") + y(e, a) + "," + y(e, o) + "]", u = true);
    e.stack.pop(), t && (n += "([" + t + "])");
  }
  return b(e, r.i, n);
}
function fr(e, r) {
  e.stack.push(r.i);
  let n = "new AggregateError(" + ye(e, r) + ',"' + A(r.m) + '")';
  return e.stack.pop(), te(e, r.i, r.d, n);
}
function cr(e, r) {
  let n = "new " + r.c + '("' + A(r.m) + '")';
  return te(e, r.i, r.d, n);
}
function Sr(e, r) {
  let n;
  if (k(e, r.f)) {
    let t = m(e, r.f.i);
    e.features & 4 ? n = "Promise.resolve().then(()=>" + t + ")" : n = "Promise.resolve().then(function(){return " + t + "})";
  } else {
    e.stack.push(r.i);
    let t = y(e, r.f);
    e.stack.pop(), n = "Promise.resolve(" + t + ")";
  }
  return b(e, r.i, n);
}
function mr(e, r) {
  let n = "", t = r.t === 23;
  for (let o = 0, i = r.s.length; o < i; o++)
    n += (o !== 0 ? "," : "") + r.s[o] + (t ? "n" : "");
  let a = "[" + n + "]" + (r.l !== 0 ? "," + r.l : "");
  return b(e, r.i, "new " + r.c + "(" + a + ")");
}
function yr(e, r) {
  let n = e.stack;
  e.stack = [];
  let t = ye(e, r);
  e.stack = n;
  let a = t;
  return e.features & 2 ? a += ".values()" : a += "[Symbol.iterator]()", e.features & 4 ? a = "{[Symbol.iterator]:()=>" + a + "}" : e.features & 64 ? a = "{[Symbol.iterator](){return " + a + "}}" : a = "{[Symbol.iterator]:function(){return " + a + "}}", te(e, r.i, r.d, a);
}
function y(e, r) {
  switch (r.t) {
    case 0:
      return "" + r.s;
    case 1:
      return '"' + r.s + '"';
    case 2:
      return r.s ? "!0" : "!1";
    case 4:
      return "void 0";
    case 3:
      return "null";
    case 5:
      return "-0";
    case 6:
      return "1/0";
    case 7:
      return "-1/0";
    case 8:
      return "NaN";
    case 9:
      return r.s + "n";
    case 10:
      return m(e, r.i);
    case 15:
      return ar(e, r);
    case 16:
      return lr(e, r);
    case 17:
      return sr(e, r);
    case 11:
      return b(e, r.i, 'new Date("' + r.s + '")');
    case 12:
      return b(e, r.i, "/" + r.c + "/" + r.m);
    case 13:
      return dr(e, r);
    case 14:
      return ur(e, r);
    case 23:
    case 22:
      return mr(e, r);
    case 20:
      return fr(e, r);
    case 19:
      return cr(e, r);
    case 21:
      return yr(e, r);
    case 18:
      return Sr(e, r);
    case 24:
      return Ie[r.s];
    default:
      throw new Error("Unsupported type");
  }
}
function Ne(e, r) {
  let n = r.length, t = new Array(n), a = new Array(n), o;
  for (let i = 0; i < n; i++)
    i in r && (o = r[i], N(o) ? a[i] = o : t[i] = g(e, o));
  for (let i = 0; i < n; i++)
    i in a && (t[i] = g(e, a[i]));
  return t;
}
function Nr(e, r, n) {
  return { t: 15, i: r, s: void 0, l: n.length, c: void 0, m: void 0, d: void 0, a: Ne(e, n), f: void 0 };
}
function pr(e, r, n) {
  S(e.features & 32, 'Unsupported type "Map"');
  let t = n.size, a = new Array(t), o = new Array(t), i = new Array(t), d = new Array(t), s = 0, u = 0;
  for (let [l, f] of n.entries())
    N(l) || N(f) ? (i[s] = l, d[s] = f, s++) : (a[u] = g(e, l), o[u] = g(e, f), u++);
  for (let l = 0; l < s; l++)
    a[u + l] = g(e, i[l]), o[u + l] = g(e, d[l]);
  return { t: 14, i: r, s: void 0, l: void 0, c: void 0, m: void 0, d: { k: a, v: o, s: t }, a: void 0, f: void 0 };
}
function vr(e, r, n) {
  S(e.features & 512, 'Unsupported type "Set"');
  let t = n.size, a = new Array(t), o = new Array(t), i = 0, d = 0;
  for (let s of n.keys())
    N(s) ? o[i++] = s : a[d++] = g(e, s);
  for (let s = 0; s < i; s++)
    a[d + s] = g(e, o[s]);
  return { t: 13, i: r, s: void 0, l: t, c: void 0, m: void 0, d: void 0, a, f: void 0 };
}
function oe(e, r) {
  let n = Object.keys(r), t = n.length, a = new Array(t), o = new Array(t), i = new Array(t), d = new Array(t), s = 0, u = 0, l;
  for (let f of n)
    l = r[f], N(l) ? (i[s] = f, d[s] = l, s++) : (a[u] = f, o[u] = g(e, l), u++);
  for (let f = 0; f < s; f++)
    a[u + f] = i[f], o[u + f] = g(e, d[f]);
  return { k: a, v: o, s: t };
}
function De(e, r, n) {
  S(e.features & 1024, 'Unsupported type "Iterable"');
  let t = q(n), a = Array.from(n);
  return { t: 21, i: r, s: void 0, l: a.length, c: void 0, m: void 0, d: t ? oe(e, t) : void 0, a: Ne(e, a), f: void 0 };
}
function je(e, r, n, t) {
  return Symbol.iterator in n ? De(e, r, n) : { t: t ? 17 : 16, i: r, s: void 0, l: void 0, c: void 0, m: void 0, d: oe(e, n), a: void 0, f: void 0 };
}
function Me(e, r, n) {
  let t = C(e, n), a = t ? oe(e, t) : void 0;
  return { t: 20, i: r, s: void 0, l: n.errors.length, c: void 0, m: n.message, d: a, a: Ne(e, n.errors), f: void 0 };
}
function ae(e, r, n) {
  let t = C(e, n), a = t ? oe(e, t) : void 0;
  return { t: 19, i: r, s: void 0, l: void 0, c: w(n), m: n.message, d: a, a: void 0, f: void 0 };
}
function g(e, r) {
  switch (typeof r) {
    case "boolean":
      return r ? T : U;
    case "undefined":
      return j;
    case "string":
      return K(r);
    case "number":
      switch (r) {
        case 1 / 0:
          return _;
        case -1 / 0:
          return L;
      }
      return r !== r ? x : Object.is(r, -0) ? D : F(r);
    case "bigint":
      return W(e, r);
    case "object": {
      if (!r)
        return M;
      let n = z(e, r);
      if (e.markedRefs.has(n))
        return Y(n);
      if (Array.isArray(r))
        return Nr(e, n, r);
      switch (r.constructor) {
        case Date:
          return Z(n, r);
        case RegExp:
          return G(n, r);
        case Int8Array:
        case Int16Array:
        case Int32Array:
        case Uint8Array:
        case Uint16Array:
        case Uint32Array:
        case Uint8ClampedArray:
        case Float32Array:
        case Float64Array:
          return H(e, n, r);
        case BigInt64Array:
        case BigUint64Array:
          return J(e, n, r);
        case Map:
          return pr(e, n, r);
        case Set:
          return vr(e, n, r);
        case Object:
          return je(e, n, r, false);
        case void 0:
          return je(e, n, r, true);
        case AggregateError:
          return e.features & 1 ? Me(e, n, r) : ae(e, n, r);
        case Error:
        case EvalError:
        case RangeError:
        case ReferenceError:
        case SyntaxError:
        case TypeError:
        case URIError:
          return ae(e, n, r);
      }
      if (r instanceof AggregateError)
        return e.features & 1 ? Me(e, n, r) : ae(e, n, r);
      if (r instanceof Error)
        return ae(e, n, r);
      if (Symbol.iterator in r)
        return De(e, n, r);
      throw new Error("Unsupported type");
    }
    case "symbol":
      return S(e.features & 1024, 'Unsupported type "symbol"'), S(r in O, "seroval only supports well-known symbols"), $2(r);
    default:
      throw new Error("Unsupported type");
  }
}
function ie(e, r) {
  let n = g(e, r), t = n.t === 16 || n.t === 21;
  return [n, P(e, r), t];
}
function pe2(e, r, n, t) {
  if (e.vars.length) {
    let a = ze(e), o = t;
    if (a) {
      let d = m(e, r);
      o = t + "," + a + d, t.startsWith(d + "=") || (o = d + "=" + o);
    }
    let i = e.vars.length > 1 ? e.vars.join(",") : e.vars[0];
    return e.features & 4 ? (i = e.vars.length > 1 || e.vars.length === 0 ? "(" + i + ")" : i, "(" + i + "=>(" + o + "))()") : "(function(" + i + "){return " + o + "})()";
  }
  return n ? "(" + t + ")" : t;
}
function gr(e, r) {
  let n = h(r), [t, a, o] = ie(n, e), i = V(n), d = y(i, t);
  return pe2(i, a, o, d);
}
function stringify(data) {
  return gr(data, {
    disabledFeatures: ES2017FLAG
  });
}
function renderToString2(code, options = {}) {
  let scripts = "";
  sharedConfig.context = {
    id: options.renderId || "",
    count: 0,
    suspense: {},
    lazy: {},
    assets: [],
    nonce: options.nonce,
    writeResource(id, p, error2) {
      if (sharedConfig.context.noHydrate)
        return;
      if (error2)
        return scripts += `_$HY.set("${id}", ${stringify(p)});`;
      scripts += `_$HY.set("${id}", ${stringify(p)});`;
    }
  };
  let html = createRoot((d) => {
    setTimeout(d);
    return resolveSSRNode(escape2(code()));
  });
  sharedConfig.context.noHydrate = true;
  html = injectAssets(sharedConfig.context.assets, html);
  if (scripts.length)
    html = injectScripts(html, scripts, options.nonce);
  return html;
}
function ssr(t, ...nodes) {
  if (nodes.length) {
    let result = "";
    for (let i = 0; i < nodes.length; i++) {
      result += t[i];
      const node = nodes[i];
      if (node !== void 0)
        result += resolveSSRNode(node);
    }
    t = result + t[nodes.length];
  }
  return {
    t
  };
}
function ssrHydrationKey() {
  const hk = getHydrationKey();
  return hk ? ` data-hk="${hk}"` : "";
}
function escape2(s, attr) {
  const t = typeof s;
  if (t !== "string") {
    if (!attr && t === "function")
      return escape2(s());
    if (!attr && Array.isArray(s)) {
      for (let i = 0; i < s.length; i++)
        s[i] = escape2(s[i]);
      return s;
    }
    if (attr && t === "boolean")
      return String(s);
    return s;
  }
  const delim = attr ? '"' : "<";
  const escDelim = attr ? "&quot;" : "&lt;";
  let iDelim = s.indexOf(delim);
  let iAmp = s.indexOf("&");
  if (iDelim < 0 && iAmp < 0)
    return s;
  let left = 0, out = "";
  while (iDelim >= 0 && iAmp >= 0) {
    if (iDelim < iAmp) {
      if (left < iDelim)
        out += s.substring(left, iDelim);
      out += escDelim;
      left = iDelim + 1;
      iDelim = s.indexOf(delim, left);
    } else {
      if (left < iAmp)
        out += s.substring(left, iAmp);
      out += "&amp;";
      left = iAmp + 1;
      iAmp = s.indexOf("&", left);
    }
  }
  if (iDelim >= 0) {
    do {
      if (left < iDelim)
        out += s.substring(left, iDelim);
      out += escDelim;
      left = iDelim + 1;
      iDelim = s.indexOf(delim, left);
    } while (iDelim >= 0);
  } else
    while (iAmp >= 0) {
      if (left < iAmp)
        out += s.substring(left, iAmp);
      out += "&amp;";
      left = iAmp + 1;
      iAmp = s.indexOf("&", left);
    }
  return left < s.length ? out + s.substring(left) : out;
}
function resolveSSRNode(node, top) {
  const t = typeof node;
  if (t === "string")
    return node;
  if (node == null || t === "boolean")
    return "";
  if (Array.isArray(node)) {
    let prev = {};
    let mapped = "";
    for (let i = 0, len = node.length; i < len; i++) {
      if (!top && typeof prev !== "object" && typeof node[i] !== "object")
        mapped += `<!--!$-->`;
      mapped += resolveSSRNode(prev = node[i]);
    }
    return mapped;
  }
  if (t === "object")
    return node.t;
  if (t === "function")
    return resolveSSRNode(node());
  return String(node);
}
function getHydrationKey() {
  const hydrate = sharedConfig.context;
  return hydrate && !hydrate.noHydrate && `${hydrate.id}${hydrate.count++}`;
}
function injectAssets(assets, html) {
  if (!assets || !assets.length)
    return html;
  let out = "";
  for (let i = 0, len = assets.length; i < len; i++)
    out += assets[i]();
  return html.replace(`</head>`, out + `</head>`);
}
function injectScripts(html, scripts, nonce) {
  const tag = `<script${nonce ? ` nonce="${nonce}"` : ""}>${scripts}<\/script>`;
  const index = html.indexOf("<!--xs-->");
  if (index > -1) {
    return html.slice(0, index) + tag + html.slice(index);
  }
  return html + tag;
}
var ERROR, UNOWNED, Owner, sharedConfig, SuspenseContext, resourceContext, I, be, ve, Ae, ge, Le, Ie, O, T, U, j, M, D, _, L, x, ke, xe, ES2017FLAG, pwaInfo, $$Astro$1, $$Layout, _tmpl$, fetchData, _arrow_function, $$Astro, $$Controller, $$file, $$url, controller;
var init_controller_astro_8e4a0438 = __esm({
  ".netlify/edge-functions/chunks/pages/controller.astro.8e4a0438.mjs"() {
    "use strict";
    init_astro_80725e1e();
    ERROR = Symbol("error");
    UNOWNED = {
      context: null,
      owner: null,
      owned: null,
      cleanups: null
    };
    Owner = null;
    sharedConfig = {};
    SuspenseContext = createContext();
    resourceContext = null;
    I = ((c) => (c[c.AggregateError = 1] = "AggregateError", c[c.ArrayPrototypeValues = 2] = "ArrayPrototypeValues", c[c.ArrowFunction = 4] = "ArrowFunction", c[c.BigInt = 8] = "BigInt", c[c.ErrorPrototypeStack = 16] = "ErrorPrototypeStack", c[c.Map = 32] = "Map", c[c.MethodShorthand = 64] = "MethodShorthand", c[c.ObjectAssign = 128] = "ObjectAssign", c[c.Promise = 256] = "Promise", c[c.Set = 512] = "Set", c[c.Symbol = 1024] = "Symbol", c[c.TypedArray = 2048] = "TypedArray", c[c.BigIntTypedArray = 4096] = "BigIntTypedArray", c))(I || {});
    be = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_";
    ve = be.length;
    Ae = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_";
    ge = Ae.length;
    Le = { disabledFeatures: 0 };
    Ie = { [0]: "Symbol.asyncIterator", [1]: "Symbol.hasInstance", [2]: "Symbol.isConcatSpreadable", [3]: "Symbol.iterator", [4]: "Symbol.match", [5]: "Symbol.matchAll", [6]: "Symbol.replace", [7]: "Symbol.search", [8]: "Symbol.species", [9]: "Symbol.split", [10]: "Symbol.toPrimitive", [11]: "Symbol.toStringTag", [12]: "Symbol.unscopables" };
    O = { [Symbol.asyncIterator]: 0, [Symbol.hasInstance]: 1, [Symbol.isConcatSpreadable]: 2, [Symbol.iterator]: 3, [Symbol.match]: 4, [Symbol.matchAll]: 5, [Symbol.replace]: 6, [Symbol.search]: 7, [Symbol.species]: 8, [Symbol.split]: 9, [Symbol.toPrimitive]: 10, [Symbol.toStringTag]: 11, [Symbol.unscopables]: 12 };
    T = { t: 2, i: void 0, s: true, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
    U = { t: 2, i: void 0, s: false, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
    j = { t: 4, i: void 0, s: void 0, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
    M = { t: 3, i: void 0, s: void 0, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
    D = { t: 5, i: void 0, s: void 0, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
    _ = { t: 6, i: void 0, s: void 0, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
    L = { t: 7, i: void 0, s: void 0, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
    x = { t: 8, i: void 0, s: void 0, l: void 0, c: void 0, m: void 0, d: void 0, a: void 0, f: void 0 };
    ke = 4104;
    xe = /^[$A-Z_][0-9A-Z_$]*$/i;
    ES2017FLAG = I.AggregateError | I.BigInt | I.BigIntTypedArray;
    pwaInfo = { "pwaInDevEnvironment": false, "webManifest": { "href": "/manifest.webmanifest", "useCredentials": false, "linkTag": '<link rel="manifest" href="/manifest.webmanifest">' } };
    $$Astro$1 = createAstro();
    $$Layout = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
      Astro2.self = $$Layout;
      const { title } = Astro2.props;
      const pageTitle = title;
      return renderTemplate`<html lang="zh-CN">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="icon" href="/favicon.ico">
		<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
		<link rel="mask-icon" href="/mask-icon.svg" color="#fdfdfd">
		<meta name="theme-color" content="#fdfdfd" media="(prefers-color-scheme: light)">
		<meta name="theme-color" content="#181818" media="(prefers-color-scheme: dark)">
		<meta name="generator"${addAttribute(Astro2.generator, "content")}>
		<title>${pageTitle}</title>
		<meta name="description" content="Mayday lyrics collection.">
		${{}.HEAD_SCRIPTS ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML({}.HEAD_SCRIPTS)}` })}` : null}
		
    ${pwaInfo && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(pwaInfo.webManifest.linkTag)}` })}`}
	${renderHead($$result)}</head>
	<body class="bg-base fg-base pb-[env(safe-area-inset-bottom)]">
		${renderSlot($$result, $$slots["default"])}
	</body></html>`;
    }, "/Users/didi/Developer/mayday.teleprompter/src/layouts/Layout.astro");
    _tmpl$ = ["<div", ' class="p-6"><span>', "</span><div><pre>", "</pre></div></div>"];
    fetchData = async () => (await fetch("https://mayday.blue/api/all")).json();
    _arrow_function = () => {
      const [data] = createResource(fetchData);
      return ssr(_tmpl$, ssrHydrationKey(), data.loading && "Loading...", escape2(JSON.stringify(data(), null, 2)));
    };
    __astro_tag_component__(_arrow_function, "@astrojs/solid-js");
    $$Astro = createAstro();
    $$Controller = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
      Astro2.self = $$Controller;
      return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate`
	${maybeRenderHead($$result2)}<div class="flex w-screen h-screen">
    <aside class="border-r border-base">
      ${renderComponent($$result2, "SongList", _arrow_function, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/SongList", "client:component-export": "default" })}
    </aside>
    <main>
      <h1>Home</h1>
    </main>
  </div>
` })}`;
    }, "/Users/didi/Developer/mayday.teleprompter/src/pages/controller.astro");
    $$file = "/Users/didi/Developer/mayday.teleprompter/src/pages/controller.astro";
    $$url = "/controller";
    controller = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$Controller,
      file: $$file,
      url: $$url
    }, Symbol.toStringTag, { value: "Module" }));
  }
});

// .netlify/edge-functions/renderers.mjs
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
function check2(Component, props, children2) {
  if (typeof Component !== "function")
    return false;
  const { html } = renderToStaticMarkup2.call(this, Component, props, children2);
  return typeof html === "string";
}
function renderToStaticMarkup2(Component, props, { default: children2, ...slotted }, metadata) {
  const renderId = (metadata == null ? void 0 : metadata.hydrate) ? incrementId(getContext(this.result)) : "";
  const needsHydrate = (metadata == null ? void 0 : metadata.astroStaticSlot) ? !!metadata.hydrate : true;
  const tagName = needsHydrate ? "astro-slot" : "astro-static-slot";
  const html = renderToString2(
    () => {
      const slots = {};
      for (const [key, value] of Object.entries(slotted)) {
        const name = slotName2(key);
        slots[name] = ssr(`<${tagName} name="${name}">${value}</${tagName}>`);
      }
      const newProps = {
        ...props,
        ...slots,
        children: children2 != null ? ssr(`<${tagName}>${children2}</${tagName}>`) : children2
      };
      return createComponent2(Component, newProps);
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
var contexts, slotName2, server_default2, renderers;
var init_renderers = __esm({
  ".netlify/edge-functions/renderers.mjs"() {
    "use strict";
    init_astro_80725e1e();
    init_controller_astro_8e4a0438();
    contexts = /* @__PURE__ */ new WeakMap();
    slotName2 = (str) => str.trim().replace(/[-_]([a-z])/g, (_2, w2) => w2.toUpperCase());
    server_default2 = {
      check: check2,
      renderToStaticMarkup: renderToStaticMarkup2,
      supportsAstroStaticSlot: true
    };
    renderers = [Object.assign({ "name": "astro:jsx", "serverEntrypoint": "astro/jsx/server.js", "jsxImportSource": "astro" }, { ssr: server_default }), Object.assign({ "name": "@astrojs/solid-js", "clientEntrypoint": "@astrojs/solid-js/client.js", "serverEntrypoint": "@astrojs/solid-js/server.js", "jsxImportSource": "solid-js" }, { ssr: server_default2 })];
  }
});

// .netlify/edge-functions/chunks/pages/index.astro.a35054b5.mjs
var index_astro_a35054b5_exports = {};
__export(index_astro_a35054b5_exports, {
  default: () => $$Index,
  file: () => $$file2,
  url: () => $$url2
});
var $$Astro2, $$Index, $$file2, $$url2;
var init_index_astro_a35054b5 = __esm({
  ".netlify/edge-functions/chunks/pages/index.astro.a35054b5.mjs"() {
    "use strict";
    init_astro_80725e1e();
    init_controller_astro_8e4a0438();
    $$Astro2 = createAstro();
    $$Index = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro2, $$props, $$slots);
      Astro2.self = $$Index;
      return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate`
	${renderComponent($$result2, "SongList", _arrow_function, {})}
` })}`;
    }, "/Users/didi/Developer/mayday.teleprompter/src/pages/index.astro");
    $$file2 = "/Users/didi/Developer/mayday.teleprompter/src/pages/index.astro";
    $$url2 = "";
  }
});

// .netlify/edge-functions/chunks/index@_@astro.52c5be93.mjs
var index_astro_52c5be93_exports = {};
__export(index_astro_52c5be93_exports, {
  page: () => page,
  renderers: () => renderers
});
var page;
var init_index_astro_52c5be93 = __esm({
  ".netlify/edge-functions/chunks/index@_@astro.52c5be93.mjs"() {
    "use strict";
    init_renderers();
    init_astro_80725e1e();
    init_controller_astro_8e4a0438();
    page = () => Promise.resolve().then(() => (init_index_astro_a35054b5(), index_astro_a35054b5_exports));
  }
});

// .netlify/edge-functions/chunks/controller@_@astro.e9face01.mjs
var controller_astro_e9face01_exports = {};
__export(controller_astro_e9face01_exports, {
  page: () => page2,
  renderers: () => renderers
});
var page2;
var init_controller_astro_e9face01 = __esm({
  ".netlify/edge-functions/chunks/controller@_@astro.e9face01.mjs"() {
    "use strict";
    init_renderers();
    init_astro_80725e1e();
    init_controller_astro_8e4a0438();
    page2 = () => Promise.resolve().then(() => (init_controller_astro_8e4a0438(), controller_astro_8e4a0438_exports)).then((n) => n.a);
  }
});

// .netlify/edge-functions/entry.js
init_astro_80725e1e();
init_renderers();
init_controller_astro_8e4a0438();
var clientAddressSymbol2 = Symbol.for("astro.clientAddress");
function createExports(manifest) {
  const app = new App(manifest);
  const handler = async (request, context) => {
    var _a2;
    const url = new URL(request.url);
    if (manifest.assets.has(url.pathname)) {
      return;
    }
    if (app.match(request)) {
      const ip = request.headers.get("x-nf-client-connection-ip") || (context == null ? void 0 : context.ip) || ((_a2 = context == null ? void 0 : context.remoteAddr) == null ? void 0 : _a2.hostname);
      Reflect.set(request, clientAddressSymbol2, ip);
      const response = await app.render(request);
      if (app.setCookieHeaders) {
        for (const setCookieHeader of app.setCookieHeaders(response)) {
          response.headers.append("Set-Cookie", setCookieHeader);
        }
      }
      return response;
    }
    return new Response(null, {
      status: 404,
      statusText: "Not found"
    });
  };
  return { default: handler };
}
var adapter = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createExports
}, Symbol.toStringTag, { value: "Module" }));
var _page0 = () => Promise.resolve().then(() => (init_index_astro_52c5be93(), index_astro_52c5be93_exports));
var _page1 = () => Promise.resolve().then(() => (init_controller_astro_e9face01(), controller_astro_e9face01_exports));
var pageMap = /* @__PURE__ */ new Map([["src/pages/index.astro", _page0], ["src/pages/controller.astro", _page1]]);
var _manifest2 = Object.assign(deserializeManifest({ "adapterName": "@astrojs/netlify/edge-functions", "routes": [{ "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.90f7edda.js" }], "styles": [{ "type": "external", "src": "/_astro/controller.be67fa63.css" }], "routeData": { "route": "/", "type": "page", "pattern": "^\\/$", "segments": [], "params": [], "component": "src/pages/index.astro", "pathname": "/", "prerender": false, "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.90f7edda.js" }], "styles": [{ "type": "external", "src": "/_astro/controller.be67fa63.css" }], "routeData": { "route": "/controller", "type": "page", "pattern": "^\\/controller\\/?$", "segments": [[{ "content": "controller", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/controller.astro", "pathname": "/controller", "prerender": false, "_meta": { "trailingSlash": "ignore" } } }], "base": "/", "markdown": { "drafts": false, "syntaxHighlight": "shiki", "shikiConfig": { "langs": [], "theme": "github-dark", "wrap": false }, "remarkPlugins": [], "rehypePlugins": [], "remarkRehype": {}, "gfm": true, "smartypants": true }, "pageMap": null, "componentMetadata": [["/Users/didi/Developer/mayday.teleprompter/src/pages/controller.astro", { "propagation": "none", "containsHead": true }], ["/Users/didi/Developer/mayday.teleprompter/src/pages/index.astro", { "propagation": "none", "containsHead": true }]], "renderers": [], "clientDirectives": [["idle", '(()=>{var i=t=>{let e=async()=>{await(await t())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event("astro:idle"));})();'], ["load", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();'], ["media", '(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener("change",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event("astro:media"));})();'], ["only", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event("astro:only"));})();'], ["visible", '(()=>{var r=(s,c,i)=>{let o=async()=>{await(await s())()},n=new IntersectionObserver(e=>{for(let t of e)if(t.isIntersecting){n.disconnect(),o();break}});for(let e=0;e<i.children.length;e++){let t=i.children[e];n.observe(t)}};(self.Astro||(self.Astro={})).visible=r;window.dispatchEvent(new Event("astro:visible"));})();']], "entryModules": { "\0@astrojs-ssr-virtual-entry": "_@astrojs-ssr-virtual-entry.mjs", "\0@astro-renderers": "renderers.mjs", "/src/pages/index.astro": "chunks/pages/index.astro.a35054b5.mjs", "\0@astro-page:src/pages/index@_@astro": "chunks/index@_@astro.52c5be93.mjs", "\0@astro-page:src/pages/controller@_@astro": "chunks/controller@_@astro.e9face01.mjs", "@/components/SongList": "_astro/SongList.f3d382c5.js", "@astrojs/solid-js/client.js": "_astro/client.8a22cdcb.js", "/astro/hoisted.js?q=0": "_astro/hoisted.90f7edda.js", "/Users/didi/Developer/mayday.teleprompter/node_modules/.pnpm/workbox-window@7.0.0/node_modules/workbox-window/build/workbox-window.prod.es5.mjs": "_astro/workbox-window.prod.es5.a7b12eab.js", "astro:scripts/before-hydration.js": "" }, "assets": ["/_astro/controller.be67fa63.css", "/apple-touch-icon.png", "/favicon.ico", "/manifest.webmanifest", "/mask-icon.svg", "/pwa-192x192.png", "/pwa-512x512.png", "/robots.txt", "/sw.js", "/workbox-25d99430.js", "/_astro/SongList.f3d382c5.js", "/_astro/client.8a22cdcb.js", "/_astro/hoisted.90f7edda.js", "/_astro/web.d55942bc.js", "/_astro/workbox-window.prod.es5.a7b12eab.js"] }), {
  pageMap,
  renderers
});
var _args = void 0;
var _exports = createExports(_manifest2);
var _default = _exports["default"];
var _start = "start";
if (_start in adapter) {
  adapter[_start](_manifest2, _args);
}
export {
  _default as default,
  pageMap
};
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
