const {
  JaegerClass,
} = require("/home/iyan/PUC/estágio/Luby/test/basic-tracer-node/tracing/jaegerDomain2.js");
const opentelemetry = require("@opentelemetry/api");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} = require("@opentelemetry/sdk-trace-base");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

let jaeger = new JaegerClass();

for (let i = 0; i < 10; i += 1) {
  jaeger.createParentSpan("doWork", true);
  doWork();
}
// Be sure to end the span.

function doWork() {
  jaeger.SendSpan("doWorkInner", true);
  jaeger.SendErrorSpan("doWorkError", this.span, "error");
}
