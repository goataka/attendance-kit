"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const serverless_express_1 = require("@vendia/serverless-express");
const middleware_1 = require("@vendia/serverless-express/middleware");
const express_1 = __importDefault(require("express"));
const app_module_1 = require("./app.module");
let cachedServer;
async function bootstrapServer() {
    if (!cachedServer) {
        const expressApp = (0, express_1.default)();
        const nestApp = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
        nestApp.enableCors();
        nestApp.use((0, middleware_1.eventContext)());
        nestApp.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
        }));
        nestApp.setGlobalPrefix('api');
        await nestApp.init();
        cachedServer = (0, serverless_express_1.createServer)(expressApp);
    }
    return cachedServer;
}
const handler = async (event, context) => {
    const server = await bootstrapServer();
    return (0, serverless_express_1.proxy)(server, event, context, 'PROMISE').promise;
};
exports.handler = handler;
//# sourceMappingURL=lambda.js.map