/**
 * Local MFE dev server — uses @nuskin/gateway-mfe (no standalone gateway app).
 * Same pattern as header-mfe: static client bundles + SSR via renderAndExtractContext.
 */
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { exampleMfeRenderer, complexDemoMfeRenderer } = await import(
  "./src/server/renderers.js"
);

const PORT = Number(process.env.PORT || 5510);
const app = express();
app.disable("x-powered-by");

const staticRoot = path.join(__dirname, "dist/static");

app.use("/static/example_mfe", express.static(path.join(staticRoot, "example_mfe")));
app.use(
  "/static/complex_demo_mfe",
  express.static(path.join(staticRoot, "complex_demo_mfe")),
);

const renderers = {
  example_mfe: exampleMfeRenderer,
  complex_demo_mfe: complexDemoMfeRenderer,
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok", library: "@nuskin/gateway-mfe" });
});

/** Storefront-style SSR probe: GET /ssr/:mfeId?url=/en/us/shop */
app.get("/ssr/:mfeId", async (req, res) => {
  const renderer = renderers[req.params.mfeId];
  if (!renderer) {
    res.status(404).json({ error: `Unknown mfeId: ${req.params.mfeId}` });
    return;
  }

  try {
    const result = await renderer.renderAndExtractContext({
      requestUrl: String(req.query.url || req.originalUrl || "/"),
      market: req.query.market,
      language: req.query.language,
    });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "SSR failed";
    res.status(500).json({ error: message });
  }
});

/** HTML preview (like header-mfe serverRender) */
app.get("/preview/:mfeId", async (req, res) => {
  const renderer = renderers[req.params.mfeId];
  if (!renderer) {
    res.status(404).send("Unknown mfeId");
    return;
  }

  try {
    const { markup, dataScript, head } = await renderer.renderAndExtractContext({
      requestUrl: String(req.query.url || "/en/us/demo"),
    });
    res.type("html").send(
      `<!DOCTYPE html><html><head>${head || ""}</head><body>${markup}${dataScript}</body></html>`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "SSR failed";
    res.status(500).send(message);
  }
});

app.listen(PORT, () => {
  console.log(`[mfe-examples] dev server (gateway-mfe library) http://localhost:${PORT}`);
  console.log(`  client  example_mfe → /static/example_mfe/remoteEntry.js`);
  console.log(`  client  complex_demo_mfe → /static/complex_demo_mfe/remoteEntry.js`);
  console.log(`  SSR     GET /ssr/example_mfe?url=...`);
  console.log(`  preview GET /preview/complex_demo_mfe?url=...`);
});
