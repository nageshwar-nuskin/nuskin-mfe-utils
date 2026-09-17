/**
 * Example MFE modules for @nuskin/gateway-mfe (SSR in MFE dev server, not a gateway app).
 */
export {
  default as exampleMfeApp,
  getServerSideProps as exampleMfeGetServerSideProps,
} from "./minimal/App.jsx";

export {
  default as complexDemoMfeApp,
  getServerSideProps as complexDemoMfeGetServerSideProps,
  getSEOTags as complexDemoMfeGetSEOTags,
} from "./complex/App.jsx";
