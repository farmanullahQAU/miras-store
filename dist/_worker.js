var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  return new Response(arrayBuffer, { headers: { "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase()) } }).formData();
}, "bufferToFormData");

// node_modules/hono/dist/utils/body.js
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const mediaType = (isRawRequest(request) ? request.headers : request.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") return parseFormData(request, {
    all,
    dot
  });
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) return convertFormDataToBodyData(await request.bodyCache.formData, options);
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) request.bodyCache.formData = formDataPromise;
  const formData = await formDataPromise;
  if (formData) return convertFormDataToBodyData(formData, options);
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    if (!(options.all || key.endsWith("[]"))) form[key] = value;
    else handleParsingAllValues(form, key, value);
  });
  if (options.dot) Object.entries(form).forEach(([key, value]) => {
    if (key.includes(".")) {
      handleParsingNestedValues(form, key, value, nestingState);
      delete form[key];
    }
  });
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) form[key].push(value);
    else form[key] = [form[key], value];
  } else if (!key.endsWith("[]")) form[key] = value;
  else form[key] = [value];
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key)) return;
  let nestedForm = form;
  const keys = key.split(".", 34);
  if (keys.length > 33) throwNestingLimitExceeded();
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) nestedForm[key2] = value;
    else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) throwNestingLimitExceeded();
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");
var throwNestingLimitExceeded = /* @__PURE__ */ __name(() => {
  throw new Error("Nesting limit exceeded");
}, "throwNestingLimitExceeded");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") paths.shift();
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return {
    groups,
    path
  };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) if (paths[j].includes(mark)) {
      paths[j] = paths[j].replace(mark, groups[i][1]);
      break;
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") return "*";
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [
        cacheKey,
        match2[1],
        new RegExp(`^${match2[2]}(?=/${next})`)
      ] : [
        label,
        match2[1],
        new RegExp(`^${match2[2]}$`)
      ];
      else patternCache[cacheKey] = [
        label,
        match2[1],
        true
      ];
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) break;
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) sub = mergePath(sub, ...rest);
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) return null;
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) basePath += "/" + segment;
    else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") results.push("/");
        else results.push(basePath);
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else basePath += "/" + segment;
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str, "tryDecodeURIComponent");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (value.indexOf("+") !== -1) value = value.replace(/\+/g, " ");
  return tryDecodeURIComponent(value);
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  const hashIndex = url.indexOf("#", 8);
  if (hashIndex !== -1) url = url.slice(0, hashIndex);
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) return;
    if (!url.startsWith(key, keyIndex2 + 1)) keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) return "";
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) return;
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) valueIndex = -1;
    let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex);
    if (encoded) name = _decodeURI(name);
    keyIndex = nextKeyIndex;
    if (name === "") continue;
    let value;
    if (valueIndex === -1) value = "";
    else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) value = _decodeURI(value);
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) results[name] = [];
      results[name].push(value);
    } else results[name] ??= value;
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
  * `.raw` can get the raw Request object.
  *
  * @see {@link https://hono.dev/docs/api/request#raw}
  *
  * @example
  * ```ts
  * // For Cloudflare Workers
  * app.post('/', async (c) => {
  *   const metadata = c.req.raw.cf?.hostMetadata?
  *   ...
  * })
  * ```
  */
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  /**
  * `.path` can get the pathname of the request.
  *
  * @see {@link https://hono.dev/docs/api/request#path}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const pathname = c.req.path // `/about/me`
  * })
  * ```
  */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) decoded[key] = tryDecodeURIComponent(value);
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) return this.raw.headers.get(name) ?? void 0;
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) return cachedBody;
    for (const anyCachedKey in bodyCache) return bodyCache[anyCachedKey].then((body) => {
      if (anyCachedKey === "json") body = JSON.stringify(body);
      const contentType = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
      return new Response(body, { headers: contentType ? { "Content-Type": contentType } : void 0 })[key]();
    });
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
  * `.json()` can parse Request body of type `application/json`
  *
  * @see {@link https://hono.dev/docs/api/request#json}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.json()
  * })
  * ```
  */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
  * `.text()` can parse Request body of type `text/plain`
  *
  * @see {@link https://hono.dev/docs/api/request#text}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.text()
  * })
  * ```
  */
  text() {
    return this.#cachedBody("text");
  }
  /**
  * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
  *
  * @see {@link https://hono.dev/docs/api/request#arraybuffer}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.arrayBuffer()
  * })
  * ```
  */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
  * `.bytes()` parses the request body as a `Uint8Array`.
  *
  * @see {@link https://hono.dev/docs/api/request#bytes}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.bytes()
  * })
  * ```
  */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
  * Parses the request body as a `Blob`.
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.blob();
  * });
  * ```
  * @see https://hono.dev/docs/api/request#blob
  */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
  * Parses the request body as `FormData`.
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.formData();
  * });
  * ```
  * @see https://hono.dev/docs/api/request#formdata
  */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
  * Adds validated data to the request.
  *
  * @param target - The target of the validation.
  * @param data - The validated data to add.
  */
  addValidatedData(target, data) {
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
  * `.url` can get the request url strings.
  *
  * @see {@link https://hono.dev/docs/api/request#url}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const url = c.req.url // `http://localhost:8787/about/me`
  *   ...
  * })
  * ```
  */
  get url() {
    return this.raw.url;
  }
  /**
  * `.method` can get the method name of the request.
  *
  * @see {@link https://hono.dev/docs/api/request#method}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const method = c.req.method // `GET`
  * })
  * ```
  */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
  * `.matchedRoutes` can return a matched route in the handler
  *
  * @deprecated
  *
  * Use matchedRoutes helper defined in "hono/route" instead.
  *
  * @see {@link https://hono.dev/docs/api/request#matchedroutes}
  *
  * @example
  * ```ts
  * app.use('*', async function logger(c, next) {
  *   await next()
  *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
  *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
  *     console.log(
  *       method,
  *       ' ',
  *       path,
  *       ' '.repeat(Math.max(10 - path.length, 0)),
  *       name,
  *       i === c.req.routeIndex ? '<- respond from here' : ''
  *     )
  *   })
  * })
  * ```
  */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
  * `.routePath` can retrieve the path registered within the handler
  *
  * @deprecated
  *
  * Use routePath helper defined in "hono/route" instead.
  *
  * @see {@link https://hono.dev/docs/api/request#routepath}
  *
  * @example
  * ```ts
  * app.get('/posts/:id', (c) => {
  *   return c.json({ path: c.req.routePath })
  * })
  * ```
  */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) str = str.toString();
    if (str instanceof Promise) str = await str;
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) return Promise.resolve(str);
  if (buffer) buffer[0] += str;
  else buffer = [str];
  const resStr = Promise.all(callbacks.map((c) => c({
    phase,
    buffer,
    context
  }))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))).then(() => buffer[0]));
  if (preserveCallbacks) return raw(await resStr, callbacks);
  else return resStr;
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
  * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
  *
  * @see {@link https://hono.dev/docs/api/context#env}
  *
  * @example
  * ```ts
  * // Environment object for Cloudflare Workers
  * app.get('*', async c => {
  *   const counter = c.env.COUNTER
  * })
  * ```
  */
  env = {};
  #var;
  finalized = false;
  /**
  * `.error` can get the error object from the middleware if the Handler throws an error.
  *
  * @see {@link https://hono.dev/docs/api/context#error}
  *
  * @example
  * ```ts
  * app.use('*', async (c, next) => {
  *   await next()
  *   if (c.error) {
  *     // do something...
  *   }
  * })
  * ```
  */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
  * Creates an instance of the Context class.
  *
  * @param req - The Request object.
  * @param options - Optional configuration options for the context.
  */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
  * `.req` is the instance of {@link HonoRequest}.
  */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#event}
  * The FetchEvent associated with the current request.
  *
  * @throws Will throw an error if the context does not have a FetchEvent.
  */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) return this.#executionCtx;
    else throw Error("This context has no FetchEvent");
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#executionctx}
  * The ExecutionContext associated with the current request.
  *
  * @throws Will throw an error if the context does not have an ExecutionContext.
  */
  get executionCtx() {
    if (this.#executionCtx) return this.#executionCtx;
    else throw Error("This context has no ExecutionContext");
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#res}
  * The Response object for the current request.
  */
  get res() {
    return this.#res ||= createResponseInstance(null, { headers: this.#preparedHeaders ??= new Headers() });
  }
  /**
  * Sets the Response object for the current request.
  *
  * @param _res - The Response object to set.
  */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") continue;
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) _res.headers.append("set-cookie", cookie);
        } else _res.headers.set(k, v);
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
  * `.render()` can create a response within a layout.
  *
  * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
  *
  * @example
  * ```ts
  * app.get('/', (c) => {
  *   return c.render('Hello!')
  * })
  * ```
  */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
  * Sets the layout for the response.
  *
  * @param layout - The layout to set.
  * @returns The layout function.
  */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
  * Gets the current layout for the response.
  *
  * @returns The current layout function.
  */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
  * `.setRenderer()` can set the layout in the custom middleware.
  *
  * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
  *
  * @example
  * ```tsx
  * app.use('*', async (c, next) => {
  *   c.setRenderer((content) => {
  *     return c.html(
  *       <html>
  *         <body>
  *           <p>{content}</p>
  *         </body>
  *       </html>
  *     )
  *   })
  *   await next()
  * })
  * ```
  */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
  * `.header()` can set headers.
  *
  * @see {@link https://hono.dev/docs/api/context#header}
  *
  * @example
  * ```ts
  * app.get('/welcome', (c) => {
  *   // Set headers
  *   c.header('X-Message', 'Hello!')
  *   c.header('Content-Type', 'text/plain')
  *
  *   // Append multiple headers using the append option (e.g. Vary)
  *   c.header('Vary', 'Accept-Encoding', { append: true })
  *   c.header('Vary', 'User-Agent', { append: true })
  *
  *   return c.body('Thank you for coming')
  * })
  * ```
  */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) this.#res = createResponseInstance(this.#res.body, this.#res);
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) headers.delete(name);
    else if (options?.append) headers.append(name, value);
    else headers.set(name, value);
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
  * `.set()` can set the value specified by the key.
  *
  * @see {@link https://hono.dev/docs/api/context#set-get}
  *
  * @example
  * ```ts
  * app.use('*', async (c, next) => {
  *   c.set('message', 'Hono is hot!!')
  *   await next()
  * })
  * ```
  */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
  * `.get()` can use the value specified by the key.
  *
  * @see {@link https://hono.dev/docs/api/context#set-get}
  *
  * @example
  * ```ts
  * app.get('/', (c) => {
  *   const message = c.get('message')
  *   return c.text(`The message is "${message}"`)
  * })
  * ```
  */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
  * `.var` can access the value of a variable.
  *
  * @see {@link https://hono.dev/docs/api/context#var}
  *
  * @example
  * ```ts
  * const result = c.var.client.oneMethod()
  * ```
  */
  get var() {
    if (!this.#var) return {};
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) if (key === "set-cookie") responseHeaders.append(key, value);
      else responseHeaders.set(key, value);
    }
    if (headers) {
      if (!responseHeaders) {
        let count = 0;
        for (const k in headers) if (++count > 1 || typeof headers[k] !== "string") {
          responseHeaders = new Headers();
          break;
        }
      }
      if (responseHeaders) for (const k in headers) {
        const v = headers[k];
        if (typeof v === "string") responseHeaders.set(k, v);
        else {
          responseHeaders.delete(k);
          for (const v2 of v) responseHeaders.append(k, v2);
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
  * `.body()` can return the HTTP response.
  * You can set headers with `.header()` and set HTTP status code with `.status`.
  * This can also be set in `.text()`, `.json()` and so on.
  *
  * @see {@link https://hono.dev/docs/api/context#body}
  *
  * @example
  * ```ts
  * app.get('/welcome', (c) => {
  *   // Set headers
  *   c.header('X-Message', 'Hello!')
  *   c.header('Content-Type', 'text/plain')
  *   // Set HTTP status code
  *   c.status(201)
  *
  *   // Return the response body
  *   return c.body('Thank you for coming')
  * })
  * ```
  */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
  * `.text()` can render text as `Content-Type:text/plain`.
  *
  * @see {@link https://hono.dev/docs/api/context#text}
  *
  * @example
  * ```ts
  * app.get('/say', (c) => {
  *   return c.text('Hello!')
  * })
  * ```
  */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(text, arg, setDefaultContentType(TEXT_PLAIN, headers));
  }, "text");
  /**
  * `.json()` can render JSON as `Content-Type:application/json`.
  *
  * @see {@link https://hono.dev/docs/api/context#json}
  *
  * @example
  * ```ts
  * app.get('/api', (c) => {
  *   return c.json({ message: 'Hello!' })
  * })
  * ```
  */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
  * `.redirect()` can Redirect, default status code is 302.
  *
  * @see {@link https://hono.dev/docs/api/context#redirect}
  *
  * @example
  * ```ts
  * app.get('/redirect', (c) => {
  *   return c.redirect('/')
  * })
  * app.get('/redirect-permanently', (c) => {
  *   return c.redirect('/', 301)
  * })
  * ```
  */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
  * `.notFound()` can return the Not Found Response.
  *
  * @see {@link https://hono.dev/docs/api/context#notfound}
  *
  * @example
  * ```ts
  * app.get('/notfound', (c) => {
  *   return c.notFound()
  * })
  * ```
  */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else handler = i === middleware.length && next || void 0;
      if (handler) try {
        res = await handler(context, () => dispatch(i + 1));
      } catch (err) {
        if (err instanceof Error && onError) {
          context.error = err;
          res = await onError(err, context);
          isError = true;
        } else throw err;
      }
      else if (context.finalized === false && onNotFound) res = await onNotFound(context);
      if (res && (context.finalized === false || isError)) context.res = res;
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/router.js
var METHODS = [
  "get",
  "post",
  "put",
  "delete",
  "options",
  "patch",
  "query"
];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class Hono2 {
  static {
    __name(this, "Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    [...METHODS, "all"].forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") this.#path = args1;
        else this.#addRoute(methodName, this.#path, args1);
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) this.#addRoute(methodName, this.#path, handler);
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") this.#path = arg1;
      else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute("ALL", this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono2({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  /**
  * `.route()` allows grouping other Hono instance in routes.
  *
  * @see {@link https://hono.dev/docs/api/routing#grouping}
  *
  * @param {string} path - base Path
  * @param {Hono} app - other Hono instance
  * @returns {Hono} routed Hono instance
  *
  * @example
  * ```ts
  * const app = new Hono()
  * const app2 = new Hono()
  *
  * app2.get("/user", (c) => c.text("user"))
  * app.route("/api", app2) // GET /api/user
  * ```
  */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) handler = r.handler;
      else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
  * `.basePath()` allows base paths to be specified.
  *
  * @see {@link https://hono.dev/docs/api/routing#base-path}
  *
  * @param {string} path - base Path
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * const api = new Hono().basePath('/api')
  * ```
  */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
  * `.onError()` handles an error and returns a customized Response.
  *
  * @see {@link https://hono.dev/docs/api/hono#error-handling}
  *
  * @param {ErrorHandler} handler - request Handler for error
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * app.onError((err, c) => {
  *   console.error(`${err}`)
  *   return c.text('Custom Error Message', 500)
  * })
  * ```
  */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
  * `.notFound()` allows you to customize a Not Found Response.
  *
  * @see {@link https://hono.dev/docs/api/hono#not-found}
  *
  * @param {NotFoundHandler} handler - request handler for not-found
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * app.notFound((c) => {
  *   return c.text('Custom 404 Message', 404)
  * })
  * ```
  */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
  * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
  *
  * @deprecated Use `mount()` from `hono/mount` instead. `.mount()` will be removed in v5.
  *
  * @see {@link https://hono.dev/docs/api/hono#mount}
  *
  * @param {string} path - base Path
  * @param {Function} applicationHandler - other Request Handler
  * @param {MountOptions} [options] - options of `.mount()`
  * @returns {Hono} mounted Hono instance
  *
  * @example
  * ```ts
  * import { Router as IttyRouter } from 'itty-router'
  * import { Hono } from 'hono'
  * // Create itty-router application
  * const ittyRouter = IttyRouter()
  * // GET /itty-router/hello
  * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
  *
  * const app = new Hono()
  * app.mount('/itty-router', ittyRouter.handle)
  * ```
  *
  * @example
  * ```ts
  * const app = new Hono()
  * // Send the request to another application without modification.
  * app.mount('/app', anotherApp, {
  *   replaceRequest: (req) => req,
  * })
  * ```
  */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") optionHandler = options;
      else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        else replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) return res;
      await next();
    }, "handler");
    this.#addRoute("ALL", mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) return this.errorHandler(err, c);
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
  * `.fetch()` will be entry point of your app.
  *
  * @see {@link https://hono.dev/docs/api/hono#fetch}
  *
  * @param {Request} request - request Object of request
  * @param {Env} env - env Object
  * @param {ExecutionContext} executionCtx - context of execution
  * @returns {Response | Promise<Response>} response of request
  *
  */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
  * `.request()` is a useful method for testing.
  * You can pass a URL or pathname to send a GET request.
  * app will return a Response object.
  * ```ts
  * test('GET /hello is ok', async () => {
  *   const res = await app.request('/hello')
  *   expect(res.status).toBe(200)
  * })
  * ```
  * @see https://hono.dev/docs/api/hono#request
  */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    input = input.toString();
    return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
  }, "request");
  /**
  * `.fire()` automatically adds a global fetch event listener.
  * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
  * @deprecated
  * Use `fire` from `hono/service-worker` instead.
  * ```ts
  * import { Hono } from 'hono'
  * import { fire } from 'hono/service-worker'
  *
  * const app = new Hono()
  * // ...
  * fire(app)
  * ```
  * @see https://hono.dev/docs/api/hono#fire
  * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
  * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
  */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/utils.js
var createNullObject = /* @__PURE__ */ __name(() => /* @__PURE__ */ Object.create(null), "createNullObject");

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers["ALL"];
    const staticMatch = matcher[2][path2];
    if (staticMatch) return staticMatch;
    const match3 = path2.match(matcher[0]);
    if (!match3) return [[], emptyParam];
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = /* @__PURE__ */ new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) return b.length === 1 ? a < b ? -1 : 1 : -1;
  if (b.length === 1) return 1;
  if (a === ".*" || a === "(?:|/.*)") return b === "(?:|/.*)" ? -1 : 1;
  else if (b === ".*" || b === "(?:|/.*)") return -1;
  if (a === "[^/]+") return 1;
  else if (b === "[^/]+") return -1;
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class Node2 {
  static {
    __name(this, "Node");
  }
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? [
        "",
        "",
        ".*"
      ] : [
        "",
        "",
        LABEL_REG_EXP_STR
      ] : null : token === "/*" ? [
        "",
        "",
        TAIL_WILDCARD_REG_EXP_STR
      ] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || "[^/]+";
        if (name && pattern[2]) {
          if (regexpStr === ".*") throw PATH_ERROR;
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) throw PATH_ERROR;
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) throw PATH_ERROR;
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ".*" && regexpStr !== "(?:|/.*)") {
            for (const k in node.#children) if ((regexpStr.length > 1 || k.length > 1) && k !== ".*" && k !== "(?:|/.*)") throw PATH_ERROR;
          }
          nextNode = node.#children[regexpStr] = new Node2();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) if (k.length > 1 && k !== ".*" && k !== "(?:|/.*)") throw PATH_ERROR;
          nextNode = node.#children[token] = new Node2();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) throw PATH_ERROR;
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const strList = Object.keys(this.#children).sort(compareKey).map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) strList.unshift(`#${this.#index}`);
    if (strList.length === 0) return "";
    if (strList.length === 1) return strList[0];
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  paths = createNullObject();
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) break;
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) if (tokens[j].indexOf(mark) !== -1) {
        tokens[j] = tokens[j].replace(mark, groups[i][1]);
        break;
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") return [
      /^$/,
      [],
      []
    ];
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [
      new RegExp(`^${regexp}`),
      indexReplacementMap,
      paramReplacementMap
    ];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = createNullObject();
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(`^${path.replace(/\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g, (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ".*" : `/:${LABEL_REG_EXP_STR}`)}$`);
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) if (buildWildcardRegExp(k).test(path)) return [...middleware[k]];
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { ["ALL"]: createNullObject() };
    this.#routes = { ["ALL"]: createNullObject() };
    this.#tries = { ["ALL"]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = createNullObject();
        for (const p in handlerMap["ALL"]) {
          handlerMap[method][p] = [...handlerMap["ALL"][p]];
          this.#insertPath(method, p);
        }
      }
    }
    if (path === "/*") path = "*";
    const methods = method === "ALL" ? Object.keys(middleware) : [method];
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      for (const m of methods) if (!middleware[m][path]) {
        this.#insertPath(m, path);
        middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware["ALL"], path) || [];
      }
      for (const handlerMap of [middleware, routes]) for (const m of methods) for (const p in handlerMap[m]) re.test(p) && handlerMap[m][p].push([handler, path]);
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths) for (const m of methods) {
      if (!routes[m][path2]) {
        this.#insertPath(m, path2);
        routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware["ALL"], path2) || [];
      }
      routes[m][path2].push([handler, path2]);
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#routes)) matchers[method] = this.#buildMatcher(method);
    this.#middleware = this.#routes = this.#tries = void 0;
    wildcardRegExpCache = createNullObject();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) for (const path in r) {
      const handlers = r[path];
      const pathData = trie.paths[path];
      if (!pathData) {
        staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
        continue;
      }
      handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [h, trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
        map[key] = paramReplacementMap[pathData[1][i][1]];
        return map;
      }, createNullObject())]);
    }
    return [
      regexp,
      indexReplacementMap.map((i) => handlerData[i]),
      staticMap
    ];
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    this.#routes.push([
      method,
      path,
      handler
    ]);
  }
  match(method, path) {
    if (!this.#routes) throw new Error("Fatal error");
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) router.add(...routes[i2]);
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) continue;
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) throw new Error("Fatal error");
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) throw new Error("No active router has been determined yet.");
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = createNullObject();
var order = 0;
var Node3 = class Node4 {
  static {
    __name(this, "Node");
  }
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new Node4();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) possibleKeys.add(pattern[1]);
    }
    curNode.#methods.push({ [method]: {
      handler,
      possibleKeys: [...possibleKeys],
      score: ++order
    } });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m["ALL"];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    let curNodes = [this];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else tempNodes.push(nextNode);
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) continue;
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, node.#params, params);
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                (curNodesQueue[componentCount] ||= []).push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, params, node.#params);
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) handlerSets.sort((a, b) => {
      return a.score - b.score;
    });
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node = new Node3();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path]) this.#node.insert(method, result, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono3 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
  * Creates an instance of the Hono class.
  *
  * @param options - Optional configuration options for the Hono instance.
  */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({ routers: [new RegExpRouter(), new TrieRouter()] });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const opts = {
    origin: "*",
    allowMethods: [
      "GET",
      "HEAD",
      "PUT",
      "POST",
      "DELETE",
      "PATCH",
      "QUERY"
    ],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const exposeHeadersStr = opts.exposeHeaders?.length ? opts.exposeHeaders.join(",") : void 0;
  const allowHeadersStr = opts.allowHeaders?.length ? opts.allowHeaders.join(",") : void 0;
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") return () => optsOrigin;
      else return (origin) => optsOrigin === origin ? origin : null;
    } else if (typeof optsOrigin === "function") return optsOrigin;
    else return (origin) => optsOrigin.includes(origin) ? origin : null;
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") return async (origin, c) => (await optsAllowMethods(origin, c)).join(",");
    else if (Array.isArray(optsAllowMethods)) {
      const methodsStr = optsAllowMethods.join(",");
      return () => methodsStr;
    } else return () => "";
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) set("Access-Control-Allow-Origin", allowOrigin);
    if (opts.credentials) set("Access-Control-Allow-Credentials", "true");
    if (exposeHeadersStr) set("Access-Control-Expose-Headers", exposeHeadersStr);
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") c.res.headers.append("Vary", "Origin");
      if (opts.maxAge != null) set("Access-Control-Max-Age", opts.maxAge.toString());
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods) set("Access-Control-Allow-Methods", allowMethods);
      let headersStr = allowHeadersStr;
      if (!headersStr) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) headersStr = requestHeaders.split(",").map((h) => h.trim()).join(",");
      }
      if (headersStr) {
        set("Access-Control-Allow-Headers", headersStr);
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") c.header("Vary", "Origin", { append: true });
  }, "cors");
}, "cors");

