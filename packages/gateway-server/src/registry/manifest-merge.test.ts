import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GatewayManifest } from "@nuskin/gateway-contracts";
import { mergeManifestWithRemoteConfig } from "./manifest-merge.js";

const baseManifest: GatewayManifest = {
  version: "test",
  mfes: {
    header_mfe: {
      id: "header_mfe",
      ssr: false,
      federation: {
        name: "header_mfe",
        client: { remoteEntry: "http://static/header/remoteEntry.js" },
        server: { remoteEntry: "http://static/header/server/remoteEntry.js" },
      },
    },
  },
};

describe("mergeManifestWithRemoteConfig", () => {
  it("overrides remote entry URLs from ContentStack", () => {
    const merged = mergeManifestWithRemoteConfig(baseManifest, {
      header_mfe: {
        clientEntry: "https://cdn.example.com/header/remoteEntry.js",
        serverEntry: "https://cdn.example.com/header/server/remoteEntry.js",
        ssr: true,
      },
    });

    assert.equal(merged.mfes.header_mfe?.ssr, true);
    assert.equal(
      merged.mfes.header_mfe?.federation?.client?.remoteEntry,
      "https://cdn.example.com/header/remoteEntry.js",
    );
    assert.equal(
      merged.mfes.header_mfe?.federation?.server?.remoteEntry,
      "https://cdn.example.com/header/server/remoteEntry.js",
    );
  });

  it("creates manifest entry for unknown MFE", () => {
    const merged = mergeManifestWithRemoteConfig(baseManifest, {
      site_visual_builder: {
        clientEntry: "https://cdn.example.com/vb/remoteEntry.js",
        serverEntry: "https://cdn.example.com/vb/server/remoteEntry.js",
      },
    });

    assert.equal(
      merged.mfes.site_visual_builder?.federation?.client?.remoteEntry,
      "https://cdn.example.com/vb/remoteEntry.js",
    );
  });
});
