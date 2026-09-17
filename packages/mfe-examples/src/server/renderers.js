import { createMfeRenderer } from "@nuskin/gateway-mfe";
import exampleMfeApp, {
  getServerSideProps as exampleMfeGetServerSideProps,
} from "../minimal/App.jsx";
import complexDemoMfeApp, {
  getServerSideProps as complexDemoMfeGetServerSideProps,
  getSEOTags as complexDemoMfeGetSEOTags,
} from "../complex/App.jsx";

export const exampleMfeRenderer = createMfeRenderer({
  mfeId: "example_mfe",
  inlineModule: {
    default: exampleMfeApp,
    getServerSideProps: exampleMfeGetServerSideProps,
  },
  buildProps: ({ ctx, serverData }) => ({
    greeting: serverData.greeting,
    url: ctx.url,
  }),
  stateGlobalName: "__EXAMPLE_MFE_DATA__",
});

export const complexDemoMfeRenderer = createMfeRenderer({
  mfeId: "complex_demo_mfe",
  inlineModule: {
    default: complexDemoMfeApp,
    getServerSideProps: complexDemoMfeGetServerSideProps,
    getSEOTags: complexDemoMfeGetSEOTags,
  },
  buildProps: ({ ctx, serverData }) => ({
    initialState: serverData.initialState,
    url: ctx.url,
    locale: ctx.locale,
  }),
  stateGlobalName: "__COMPLEX_DEMO_MFE_DATA__",
});