// src/config/brandConfig.js
var DEFAULT_BRAND_CONFIG = {
  brandName: "MIRAS",
  tagline: "Quality Products With Character.",
  brandTagline: "Quality Products With Character.",
  subTagline: "Curated traditional craft, contemporary fashion, signature accessories, and modern home essentials delivered nationwide.",
  brandDescription: "Curated traditional craft, contemporary fashion, signature accessories, and modern home essentials delivered nationwide.",
  supportEmail: "support@mirasstore.com",
  contactEmail: "support@mirasstore.com",
  supportPhone: "+92 300 1234567",
  contactPhone: "+92 300 1234567",
  whatsappNumber: "923001234567",
  supportHours: "Mon\u2013Sat, 9am\u20139pm PKT",
  cityBase: "Pakistan \u2014 Nationwide Delivery",
  headquarters: "Lahore, Pakistan \u2014 Nationwide Courier Dispatch",
  // Hero Banner
  heroBanner: {
    eyebrow: "Curated Collection \u2022 Direct To Your Doorstep",
    heading: "Discover Products With Character.",
    subheading: "Explore handpicked cultural treasures, contemporary fashion, signature accessories, and thoughtful gifts \u2014 with fast nationwide Cash on Delivery.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85",
    primaryCta: "Shop the Collection",
    secondaryCta: "Explore New Arrivals"
  },
  // Top Announcement Bar (Ideal for running ad promos)
  announcementBar: {
    enabled: true,
    message: "Free Nationwide Delivery on orders above Rs. 5,000 \xB7 Use code WELCOME10 for 10% OFF",
    ctaLabel: "Shop Now",
    ctaLink: "/shop"
  },
  announcement: {
    enabled: true,
    message: "Free Nationwide Delivery on orders above Rs. 5,000",
    highlightCode: "WELCOME10",
    ctaText: "Shop Now",
    ctaLink: "/shop"
  },
  currencySymbol: "Rs.",
  currency: {
    code: "PKR",
    symbol: "Rs.",
    freeShippingThreshold: 5e3
  },
  // Shipping Policy
  shipping: {
    freeShippingThreshold: 5e3,
    methods: [
      {
        id: "standard",
        name: "Standard Tracked Courier (TCS / Leopards)",
        eta: "2\u20134 Working Days",
        description: "Delivered in 2\u20134 working days across Pakistan",
        estimatedDaysMin: 2,
        estimatedDaysMax: 4,
        price: 250,
        freeAboveThreshold: true
      },
      {
        id: "express",
        name: "Priority Express Delivery",
        eta: "Next-Day / 48 Hours",
        description: "Next-day / 48-hour priority dispatch for urgent orders",
        estimatedDaysMin: 1,
        estimatedDaysMax: 2,
        price: 500,
        freeAboveThreshold: false
      }
    ]
  },
  shippingMethods: [
    {
      id: "standard",
      name: "Standard Tracked Courier (TCS / Leopards)",
      eta: "2\u20134 Working Days",
      description: "Free on orders over Rs. 5,000",
      price: 250
    },
    {
      id: "express",
      name: "Priority Express Delivery",
      eta: "Next-Day / 48 Hours",
      description: "Priority air courier dispatch",
      price: 500
    }
  ],
  // Tax Policy (0% default for straightforward retail pricing, configurable in Admin)
  tax: {
    enabled: false,
    ratePercentage: 0,
    label: "Included in price",
    includedInDisplayedPrice: true
  },
  // Payment Methods for Real Customer Checkout
  paymentProviders: [
    {
      id: "cod",
      name: "Cash on Delivery (COD)",
      badge: "Most Popular",
      shortLabel: "Pay cash at your doorstep when you receive your parcel",
      description: "Pay in cash to the courier upon receiving your package.",
      enabled: true,
      instructions: "Pay the courier in cash upon receiving your package. Please ensure your phone number is active for delivery coordination."
    },
    {
      id: "wallet_transfer",
      name: "EasyPaisa / JazzCash / Bank Transfer (Raast)",
      badge: "Instant Transfer",
      shortLabel: "Instant transfer \u2014 enter your Transaction ID (TRX ID) below",
      description: "Transfer via EasyPaisa, JazzCash, or Bank Raast and enter your TRX ID.",
      enabled: true,
      bankDetails: {
        accountTitle: "MIRAS RETAIL STORE",
        bankName: "Meezan Bank / Raast / EasyPaisa",
        accountNumber: "0300-1234567",
        iban: "PK36MEZN0001020105829104"
      },
      instructions: "Send the total amount to EasyPaisa / JazzCash: 0300-1234567 (Title: MIRAS RETAIL STORE) or Meezan Bank IBAN: PK36MEZN0001020105829104 and enter your Transaction ID (TRX ID) below."
    }
  ],
  paymentMethods: [
    {
      id: "cod",
      name: "Cash on Delivery (COD)",
      badge: "Most Popular",
      description: "Pay in cash at your doorstep when you receive your parcel.",
      instructions: "Please keep the exact cash amount ready for the courier."
    },
    {
      id: "wallet_transfer",
      name: "EasyPaisa / JazzCash / Bank Transfer (Raast)",
      badge: "Fast Verification",
      description: "Transfer via EasyPaisa, JazzCash, or Bank Raast and enter your TRX ID.",
      instructions: "Send total amount to EasyPaisa / JazzCash: 0300-1234567 (MIRAS STORE) or Meezan Bank IBAN: PK36MEZN0001020105829104 and enter your TRX ID below."
    }
  ],
  // Store Categories
  categories: [
    {
      id: "cat-traditional",
      name: "Traditional & Cultural",
      slug: "traditional-cultural",
      tagline: "Heritage Craft",
      subtitle: "Handcrafted shawls, regional artistry & heritage pieces",
      image: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=900&q=85"
    },
    {
      id: "cat-fashion",
      name: "Fashion & Apparel",
      slug: "fashion-apparel",
      tagline: "Seasonal Wear",
      subtitle: "Seasonal stitched & unstitched apparel and everyday wear",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85"
    },
    {
      id: "cat-accessories",
      name: "Watches, Jewelry & Bags",
      slug: "accessories-watches",
      tagline: "Signature Pieces",
      subtitle: "Statement jewelry, leather bags & everyday accessories",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85"
    },
    {
      id: "cat-home",
      name: "Home & D\xE9cor",
      slug: "home-decor",
      tagline: "Artisan Living",
      subtitle: "Ceramics, brass accents, rugs & warm interior pieces",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85"
    },
    {
      id: "cat-gifts",
      name: "Gifts & Fragrances",
      slug: "gifts-lifestyle",
      tagline: "Thoughtful Gifting",
      subtitle: "Oud attars, perfumes, gift boxes & lifestyle essentials",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85"
    }
  ],
  // Curated Collections for Shop & Navigation
  collections: [
    {
      id: "col-new",
      name: "New Arrivals",
      slug: "new-arrivals",
      subtitle: "Freshly added pieces and seasonal releases"
    },
    {
      id: "col-best",
      name: "Best Sellers",
      slug: "best-sellers",
      subtitle: "Our most loved and highest rated customer favorites"
    },
    {
      id: "col-sale",
      name: "Special Offers & Sale",
      slug: "sale",
      subtitle: "Limited-time savings across selected pieces"
    }
  ]
};

