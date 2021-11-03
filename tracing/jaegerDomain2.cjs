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

module.exports = class JaegerClass {
  constructor(provider) {
    let span = [];
    this.provider = provider;
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
  }
  handleMessage(message) {
    if (typeof message !== "string") {
      const readyMessage = message.toString();
      return readyMessage;
    }
    return message;
  }
  FinishSpans(spans) {
    spans.forEach((span) => span.end());
    if (this.exporter != null){ this.exporter.shutdown(); }
  }
   startSpan(
    tracer,
    spanName,
    hasparentspan,
  ) {
     const exporter = this.exporter
    if (hasparentspan) {
      const ctx = opentelemetry.trace.setSpan(
        opentelemetry.context.active(),
        this.spans[this.spans.length - 1]
      )
      const span = tracer.startSpan(spanName, undefined, ctx)
      span.setStatus({
        code: SpanStatusCode.OK,
        message: 'ok'
      })
      this.spans.push(span)
      return span
    }
    const span = tracer.startSpan(spanName)
    this.spans.push(span)
    exporter.shutdown()
    return span
  }
  createParentSpan(spanName, hasparentspan) {
    this.setExporter()
    const tracer = opentelemetry.trace.getTracer('NomeDoServiço_tracer')
    return this.startSpan(tracer, spanName, hasparentspan)
  }
  SendSpan(
    spanName,
    endAll,
    message,
    tracerName
  ) {
    const exporter = this.setExporter()
    const tracer = opentelemetry.trace.getTracer(
      tracerName ? tracerName : 'NomeDoServiço_tracer'
    )
    const span = this.startSpan(tracer, spanName, true)
    span.setStatus({
      code: SpanStatusCode.OK,
      message: message ? message : 'ok'
    })
    if (endAll) {
      this.FinishSpans(this.spans)
    }
    exporter.shutdown()
    return span
  }
  SendErrorSpan(
    spanName,
    parentSpan,
    message,
    tracerName
  ) {
    const exporter = this.setExporter()
    const tracer = opentelemetry.trace.getTracer(
      tracerName ? tracerName : 'NomeDoServiço_tracer'
    )
    const ctx = opentelemetry.trace.setSpan(
      opentelemetry.context.active(),
      parentSpan
    )
    const span = tracer.startSpan(spanName, undefined, ctx)
 
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: this.handleMessage(message)
    })
    span.end()
 
    parentSpan.end()
    exporter.shutdown()
    return
  }
}
