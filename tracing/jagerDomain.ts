import { injectable } from 'tsyringe'
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import {
 BasicTracerProvider,
 ConsoleSpanExporter,
 SimpleSpanProcessor,
 Span,
 Tracer
} from '@opentelemetry/sdk-trace-base'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'

@injectable()
export class JaegerClass {
 private spans: Span[] = []
 private exporter: JaegerExporter | undefined = undefined

 private setExporter(): JaegerExporter {
   const provider = new BasicTracerProvider({
     resource: new Resource({
       [SemanticResourceAttributes.SERVICE_NAME]: 'teste_doc'
     })
   })
   const exporter = new JaegerExporter({
     // Refactor this later
     endpoint: 'http://52.52.54.220:14268/api/traces'
   })
   provider.addSpanProcessor(new SimpleSpanProcessor(exporter))
   provider.addSpanProcessor(
     new SimpleSpanProcessor(new ConsoleSpanExporter())
   )
   provider.register()
   this.exporter = exporter
   return exporter
 }

 private handleMessage(message: any): string {
   if (typeof message !== 'string') {
     const readyMessage = message.toString()
     return readyMessage
   }
   return message
 }

 private FinishSpans(spans: Span[]): void {
   spans.forEach((span) => span.end())
   this.exporter!.shutdown()
 }

 private startSpan(
   tracer: Tracer,
   spanName: string,
   hasparentspan?: boolean
 ): Span {
   const exporter = this.exporter!
   if (hasparentspan) {
     const ctx = opentelemetry.trace.setSpan(
       opentelemetry.context.active(),
       this.spans[this.spans.length - 1]
     )
     const span = tracer.startSpan(spanName!, undefined, ctx) as Span
     span.setStatus({
       code: SpanStatusCode.OK,
       message: 'ok'
     })
     this.spans.push(span)
     return span
   }
   const span = tracer.startSpan(spanName) as Span
   this.spans.push(span)
   exporter.shutdown()
   return span
 }

 createParentSpan(spanName: string, hasparentspan?: boolean): Span {
   this.setExporter()
   const tracer = opentelemetry.trace.getTracer('wishly_Payment') as Tracer
   return this.startSpan(tracer, spanName, hasparentspan)
 }

 SendSpan(
   spanName: string,
   endAll?: boolean,
   message?: any | string,
   tracerName?: string
 ): Span {
   const exporter = this.setExporter()
   const tracer = opentelemetry.trace.getTracer(
     tracerName ? tracerName : 'wishly_Payment'
   ) as Tracer
   const span = this.startSpan(tracer, spanName, true)
   span.setStatus({
     code: SpanStatusCode.OK,
     message: message ? message : 'ok'
   })
   if (endAll) {
     this.FinishSpans(this.spans)
   }
   exporter.shutdown()
   return span as Span
 }

 SendErrorSpan(
   spanName: string,
   parentSpan: Span,
   message: any,
   tracerName?: string
 ): void {
   const exporter = this.setExporter()
   const tracer = opentelemetry.trace.getTracer(
     tracerName ? tracerName : 'wishly_Payment'
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