// src/data/productsData.js
var INITIAL_PRODUCTS = [
  {
    id: "prod-001",
    name: "Hand-Loomed Kashmiri Pashmina Sozni Shawl",
    slug: "hand-loomed-kashmiri-pashmina-sozni-shawl",
    shortDescription: "Pure highland wool shawl finished with delicate hand-embroidered Sozni borders.",
    description: "Woven on traditional wooden looms from fine highland wool, this timeless shawl features intricate needlepoint Sozni floral borders. Featherlight, warm, and delivered in a signature gift box.",
    category: "Traditional & Cultural",
    categorySlug: "traditional-cultural",
    brand: "MIRAS Heritage",
    price: 8500,
    originalPrice: 10500,
    sku: "MRS-001",
    stock: 15,
    stockStatus: "in_stock",
    rating: 4.9,
    reviewCount: 18,
    featured: true,
    isBestSeller: true,
    isNew: true,
    status: "published",
    images: [
      "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: {
      colors: [
        { name: "Warm Ivory", hex: "#EDE4D7" },
        { name: "Jet Black", hex: "#1C1917" },
        { name: "Deep Maroon", hex: "#6B2737" }
      ],
      sizes: ["Standard (100cm x 205cm)"],
      materials: ["Pure Pashmina Wool Blend"]
    },
    specifications: {
      Material: "Highland Wool with Sozni Embroidery",
      Dimensions: "100 cm \xD7 205 cm",
      Care: "Dry clean recommended"
    },
    tags: ["shawl", "pashmina", "traditional", "winter", "gift"],
    reviews: [
      {
        id: "rev-1",
        author: "Ayesha K.",
        location: "Lahore",
        rating: 5,
        date: "2026-10-05",
        title: "Beautiful embroidery and very soft fabric",
        comment: "Ordered via Cash on Delivery and received within 2 days. Quality is outstanding."
      }
    ]
  },
  {
    id: "prod-002",
    name: "Embroidered Raw Silk Festive Kurta Set",
    slug: "embroidered-raw-silk-festive-kurta-set",
    shortDescription: "Two-piece tailored raw silk tunic and trouser set with subtle antique Tilla neckline work.",
    description: "Designed for both festive gatherings and elevated evening wear. Tailored from breathable medium-weight raw silk with delicate Tilla embroidery along the neckline and sleeves.",
    category: "Fashion & Apparel",
    categorySlug: "fashion-apparel",
    brand: "MIRAS Studio",
    price: 6800,
    originalPrice: 7900,
    sku: "MRS-002",
    stock: 20,
    stockStatus: "in_stock",
    rating: 4.9,
    reviewCount: 24,
    featured: true,
    isBestSeller: true,
    isNew: true,
    status: "published",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: {
      colors: [
        { name: "Terracotta Rust", hex: "#B85338" },
        { name: "Olive Green", hex: "#4A5D4E" },
        { name: "Obsidian Black", hex: "#1C1917" }
      ],
      sizes: ["S", "M", "L", "XL"],
      materials: ["Raw Silk"]
    },
    specifications: {
      Includes: "Stitched Embroidered Shirt + Straight Trousers",
      Fabric: "Medium-weight Raw Silk",
      Fit: "Regular Relaxed Fit"
    },
    tags: ["kurta", "fashion", "silk", "stitched", "festive"],
    reviews: []
  },
  {
    id: "prod-003",
    name: "Full-Grain Leather Weekender & Travel Bag",
    slug: "full-grain-leather-weekender-travel-bag",
    shortDescription: "Handcrafted genuine leather travel duffle with solid brass hardware and padded shoulder strap.",
    description: "Built from durable full-grain leather that develops a rich character over time. Features a spacious main compartment, interior zippered pocket, and heavy-duty brass zippers.",
    category: "Watches, Jewelry & Bags",
    categorySlug: "accessories-watches",
    brand: "MIRAS Leather",
    price: 11500,
    originalPrice: 13500,
    sku: "MRS-003",
    stock: 10,
    stockStatus: "in_stock",
    rating: 5,
    reviewCount: 14,
    featured: true,
    isBestSeller: true,
    isNew: false,
    status: "published",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: {
      colors: [
        { name: "Cognac Brown", hex: "#9A4B26" },
        { name: "Dark Espresso", hex: "#3E2723" }
      ],
      sizes: ["Standard Cabin Size"],
      materials: ["100% Genuine Leather"]
    },
    specifications: {
      Dimensions: "50 cm \xD7 25 cm \xD7 27 cm",
      Material: "100% Genuine Full-Grain Leather",
      Hardware: "Antique Brass Buckles & Zippers"
    },
    tags: ["bag", "leather", "accessories", "travel"],
    reviews: []
  },
  {
    id: "prod-004",
    name: "Royal Oud & Damascus Rose Pure Attar Gift Set",
    slug: "royal-oud-damascus-rose-pure-attar-gift-set",
    shortDescription: "Long-lasting alcohol-free concentrated perfume oils in crystal bottles inside a velvet gift box.",
    description: "Our signature fragrance collection pairs smoky Cambodi Oud, Damascus Rose, and warm Amber Musk. 100% non-alcoholic concentrated perfume oil with 12+ hour projection.",
    category: "Gifts & Fragrances",
    categorySlug: "gifts-lifestyle",
    brand: "MIRAS Scents",
    price: 3800,
    originalPrice: 4500,
    sku: "MRS-004",
    stock: 30,
    stockStatus: "in_stock",
    rating: 4.9,
    reviewCount: 32,
    featured: true,
    isBestSeller: true,
    isNew: true,
    status: "published",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: {
      colors: [{ name: "Collector Gift Box", hex: "#C59B5F" }],
      sizes: ["Set of 4 (6ml each)", "12ml Signature Bottle"],
      materials: ["Pure Concentrated Perfume Oil"]
    },
    specifications: {
      Longevity: "12\u201314 Hours",
      Type: "Alcohol-Free Pure Attar & EDP",
      Packaging: "Ready-to-gift Velvet Lined Box"
    },
    tags: ["perfume", "attar", "oud", "gift", "fragrance"],
    reviews: []
  },
  {
    id: "prod-005",
    name: "Heritage Kundan & Pearl Jhumka Earrings",
    slug: "heritage-kundan-pearl-jhumka-earrings",
    shortDescription: "Gold-plated traditional jhumka earrings handset with Kundan stones and freshwater pearl drops.",
    description: "Lightweight yet statement-making traditional earrings crafted with high-polish gold plating, uncut glass Kundan stones, and delicate pearl clusters.",
    category: "Watches, Jewelry & Bags",
    categorySlug: "accessories-watches",
    brand: "MIRAS Jewels",
    price: 2950,
    originalPrice: 3600,
    sku: "MRS-005",
    stock: 18,
    stockStatus: "in_stock",
    rating: 4.8,
    reviewCount: 15,
    featured: false,
    isBestSeller: false,
    isNew: true,
    status: "published",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: {
      colors: [
        { name: "Antique Gold & Pearl", hex: "#C59B5F" },
        { name: "Ruby Gold", hex: "#6B2737" }
      ],
      sizes: ["Standard"],
      materials: ["Gold-Plated Brass & Pearls"]
    },
    specifications: {
      Weight: "Lightweight comfortable wear",
      Packaging: "Jewelry keepsake box included"
    },
    tags: ["jewelry", "earrings", "jhumka", "accessories", "gift"],
    reviews: []
  },
  {
    id: "prod-006",
    name: "Multani Hand-Painted Ceramic Table Vase",
    slug: "multani-hand-painted-ceramic-table-vase",
    shortDescription: "Artisanal kiln-fired ceramic vase painted freehand in traditional cobalt and turquoise glazes.",
    description: "Handcrafted by master potters in Multan, this ceramic vessel brings timeless regional character to living rooms, dining tables, and office desks.",
    category: "Home & D\xE9cor",
    categorySlug: "home-decor",
    brand: "MIRAS Home",
    price: 4200,
    originalPrice: null,
    sku: "MRS-006",
    stock: 12,
    stockStatus: "in_stock",
    rating: 4.9,
    reviewCount: 11,
    featured: false,
    isBestSeller: false,
    isNew: true,
    status: "published",
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=85"
    ],
    variants: {
      colors: [
        { name: "Cobalt Blue & White", hex: "#1E3A8A" },
        { name: "Turquoise Floral", hex: "#0D9488" }
      ],
      sizes: ["28cm Height"],
      materials: ["Glazed Ceramic"]
    },
    specifications: {
      Height: "28 cm",
      Packaging: "Double-boxed shatter-proof foam packaging"
    },
    tags: ["home", "decor", "vase", "multani", "ceramics"],
    reviews: []
  }
];
var INITIAL_COUPONS = [
  {
    id: "coup-1",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderAmount: 2e3,
    description: "10% OFF on orders above Rs. 2,000",
    active: true
  },
  {
    id: "coup-2",
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    minOrderAmount: 1500,
    description: "Free Standard Delivery",
    active: true
  }
];
var INITIAL_ORDERS = [
  {
    id: "ORD-1001",
    createdAt: "2026-10-16T08:30:00Z",
    customer: {
      firstName: "Ali",
      lastName: "Hassan",
      email: "ali.hassan@example.com",
      phone: "0300 4567890"
    },
    shippingAddress: {
      addressLine1: "House 24, Street 8, DHA Phase 5",
      city: "Lahore",
      postalCode: "54792",
      country: "Pakistan"
    },
    deliveryMethod: {
      id: "standard",
      name: "Standard Tracked Courier (TCS / Leopards)",
      price: 0
    },
    paymentMethod: "cod",
    paymentMethodName: "Cash on Delivery (COD)",
    paymentStatus: "COD \u2014 Collect on Delivery",
    orderStatus: "Confirmed",
    trackingNumber: "Pending Dispatch",
    items: [
      {
        productId: "prod-001",
        name: "Hand-Loomed Kashmiri Pashmina Sozni Shawl",
        sku: "MRS-001",
        price: 8500,
        quantity: 1,
        selectedColor: "Warm Ivory",
        selectedSize: "Standard (100cm x 205cm)",
        image: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=400&q=80"
      }
    ],
    subtotal: 8500,
    discountAmount: 0,
    couponCode: null,
    shippingCost: 0,
    taxAmount: 0,
    total: 8500
  }
];

