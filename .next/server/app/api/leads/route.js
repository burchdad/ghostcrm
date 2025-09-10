"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/leads/route";
exports.ids = ["app/api/leads/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fleads%2Froute&page=%2Fapi%2Fleads%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fleads%2Froute.ts&appDir=D%3A%5CProgram%20Files%5CGithub%20Repositories%5Cghostcrm%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProgram%20Files%5CGithub%20Repositories%5Cghostcrm&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fleads%2Froute&page=%2Fapi%2Fleads%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fleads%2Froute.ts&appDir=D%3A%5CProgram%20Files%5CGithub%20Repositories%5Cghostcrm%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProgram%20Files%5CGithub%20Repositories%5Cghostcrm&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_Program_Files_Github_Repositories_ghostcrm_src_app_api_leads_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/leads/route.ts */ \"(rsc)/./src/app/api/leads/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/leads/route\",\n        pathname: \"/api/leads\",\n        filename: \"route\",\n        bundlePath: \"app/api/leads/route\"\n    },\n    resolvedPagePath: \"D:\\\\Program Files\\\\Github Repositories\\\\ghostcrm\\\\src\\\\app\\\\api\\\\leads\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_Program_Files_Github_Repositories_ghostcrm_src_app_api_leads_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/leads/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZsZWFkcyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGbGVhZHMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZsZWFkcyUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDUHJvZ3JhbSUyMEZpbGVzJTVDR2l0aHViJTIwUmVwb3NpdG9yaWVzJTVDZ2hvc3Rjcm0lNUNzcmMlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNQcm9ncmFtJTIwRmlsZXMlNUNHaXRodWIlMjBSZXBvc2l0b3JpZXMlNUNnaG9zdGNybSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDZ0M7QUFDN0c7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9naG9zdGNybS8/YjZmOCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJEOlxcXFxQcm9ncmFtIEZpbGVzXFxcXEdpdGh1YiBSZXBvc2l0b3JpZXNcXFxcZ2hvc3Rjcm1cXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcbGVhZHNcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2xlYWRzL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvbGVhZHNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2xlYWRzL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiRDpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxHaXRodWIgUmVwb3NpdG9yaWVzXFxcXGdob3N0Y3JtXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXGxlYWRzXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9sZWFkcy9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fleads%2Froute&page=%2Fapi%2Fleads%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fleads%2Froute.ts&appDir=D%3A%5CProgram%20Files%5CGithub%20Repositories%5Cghostcrm%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProgram%20Files%5CGithub%20Repositories%5Cghostcrm&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/leads/route.ts":
/*!************************************!*\
  !*** ./src/app/api/leads/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var airtable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! airtable */ \"(rsc)/./node_modules/airtable/lib/airtable.js\");\n/* harmony import */ var airtable__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(airtable__WEBPACK_IMPORTED_MODULE_1__);\n\n\nasync function GET(request) {\n    const baseId = process.env.AIRTABLE_BASE_ID;\n    const apiKey = process.env.AIRTABLE_API_KEY;\n    const tableName = request.url.split(\"table=\")[1] || \"Leads\";\n    if (!baseId || !apiKey) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Missing Airtable credentials\"\n        }, {\n            status: 500\n        });\n    }\n    const base = new (airtable__WEBPACK_IMPORTED_MODULE_1___default())({\n        apiKey\n    }).base(baseId);\n    const records = [];\n    try {\n        await base(tableName).select({\n            maxRecords: 50\n        }).eachPage((pageRecords, fetchNextPage)=>{\n            records.push(...pageRecords.map((r)=>({\n                    id: r.id,\n                    ...r.fields\n                })));\n            fetchNextPage();\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            records\n        });\n    } catch (err) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: err.message || String(err)\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9sZWFkcy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRTJDO0FBQ1g7QUFFekIsZUFBZUUsSUFBSUMsT0FBZ0I7SUFDeEMsTUFBTUMsU0FBU0MsUUFBUUMsR0FBRyxDQUFDQyxnQkFBZ0I7SUFDM0MsTUFBTUMsU0FBU0gsUUFBUUMsR0FBRyxDQUFDRyxnQkFBZ0I7SUFDM0MsTUFBTUMsWUFBWVAsUUFBUVEsR0FBRyxDQUFDQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSTtJQUVwRCxJQUFJLENBQUNSLFVBQVUsQ0FBQ0ksUUFBUTtRQUN0QixPQUFPUixxREFBWUEsQ0FBQ2EsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBK0IsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDcEY7SUFFQSxNQUFNQyxPQUFPLElBQUlmLGlEQUFRQSxDQUFDO1FBQUVPO0lBQU8sR0FBR1EsSUFBSSxDQUFDWjtJQUMzQyxNQUFNYSxVQUFpQixFQUFFO0lBQ3pCLElBQUk7UUFDRixNQUFNRCxLQUFLTixXQUNSUSxNQUFNLENBQUM7WUFBRUMsWUFBWTtRQUFHLEdBQ3hCQyxRQUFRLENBQUMsQ0FBQ0MsYUFBYUM7WUFDdEJMLFFBQVFNLElBQUksSUFBSUYsWUFBWUcsR0FBRyxDQUFDQyxDQUFBQSxJQUFNO29CQUFFQyxJQUFJRCxFQUFFQyxFQUFFO29CQUFFLEdBQUdELEVBQUVFLE1BQU07Z0JBQUM7WUFDOURMO1FBQ0Y7UUFDRixPQUFPdEIscURBQVlBLENBQUNhLElBQUksQ0FBQztZQUFFSTtRQUFRO0lBQ3JDLEVBQUUsT0FBT1csS0FBVTtRQUNqQixPQUFPNUIscURBQVlBLENBQUNhLElBQUksQ0FBQztZQUFFQyxPQUFPYyxJQUFJQyxPQUFPLElBQUlDLE9BQU9GO1FBQUssR0FBRztZQUFFYixRQUFRO1FBQUk7SUFDaEY7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2dob3N0Y3JtLy4vc3JjL2FwcC9hcGkvbGVhZHMvcm91dGUudHM/NWNkYSJdLCJzb3VyY2VzQ29udGVudCI6WyJcclxuXHJcbmltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xyXG5pbXBvcnQgQWlydGFibGUgZnJvbSBcImFpcnRhYmxlXCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcclxuICBjb25zdCBiYXNlSWQgPSBwcm9jZXNzLmVudi5BSVJUQUJMRV9CQVNFX0lEO1xyXG4gIGNvbnN0IGFwaUtleSA9IHByb2Nlc3MuZW52LkFJUlRBQkxFX0FQSV9LRVk7XHJcbiAgY29uc3QgdGFibGVOYW1lID0gcmVxdWVzdC51cmwuc3BsaXQoXCJ0YWJsZT1cIilbMV0gfHwgXCJMZWFkc1wiO1xyXG5cclxuICBpZiAoIWJhc2VJZCB8fCAhYXBpS2V5KSB7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogXCJNaXNzaW5nIEFpcnRhYmxlIGNyZWRlbnRpYWxzXCIgfSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGJhc2UgPSBuZXcgQWlydGFibGUoeyBhcGlLZXkgfSkuYmFzZShiYXNlSWQpO1xyXG4gIGNvbnN0IHJlY29yZHM6IGFueVtdID0gW107XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGJhc2UodGFibGVOYW1lKVxyXG4gICAgICAuc2VsZWN0KHsgbWF4UmVjb3JkczogNTAgfSlcclxuICAgICAgLmVhY2hQYWdlKChwYWdlUmVjb3JkcywgZmV0Y2hOZXh0UGFnZSkgPT4ge1xyXG4gICAgICAgIHJlY29yZHMucHVzaCguLi5wYWdlUmVjb3Jkcy5tYXAociA9PiAoeyBpZDogci5pZCwgLi4uci5maWVsZHMgfSkpKTtcclxuICAgICAgICBmZXRjaE5leHRQYWdlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgcmVjb3JkcyB9KTtcclxuICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IGVyci5tZXNzYWdlIHx8IFN0cmluZyhlcnIpIH0sIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJBaXJ0YWJsZSIsIkdFVCIsInJlcXVlc3QiLCJiYXNlSWQiLCJwcm9jZXNzIiwiZW52IiwiQUlSVEFCTEVfQkFTRV9JRCIsImFwaUtleSIsIkFJUlRBQkxFX0FQSV9LRVkiLCJ0YWJsZU5hbWUiLCJ1cmwiLCJzcGxpdCIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImJhc2UiLCJyZWNvcmRzIiwic2VsZWN0IiwibWF4UmVjb3JkcyIsImVhY2hQYWdlIiwicGFnZVJlY29yZHMiLCJmZXRjaE5leHRQYWdlIiwicHVzaCIsIm1hcCIsInIiLCJpZCIsImZpZWxkcyIsImVyciIsIm1lc3NhZ2UiLCJTdHJpbmciXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/leads/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/lodash","vendor-chunks/airtable","vendor-chunks/whatwg-url","vendor-chunks/tr46","vendor-chunks/node-fetch","vendor-chunks/webidl-conversions","vendor-chunks/event-target-shim","vendor-chunks/abortcontroller-polyfill","vendor-chunks/abort-controller"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fleads%2Froute&page=%2Fapi%2Fleads%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fleads%2Froute.ts&appDir=D%3A%5CProgram%20Files%5CGithub%20Repositories%5Cghostcrm%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProgram%20Files%5CGithub%20Repositories%5Cghostcrm&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();