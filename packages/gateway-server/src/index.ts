/**
 * Orchestration utilities (tests / optional multi-slot compose).
 * Production SSR: install @nuskin/gateway-mfe in each MFE — no standalone gateway app.
 */
export { compose } from "./orchestrator/compose.js";
export { registerAdapter } from "./loader/adapter-registry.js";
export { renderSlot } from "./orchestrator/slot-renderer.js";
export { loadManifest, clearManifestCache } from "./registry/manifest-loader.js";