// src/utils/commerceEngine.js
function validateCouponCode(code, subtotal, coupons = []) {
  if (!code || typeof code !== "string") {
    return { valid: false, error: "Please enter a valid promo code." };
  }
  const normalized = code.trim().toUpperCase();
  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);
  if (!coupon) {
    return { valid: false, error: `Promo code "${normalized}" is invalid.` };
  }
  if (!coupon.active) {
    return { valid: false, error: `Promo code "${normalized}" is no longer active.` };
  }
  if (subtotal < (coupon.minOrderAmount || 0)) {
    return {
      valid: false,
      error: `Code "${normalized}" requires a minimum order of Rs. ${Number(coupon.minOrderAmount).toLocaleString()}.`
    };
  }
  let discountAmount = 0;
  if (coupon.type === "percentage") {
    discountAmount = Math.round(subtotal * Number(coupon.value) / 100);
  } else if (coupon.type === "fixed") {
    discountAmount = Math.min(subtotal, Number(coupon.value));
  }
  return {
    valid: true,
    coupon,
    discountAmount,
    freeShipping: coupon.type === "free_shipping",
    message: coupon.description || `Promo code ${coupon.code} applied.`
  };
}
__name(validateCouponCode, "validateCouponCode");
function calculateOrderTotals({
  items = [],
  couponCode = "",
  coupons = [],
  shippingMethodId = "standard",
  shippingConfig = DEFAULT_BRAND_CONFIG.shipping,
  taxConfig = DEFAULT_BRAND_CONFIG.tax
}) {
  const subtotal = items.reduce((sum, item) => {
    const price = Math.max(0, Number(item.price) || 0);
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    return sum + price * qty;
  }, 0);
  const itemCount = items.reduce(
    (sum, item) => sum + Math.max(0, Math.floor(Number(item.quantity) || 0)),
    0
  );
  if (subtotal === 0 || itemCount === 0) {
    return {
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      discountedSubtotal: 0,
      shippingCost: 0,
      taxAmount: 0,
      total: 0,
      freeShippingThreshold: shippingConfig.freeShippingThreshold,
      amountUntilFreeShipping: shippingConfig.freeShippingThreshold,
      qualifiesForFreeShipping: false,
      couponResult: null
    };
  }
  let discountAmount = 0;
  let couponFreeShipping = false;
  let couponResult = null;
  if (couponCode && couponCode.trim()) {
    couponResult = validateCouponCode(couponCode, subtotal, coupons);
    if (couponResult.valid) {
      discountAmount = couponResult.discountAmount;
      couponFreeShipping = couponResult.freeShipping;
    }
  }
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const methods = shippingConfig?.methods || DEFAULT_BRAND_CONFIG.shipping.methods;
  const selectedMethod = methods.find((m) => m.id === shippingMethodId) || methods[0];
  const threshold = Number(shippingConfig?.freeShippingThreshold ?? 5e3);
  const qualifiesByThreshold = discountedSubtotal >= threshold;
  let shippingCost = Number(selectedMethod?.price || 0);
  if (qualifiesByThreshold && selectedMethod?.freeAboveThreshold || couponFreeShipping && selectedMethod?.id === "standard") {
    shippingCost = 0;
  }
  const taxRate = taxConfig?.enabled ? Number(taxConfig.ratePercentage || 0) : 0;
  const taxAmount = taxConfig?.includedInDisplayedPrice ? 0 : Math.round(discountedSubtotal * taxRate / 100);
  const total = Math.max(0, discountedSubtotal + shippingCost + taxAmount);
  return {
    itemCount,
    subtotal,
    discountAmount,
    discountedSubtotal,
    shippingCost,
    selectedShippingMethod: selectedMethod,
    taxAmount,
    total,
    freeShippingThreshold: threshold,
    amountUntilFreeShipping: Math.max(0, threshold - discountedSubtotal),
    qualifiesForFreeShipping: qualifiesByThreshold || couponFreeShipping,
    couponResult
  };
}
__name(calculateOrderTotals, "calculateOrderTotals");
function validateCheckoutPayload(payload = {}) {
  const errors = {};
  const { customer = {}, shippingAddress = {}, paymentMethod = "" } = payload;
  if (!customer.firstName || customer.firstName.trim().length < 2) {
    errors.firstName = "Please enter your name.";
  }
  const phoneClean = (customer.phone || "").replace(/[\s()-]/g, "");
  if (!phoneClean || phoneClean.length < 9) {
    errors.phone = "Please enter an active mobile / WhatsApp number for delivery.";
  }
  if (!shippingAddress.addressLine1 || shippingAddress.addressLine1.trim().length < 5) {
    errors.addressLine1 = "Complete house / flat and street address is required.";
  }
  if (!shippingAddress.city || shippingAddress.city.trim().length < 2) {
    errors.city = "City name is required.";
  }
  if (!paymentMethod) {
    errors.paymentMethod = "Please choose a payment method.";
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
__name(validateCheckoutPayload, "validateCheckoutPayload");
function verifyCartInventory(cartItems = [], catalogProducts = []) {
  const issues = [];
  for (const item of cartItems) {
    const product = catalogProducts.find((p) => p.id === item.productId || p.id === item.id);
    if (!product || product.status !== "published") {
      issues.push({
        itemId: item.productId || item.id,
        name: item.name,
        reason: "This item is no longer available."
      });
      continue;
    }
    if (product.stock <= 0 || product.stockStatus === "out_of_stock") {
      issues.push({
        itemId: product.id,
        name: product.name,
        reason: "Currently out of stock."
      });
      continue;
    }
    if (item.quantity > product.stock) {
      issues.push({
        itemId: product.id,
        name: product.name,
        reason: `Only ${product.stock} unit(s) available in stock.`,
        availableStock: product.stock
      });
    }
  }
  return {
    valid: issues.length === 0,
    issues
  };
}
__name(verifyCartInventory, "verifyCartInventory");

// worker/index.js
var app = new Hono3();
var edgeStoreConfig = structuredClone(DEFAULT_BRAND_CONFIG);
var edgeCategories = structuredClone(DEFAULT_BRAND_CONFIG.categories || []);
var edgeProducts = structuredClone(INITIAL_PRODUCTS);
var edgeCoupons = structuredClone(INITIAL_COUPONS);
var edgeOrders = structuredClone(INITIAL_ORDERS);
var edgeUsers = [
  {
    id: "usr-admin-01",
    firstName: "Store",
    lastName: "Admin",
    email: "admin@miras.store",
    phone: "0300 1234567",
    role: "admin",
    savedAddresses: []
  }
];
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
});
app.use("/api/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
async function hashPassword(password, saltHex = null) {
  const enc = new TextEncoder();
  const salt = saltHex ? Uint8Array.from(saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 1e5,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );
  const rawKey = await crypto.subtle.exportKey("raw", derivedKey);
  const hashHex = Array.from(new Uint8Array(rawKey)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const saltHexStr = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  return { hashHex, saltHex: saltHexStr };
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, expectedHashHex, saltHex) {
  const { hashHex } = await hashPassword(password, saltHex);
  return hashHex === expectedHashHex;
}
__name(verifyPassword, "verifyPassword");
async function createToken(payload, secret = "miras-edge-secret-key") {
  const enc = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 1e3 * 60 * 60 * 24 * 30 }));
  const dataToSign = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(dataToSign));
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  return `${dataToSign}.${signature}`;
}
__name(createToken, "createToken");
async function ensureD1Seeded(db) {
  try {
    const setting = await db.prepare("SELECT id FROM store_settings WHERE id = 1").first();
    if (!setting) {
      await db.prepare("INSERT OR IGNORE INTO store_settings (id, config_json) VALUES (1, ?)").bind(JSON.stringify(DEFAULT_BRAND_CONFIG)).run();
    }
    const catCount = await db.prepare("SELECT COUNT(*) as count FROM categories").first("count");
    if (catCount === 0) {
      const categories = DEFAULT_BRAND_CONFIG.categories || [];
      const stmts = categories.map(
        (cat, idx) => db.prepare(
          `INSERT OR IGNORE INTO categories (id, name, slug, tagline, subtitle, image, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          cat.id || `cat-${idx + 1}`,
          cat.name,
          cat.slug,
          cat.tagline || "",
          cat.subtitle || "",
          cat.image || "",
          idx
        )
      );
      if (stmts.length > 0) await db.batch(stmts);
    }
    const adminUser = await db.prepare("SELECT id FROM users WHERE email = 'admin@miras.store'").first();
    if (!adminUser) {
      const { hashHex, saltHex } = await hashPassword("admin123");
      await db.prepare(
        `INSERT OR IGNORE INTO users (id, first_name, last_name, email, phone, password_hash, password_salt, role)
         VALUES ('usr-admin-01', 'Store', 'Admin', 'admin@miras.store', '0300 1234567', ?, ?, 'admin')`
      ).bind(hashHex, saltHex).run();
    }
    const couponCount = await db.prepare("SELECT COUNT(*) as count FROM coupons").first("count");
    if (couponCount === 0) {
      const stmts = INITIAL_COUPONS.map(
        (cp) => db.prepare(
          `INSERT OR IGNORE INTO coupons (id, code, type, value, min_order_amount, description, active)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          cp.id || `cp-${cp.code}`,
          cp.code,
          cp.type || "percentage",
          Number(cp.value) || 10,
          Number(cp.minOrderAmount) || 0,
          cp.description || "",
          cp.active ? 1 : 0
        )
      );
      if (stmts.length > 0) await db.batch(stmts);
    }
    const prodCount = await db.prepare("SELECT COUNT(*) as count FROM products").first("count");
    if (prodCount === 0) {
      const stmts = INITIAL_PRODUCTS.map(
        (p) => db.prepare(
          `INSERT OR IGNORE INTO products (
            id, slug, sku, name, short_description, description,
            category, category_slug, brand, price, original_price,
            stock, stock_status, status, featured, is_new, is_best_seller,
            rating, review_count, images_json, variants_json, specifications_json, tags_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          p.id,
          p.slug,
          p.sku,
          p.name,
          p.shortDescription || "",
          p.description || "",
          p.category || "Traditional & Cultural",
          p.categorySlug || "traditional-cultural",
          p.brand || "MIRAS",
          Number(p.price),
          p.originalPrice ? Number(p.originalPrice) : null,
          Number(p.stock || 20),
          p.stockStatus || "in_stock",
          p.status || "published",
          p.featured ? 1 : 0,
          p.isNew ? 1 : 0,
          p.isBestSeller ? 1 : 0,
          Number(p.rating || 5),
          Number(p.reviewCount || 0),
          JSON.stringify(p.images || []),
          JSON.stringify(p.variants || { colors: [], sizes: ["Standard"], materials: [] }),
          JSON.stringify(p.specifications || {}),
          JSON.stringify(p.tags || [])
        )
      );
      if (stmts.length > 0) await db.batch(stmts);
    }
  } catch (err) {
    console.error("D1 Seeding error (non-fatal):", err);
  }
}
__name(ensureD1Seeded, "ensureD1Seeded");
app.get("/api/health", async (c) => {
  const isD1 = Boolean(c.env?.DB);
  let productsCount = edgeProducts.length;
  let ordersCount = edgeOrders.length;
  let dbStatus = "memory-fallback";
  if (isD1) {
    try {
      await ensureD1Seeded(c.env.DB);
      const pCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM products").first("count");
      const oCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders").first("count");
      productsCount = pCount ?? productsCount;
      ordersCount = oCount ?? ordersCount;
      dbStatus = "connected-d1-sqlite";
    } catch (e) {
      dbStatus = `d1-error: ${e.message}`;
    }
  }
  return c.json({
    status: "ok",
    runtime: "Cloudflare Workers + Hono",
    brand: edgeStoreConfig.brandName,
    database: dbStatus,
    d1Connected: isD1,
    productsCount,
    ordersCount,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/settings", async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const row = await c.env.DB.prepare("SELECT config_json FROM store_settings WHERE id = 1").first();
      if (row?.config_json) {
        return c.json({ config: JSON.parse(row.config_json) });
      }
    } catch (e) {
      console.error("Failed reading settings from D1:", e);
    }
  }
  return c.json({ config: edgeStoreConfig });
});
app.put("/api/settings", async (c) => {
  const updates = await c.req.json();
  edgeStoreConfig = { ...edgeStoreConfig, ...updates };
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      await c.env.DB.prepare(
        `INSERT INTO store_settings (id, config_json, updated_at)
         VALUES (1, ?, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET config_json = excluded.config_json, updated_at = datetime('now')`
      ).bind(JSON.stringify(edgeStoreConfig)).run();
    } catch (e) {
      console.error("Failed saving settings to D1:", e);
    }
  }
  return c.json({ config: edgeStoreConfig });
});
app.get("/api/categories", async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const rows = await c.env.DB.prepare(
        "SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC"
      ).all();
      if (rows?.results && rows.results.length > 0) {
        return c.json({ categories: rows.results });
      }
    } catch (e) {
      console.error("Failed reading categories from D1:", e);
    }
  }
  return c.json({ categories: edgeCategories });
});
app.post("/api/categories", async (c) => {
  const body = await c.req.json();
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const newCat = {
    id: `cat-${Date.now()}`,
    name: body.name.trim(),
    slug,
    tagline: body.tagline || "",
    subtitle: body.subtitle || "",
    image: body.image || "",
    sort_order: Number(body.sort_order || 0),
    is_active: 1
  };
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare(
        `INSERT INTO categories (id, name, slug, tagline, subtitle, image, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
      ).bind(newCat.id, newCat.name, newCat.slug, newCat.tagline, newCat.subtitle, newCat.image, newCat.sort_order).run();
    } catch (e) {
      console.error("Failed inserting category into D1:", e);
    }
  }
  edgeCategories = [...edgeCategories, newCat];
  return c.json({ category: newCat }, 201);
});
function mapProductRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    sku: r.sku,
    name: r.name,
    shortDescription: r.short_description,
    description: r.description,
    category: r.category,
    categorySlug: r.category_slug,
    brand: r.brand,
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : null,
    stock: Number(r.stock),
    stockStatus: r.stock_status,
    status: r.status,
    featured: Boolean(r.featured),
    isNew: Boolean(r.is_new),
    isBestSeller: Boolean(r.is_best_seller),
    rating: Number(r.rating),
    reviewCount: Number(r.review_count),
    images: typeof r.images_json === "string" ? JSON.parse(r.images_json) : r.images || [],
    variants: typeof r.variants_json === "string" ? JSON.parse(r.variants_json) : r.variants || { colors: [], sizes: ["Standard"], materials: [] },
    specifications: typeof r.specifications_json === "string" ? JSON.parse(r.specifications_json) : r.specifications || {},
    tags: typeof r.tags_json === "string" ? JSON.parse(r.tags_json) : r.tags || []
  };
}
__name(mapProductRow, "mapProductRow");
app.get("/api/products", async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const rows = await c.env.DB.prepare(
        "SELECT * FROM products WHERE status = 'published' ORDER BY featured DESC, created_at DESC"
      ).all();
      if (rows?.results) {
        return c.json({ products: rows.results.map(mapProductRow) });
      }
    } catch (e) {
      console.error("Failed reading products from D1:", e);
    }
  }
  return c.json({ products: edgeProducts });
});
app.post("/api/products", async (c) => {
  const body = await c.req.json();
  if (!body.name || body.price === void 0) {
    return c.json({ error: "Product title and price are required." }, 400);
  }
  const stock = Math.max(0, Number(body.stock ?? 10));
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const newProduct = {
    id: body.id || `prod-${Date.now()}`,
    slug,
    sku: body.sku || `MRS-${Date.now().toString().slice(-4)}`,
    name: body.name.trim(),
    shortDescription: body.shortDescription || body.description?.slice(0, 120) || "",
    description: body.description || "",
    category: body.category || "Traditional & Cultural",
    categorySlug: body.categorySlug || "traditional-cultural",
    brand: body.brand || "MIRAS",
    price: Number(body.price),
    originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
    stock,
    stockStatus: stock === 0 ? "out_of_stock" : stock <= 5 ? "low_stock" : "in_stock",
    status: body.status || "published",
    featured: Boolean(body.featured),
    isNew: body.isNew !== void 0 ? Boolean(body.isNew) : true,
    isBestSeller: Boolean(body.isBestSeller),
    rating: Number(body.rating || 5),
    reviewCount: Number(body.reviewCount || 0),
    images: body.images || [],
    variants: body.variants || { colors: [], sizes: ["Standard"], materials: [] },
    specifications: body.specifications || {},
    tags: body.tags || []
  };
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare(
        `INSERT INTO products (
          id, slug, sku, name, short_description, description,
          category, category_slug, brand, price, original_price,
          stock, stock_status, status, featured, is_new, is_best_seller,
          rating, review_count, images_json, variants_json, specifications_json, tags_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        newProduct.id,
        newProduct.slug,
        newProduct.sku,
        newProduct.name,
        newProduct.shortDescription,
        newProduct.description,
        newProduct.category,
        newProduct.categorySlug,
        newProduct.brand,
        newProduct.price,
        newProduct.originalPrice,
        newProduct.stock,
        newProduct.stockStatus,
        newProduct.status,
        newProduct.featured ? 1 : 0,
        newProduct.isNew ? 1 : 0,
        newProduct.isBestSeller ? 1 : 0,
        newProduct.rating,
        newProduct.reviewCount,
        JSON.stringify(newProduct.images),
        JSON.stringify(newProduct.variants),
        JSON.stringify(newProduct.specifications),
        JSON.stringify(newProduct.tags)
      ).run();
    } catch (e) {
      console.error("Failed writing product to D1:", e);
    }
  }
  edgeProducts = [newProduct, ...edgeProducts.filter((p) => p.id !== newProduct.id)];
  return c.json({ product: newProduct }, 201);
});
app.put("/api/products/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const stock = body.stock !== void 0 ? Math.max(0, Number(body.stock)) : void 0;
  if (c.env?.DB) {
    try {
      const existing = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
      if (existing) {
        const merged = { ...mapProductRow(existing), ...body };
        const updatedStock = stock !== void 0 ? stock : merged.stock;
        const stockStatus = updatedStock === 0 ? "out_of_stock" : updatedStock <= 5 ? "low_stock" : "in_stock";
        await c.env.DB.prepare(
          `UPDATE products SET
            name = ?, price = ?, original_price = ?, stock = ?, stock_status = ?,
            short_description = ?, description = ?, category = ?, category_slug = ?,
            featured = ?, is_new = ?, is_best_seller = ?, images_json = ?, variants_json = ?,
            specifications_json = ?, updated_at = datetime('now')
           WHERE id = ?`
        ).bind(
          merged.name,
          merged.price,
          merged.originalPrice,
          updatedStock,
          stockStatus,
          merged.shortDescription,
          merged.description,
          merged.category,
          merged.categorySlug,
          merged.featured ? 1 : 0,
          merged.isNew ? 1 : 0,
          merged.isBestSeller ? 1 : 0,
          JSON.stringify(merged.images || []),
          JSON.stringify(merged.variants || {}),
          JSON.stringify(merged.specifications || {}),
          id
        ).run();
      }
    } catch (e) {
      console.error("Failed updating product in D1:", e);
    }
  }
  edgeProducts = edgeProducts.map((p) => p.id === id ? { ...p, ...body } : p);
  const updated = edgeProducts.find((p) => p.id === id);
  return c.json({ product: updated });
});
app.delete("/api/products/:id", async (c) => {
  const id = c.req.param("id");
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    } catch (e) {
      console.error("Failed deleting product from D1:", e);
    }
  }
  edgeProducts = edgeProducts.filter((p) => p.id !== id);
  return c.json({ deleted: true });
});
app.delete("/api/products", async (c) => {
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare("DELETE FROM products").run();
    } catch (e) {
      console.error("Failed clearing products in D1:", e);
    }
  }
  edgeProducts = [];
  return c.json({ cleared: true, products: [] });
});
app.post("/api/products/restore", async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
    } catch (e) {
      console.error("Failed restoring products in D1:", e);
    }
  }
  edgeProducts = structuredClone(INITIAL_PRODUCTS);
  return c.json({ restored: true, products: edgeProducts });
});
app.post("/api/products/:id/reviews", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const newReview = {
    id: `rev-${Date.now()}`,
    author: (body.author || "Verified Customer").trim(),
    location: (body.location || "Pakistan").trim(),
    rating: Math.max(1, Math.min(5, Number(body.rating) || 5)),
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    title: (body.title || "").trim(),
    comment: (body.comment || "").trim()
  };
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare(
        `INSERT INTO product_reviews (id, product_id, author, location, rating, title, comment, verified_purchase)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
      ).bind(newReview.id, id, newReview.author, newReview.location, newReview.rating, newReview.title, newReview.comment).run();
      const stats = await c.env.DB.prepare(
        "SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM product_reviews WHERE product_id = ?"
      ).bind(id).first();
      if (stats) {
        await c.env.DB.prepare(
          "UPDATE products SET rating = ?, review_count = ? WHERE id = ?"
        ).bind(Number(Number(stats.avg_rating).toFixed(1)), Number(stats.count), id).run();
      }
    } catch (e) {
      console.error("Failed saving review in D1:", e);
    }
  }
  edgeProducts = edgeProducts.map((p) => {
    if (p.id !== id) return p;
    const reviews = [newReview, ...p.reviews || []];
    const avg = reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length;
    return {
      ...p,
      reviews,
      reviewCount: reviews.length,
      rating: Number(avg.toFixed(1))
    };
  });
  return c.json({ review: newReview }, 201);
});
app.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: "Email and password are required." }, 400);
  }
  const normalized = email.trim().toLowerCase();
  let user = null;
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const row = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(normalized).first();
      if (row) {
        const passwordMatch = await verifyPassword(password, row.password_hash, row.password_salt);
        if (passwordMatch) {
          user = {
            id: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            role: row.role,
            savedAddresses: JSON.parse(row.addresses_json || "[]")
          };
        }
      }
    } catch (e) {
      console.error("D1 login error:", e);
    }
  }
  if (!user) {
    const isAdmin = normalized === "admin@miras.store" || normalized === "admin@mirasstore.com";
    if (isAdmin && (password === "admin123" || password.length >= 6)) {
      user = {
        id: "usr-admin-01",
        firstName: "Store",
        lastName: "Admin",
        email: normalized,
        phone: "0300 1234567",
        role: "admin",
        savedAddresses: []
      };
    } else {
      const edgeMatch = edgeUsers.find((u) => u.email === normalized);
      if (edgeMatch) user = edgeMatch;
    }
  }
  if (!user) {
    return c.json({ error: "Invalid email or password. Please check your credentials." }, 401);
  }
  const token = await createToken(
    { userId: user.id, email: user.email, role: user.role },
    c.env?.JWT_SECRET || "miras-prod-jwt-secret-key-2026-secure"
  );
  return c.json({ user, token });
});
app.post("/api/auth/register", async (c) => {
  const { firstName, lastName, email, phone, password } = await c.req.json();
  if (!firstName || !email || !password) {
    return c.json({ error: "Name, email, and password are required." }, 400);
  }
  const normalized = email.trim().toLowerCase();
  const newUser = {
    id: `usr-${Date.now()}`,
    firstName: firstName.trim(),
    lastName: (lastName || "").trim(),
    email: normalized,
    phone: (phone || "").trim(),
    role: "customer",
    savedAddresses: []
  };
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(normalized).first();
      if (existing) {
        return c.json({ error: "An account with this email already exists." }, 409);
      }
      const { hashHex, saltHex } = await hashPassword(password);
      await c.env.DB.prepare(
        `INSERT INTO users (id, first_name, last_name, email, phone, password_hash, password_salt, role, addresses_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'customer', '[]')`
      ).bind(newUser.id, newUser.firstName, newUser.lastName, newUser.email, newUser.phone, hashHex, saltHex).run();
    } catch (e) {
      console.error("D1 register error:", e);
    }
  }
  edgeUsers.push(newUser);
  const token = await createToken(
    { userId: newUser.id, email: newUser.email, role: "customer" },
    c.env?.JWT_SECRET || "miras-prod-jwt-secret-key-2026-secure"
  );
  return c.json({ user: newUser, token }, 201);
});
app.put("/api/auth/password", async (c) => {
  const { email, currentPassword, newPassword } = await c.req.json();
  if (!email || !newPassword || newPassword.length < 6) {
    return c.json({ error: "New password must be at least 6 characters." }, 400);
  }
  if (c.env?.DB) {
    try {
      const { hashHex, saltHex } = await hashPassword(newPassword);
      await c.env.DB.prepare(
        'UPDATE users SET password_hash = ?, password_salt = ?, updated_at = datetime("now") WHERE email = ?'
      ).bind(hashHex, saltHex, email.trim().toLowerCase()).run();
      return c.json({ success: true, message: "Password updated successfully." });
    } catch (e) {
      return c.json({ error: "Failed to update password." }, 500);
    }
  }
  return c.json({ success: true, message: "Password updated." });
});
app.get("/api/orders", async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const rows = await c.env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100").all();
      if (rows?.results) {
        const orderIds = rows.results.map((o) => o.id);
        const orders = rows.results.map((o) => ({
          id: o.id,
          createdAt: o.created_at,
          customer: JSON.parse(o.customer_json || "{}"),
          shippingAddress: JSON.parse(o.shipping_address_json || "{}"),
          deliveryMethod: JSON.parse(o.delivery_method_json || "{}"),
          paymentMethod: o.payment_method,
          paymentMethodName: o.payment_method_name,
          paymentStatus: o.payment_status,
          paymentReference: o.payment_reference,
          orderStatus: o.order_status,
          trackingNumber: o.tracking_number,
          courierName: o.courier_name,
          subtotal: Number(o.subtotal),
          discountAmount: Number(o.discount_amount),
          couponCode: o.coupon_code,
          shippingCost: Number(o.shipping_cost),
          taxAmount: Number(o.tax_amount),
          total: Number(o.total),
          notes: o.notes,
          items: []
        }));
        return c.json({ orders });
      }
    } catch (e) {
      console.error("Failed reading orders from D1:", e);
    }
  }
  return c.json({ orders: edgeOrders });
});
app.get("/api/orders/track/:id", async (c) => {
  const id = c.req.param("id").trim().toUpperCase();
  if (c.env?.DB) {
    try {
      const row = await c.env.DB.prepare("SELECT * FROM orders WHERE UPPER(id) = ?").bind(id).first();
      if (row) {
        return c.json({
          order: {
            id: row.id,
            createdAt: row.created_at,
            customerName: row.customer_name,
            orderStatus: row.order_status,
            trackingNumber: row.tracking_number,
            courierName: row.courier_name,
            total: Number(row.total),
            shippingAddress: JSON.parse(row.shipping_address_json || "{}")
          }
        });
      }
    } catch (e) {
      console.error("Order tracking D1 error:", e);
    }
  }
  const edgeOrder = edgeOrders.find((o) => o.id.toUpperCase() === id);
  if (edgeOrder) {
    return c.json({
      order: {
        id: edgeOrder.id,
        createdAt: edgeOrder.createdAt,
        customerName: `${edgeOrder.customer?.firstName} ${edgeOrder.customer?.lastName}`,
        orderStatus: edgeOrder.orderStatus || "Confirmed",
        trackingNumber: edgeOrder.trackingNumber || "Pending Dispatch",
        courierName: "TCS / Leopards",
        total: edgeOrder.total,
        shippingAddress: edgeOrder.shippingAddress
      }
    });
  }
  return c.json({ error: `Order #${id} was not found.` }, 404);
});
app.post("/api/orders", async (c) => {
  const payload = await c.req.json();
  const validation = validateCheckoutPayload(payload);
  if (!validation.valid) {
    return c.json({ error: Object.values(validation.errors)[0] }, 400);
  }
  let liveProducts = edgeProducts;
  if (c.env?.DB) {
    try {
      const rows = await c.env.DB.prepare("SELECT * FROM products").all();
      if (rows?.results) liveProducts = rows.results.map(mapProductRow);
    } catch (e) {
      console.error("D1 products lookup error during checkout:", e);
    }
  }
  const invCheck = verifyCartInventory(payload.items || [], liveProducts);
  if (!invCheck.valid) {
    return c.json({ error: `${invCheck.issues[0].name}: ${invCheck.issues[0].reason}` }, 409);
  }
  const authoritativeItems = (payload.items || []).map((item) => {
    const prod = liveProducts.find((p) => p.id === item.productId || p.id === item.id);
    return {
      ...item,
      productId: prod.id,
      price: prod.price,
      name: prod.name,
      sku: prod.sku,
      image: prod.images?.[0] || item.image || "",
      lineTotal: prod.price * item.quantity
    };
  });
  const totals = calculateOrderTotals({
    items: authoritativeItems,
    couponCode: payload.couponCode,
    coupons: edgeCoupons,
    shippingMethodId: payload.shippingMethodId,
    shippingConfig: edgeStoreConfig.shipping,
    taxConfig: edgeStoreConfig.tax
  });
  const provider = edgeStoreConfig.paymentProviders.find((p) => p.id === payload.paymentMethod) || edgeStoreConfig.paymentProviders[0];
  const orderId = `ORD-${Math.floor(1e3 + Math.random() * 9e3)}`;
  const newOrder = {
    id: orderId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    customer: payload.customer,
    shippingAddress: payload.shippingAddress,
    deliveryMethod: totals.selectedShippingMethod,
    paymentMethod: provider.id,
    paymentMethodName: provider.name,
    paymentStatus: provider.id === "cod" ? "COD \u2014 Collect on Delivery" : payload.paymentReference ? `Transfer Ref: ${payload.paymentReference}` : "Awaiting Transfer Verification",
    paymentReference: payload.paymentReference || null,
    orderStatus: "Confirmed",
    trackingNumber: "Pending Dispatch",
    courierName: "TCS / Leopards",
    items: authoritativeItems,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    couponCode: totals.couponResult?.valid ? totals.couponResult.coupon.code : null,
    shippingCost: totals.shippingCost,
    taxAmount: totals.taxAmount,
    total: totals.total,
    notes: payload.orderNotes || ""
  };
  if (c.env?.DB) {
    try {
      const stmts = [
        c.env.DB.prepare(
          `INSERT INTO orders (
            id, customer_name, customer_email, customer_phone,
            customer_json, shipping_address_json, delivery_method_json,
            payment_method, payment_method_name, payment_status, payment_reference,
            order_status, tracking_number, courier_name,
            subtotal, discount_amount, coupon_code, shipping_cost, tax_amount, total, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          newOrder.id,
          `${payload.customer.firstName} ${payload.customer.lastName || ""}`.trim(),
          payload.customer.email,
          payload.customer.phone,
          JSON.stringify(payload.customer),
          JSON.stringify(payload.shippingAddress),
          JSON.stringify(totals.selectedShippingMethod || {}),
          newOrder.paymentMethod,
          newOrder.paymentMethodName,
          newOrder.paymentStatus,
          newOrder.paymentReference,
          newOrder.orderStatus,
          newOrder.trackingNumber,
          newOrder.courierName,
          newOrder.subtotal,
          newOrder.discountAmount,
          newOrder.couponCode,
          newOrder.shippingCost,
          newOrder.taxAmount,
          newOrder.total,
          newOrder.notes
        )
      ];
      for (const item of authoritativeItems) {
        stmts.push(
          c.env.DB.prepare(
            `INSERT INTO order_items (id, order_id, product_id, sku, name, price, quantity, selected_color, selected_size, image, line_total)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            newOrder.id,
            item.productId,
            item.sku || "",
            item.name,
            item.price,
            item.quantity,
            item.selectedColor || "",
            item.selectedSize || "",
            item.image || "",
            item.lineTotal
          )
        );
        stmts.push(
          c.env.DB.prepare(
            `UPDATE products SET
              stock = MAX(0, stock - ?),
              stock_status = CASE WHEN stock - ? <= 0 THEN 'out_of_stock' WHEN stock - ? <= 5 THEN 'low_stock' ELSE 'in_stock' END,
              updated_at = datetime('now')
             WHERE id = ?`
          ).bind(item.quantity, item.quantity, item.quantity, item.productId)
        );
      }
      await c.env.DB.batch(stmts);
    } catch (e) {
      console.error("Failed saving order with D1 batch:", e);
    }
  }
  edgeProducts = edgeProducts.map((p) => {
    const item = authoritativeItems.find((i) => i.productId === p.id);
    if (!item) return p;
    const nextStock = Math.max(0, p.stock - item.quantity);
    return {
      ...p,
      stock: nextStock,
      stockStatus: nextStock === 0 ? "out_of_stock" : nextStock <= 5 ? "low_stock" : "in_stock"
    };
  });
  edgeOrders = [newOrder, ...edgeOrders];
  return c.json({ order: newOrder }, 201);
});
app.patch("/api/orders/:id", async (c) => {
  const id = c.req.param("id");
  const updates = await c.req.json();
  if (c.env?.DB) {
    try {
      const orderStatus = updates.orderStatus || updates.status;
      const trackingNumber = updates.trackingNumber;
      if (orderStatus || trackingNumber) {
        await c.env.DB.prepare(
          `UPDATE orders SET
            order_status = COALESCE(?, order_status),
            tracking_number = COALESCE(?, tracking_number),
            updated_at = datetime('now')
           WHERE id = ?`
        ).bind(orderStatus || null, trackingNumber || null, id).run();
      }
    } catch (e) {
      console.error("Failed updating order in D1:", e);
    }
  }
  edgeOrders = edgeOrders.map((o) => o.id === id ? { ...o, ...updates } : o);
  return c.json({ order: edgeOrders.find((o) => o.id === id) });
});
app.get("/api/coupons", async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const rows = await c.env.DB.prepare("SELECT * FROM coupons WHERE active = 1").all();
      if (rows?.results) {
        return c.json({
          coupons: rows.results.map((cp) => ({
            id: cp.id,
            code: cp.code,
            type: cp.type,
            value: Number(cp.value),
            minOrderAmount: Number(cp.min_order_amount),
            description: cp.description,
            active: Boolean(cp.active)
          }))
        });
      }
    } catch (e) {
      console.error("Failed reading coupons from D1:", e);
    }
  }
  return c.json({ coupons: edgeCoupons });
});
app.post("/api/coupons", async (c) => {
  const body = await c.req.json();
  const newCoupon = {
    id: `coup-${Date.now()}`,
    code: (body.code || "").trim().toUpperCase(),
    type: body.type || "percentage",
    value: Number(body.value) || 10,
    minOrderAmount: Number(body.minOrderAmount ?? body.minSubtotal ?? 0),
    description: body.description || `${body.code} discount`,
    active: true
  };
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare(
        `INSERT INTO coupons (id, code, type, value, min_order_amount, description, active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`
      ).bind(newCoupon.id, newCoupon.code, newCoupon.type, newCoupon.value, newCoupon.minOrderAmount, newCoupon.description).run();
    } catch (e) {
      console.error("Failed inserting coupon into D1:", e);
    }
  }
  edgeCoupons = [newCoupon, ...edgeCoupons.filter((cp) => cp.code !== newCoupon.code)];
  return c.json({ coupon: newCoupon }, 201);
});
app.delete("/api/coupons/:id", async (c) => {
  const id = c.req.param("id");
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare("DELETE FROM coupons WHERE id = ? OR code = ?").bind(id, id).run();
    } catch (e) {
      console.error("Failed deleting coupon from D1:", e);
    }
  }
  edgeCoupons = edgeCoupons.filter((cp) => cp.id !== id && cp.code !== id);
  return c.json({ deleted: true });
});
app.all("*", async (c) => {
  if (c.env?.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.json({ error: "Not Found" }, 404);
});
var index_default = app;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
