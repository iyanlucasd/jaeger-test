import { JaeguerDomain } from './tracer/JaeguerDomain';

for (let i = 0; i < 10; i += 1) {
  this.JaegerDomain.createParentSpan('doWork', true);
  doWork();
}
// Be sure to end the span.

function doWork() {
  this.JaegerDomain.SendSpan('doWorkInner', true)
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if(i > 10000) {
      this.JaegerDomain.SendErrorSpan('insertBankAccount', this.span, "error")
    }
  }
}
