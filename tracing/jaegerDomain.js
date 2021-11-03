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

var JaegerClass = function () {
  (this.spans = []),
    (this.exporter = undefined),
    (this.setExporter = function () {
      const provider = new BasicTracerProvider({
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: "teste_doc",
        }),
      });
      const exporter = new JaegerExporter({
        // Refactor this later
        endpoint: "http://52.52.54.220:14268/api/traces",
      });
      provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
      provider.addSpanProcessor(
        new SimpleSpanProcessor(new ConsoleSpanExporter())
      );
      provider.register();
      this.exporter = exporter;
      return exporter;
    }),
    (this.handleMessage = function (message) {
      if (typeof message !== "string") {
        const readyMessage = message.toString();
        return readyMessage;
      }
      return message;
    }),
    (this.FinishSpans = function (spans) {
      spans.forEach((span) => span.end());
      if (this.exporter != null) {
        this.exporter.shutdown();
      }
    }),
    (this.startSpan = function (tracer, spanName, hasparentspan) {
      const exporter = this.exporter;
      if (hasparentspan) {
        const ctx = opentelemetry.trace.setSpan(
          opentelemetry.context.active(),
          this.spans[this.spans.length - 1]
        );
        const span = tracer.startSpan(spanName, undefined, ctx);
        span.setStatus({
          message: "ok",
        });
        this.spans.push(span);
        return span;
      }
      const span = tracer.startSpan(spanName);
      this.spans.push(span);
      exporter.shutdown();
      return span;
    }),
    (this.SendSpan = function (spanName, endAll, message, tracerName) {
      const exporter = this.setExporter();
      const tracer = opentelemetry.trace.getTracer(
        tracerName ? tracerName : "NomeDoServiço_tracer"
      );
      const span = this.startSpan(tracer, spanName, true);
      span.setStatus({
        message: message ? message : "ok",
      });
      if (endAll) {
        this.FinishSpans(this.spans);
      }
      exporter.shutdown();
      return span;
    }),
    (this.SendErrorSpan = function (spanName, parentSpan, message, tracerName) {
      const exporter = this.setExporter();
      const tracer = opentelemetry.trace.getTracer(
        tracerName ? tracerName : "NomeDoServiço_tracer"
      );
      const ctx = opentelemetry.trace.setSpan(
        opentelemetry.context.active(),
        parentSpan
      );
      const span = tracer.startSpan(spanName, undefined, ctx);

      span.setStatus({
        message: this.handleMessage(message),
      });
      span.end();

      exporter.shutdown();
      return;
    }),
    (this.createParentSpan = function (spanName, hasparentspan) {
      this.setExporter();
      const tracer = opentelemetry.trace.getTracer("NomeDoServiço_tracer");
      return this.startSpan(tracer, spanName, hasparentspan);
    });
};

module.exports.JaegerClass = JaegerClass;
