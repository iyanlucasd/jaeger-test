const {
  JaegerClass,
} = require("/home/iyan/PUC/estágio/Luby/test/basic-tracer-node/tracing/jaegerDomain2.cjs");
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

const provider = new BasicTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "basic-service",
  }),
});
let jaeger = new JaegerClass(provider);

for (let i = 0; i < 10; i += 1) {
  jaeger.createParentSpan("doWork", true);
  doWork();
}
// Be sure to end the span.

function doWork() {
  jaeger.SendSpan("doWorkInner", true);
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      jaeger.SendErrorSpan("insertBankAccount", span, "error");
    }
  }
}
