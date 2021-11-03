const { JaegerClass } = require('./tracing/jaegerDomain');
const jaeger = new JaegerClass('Jaeger Test Local');
const parentSpanCreated = jaeger.createParentSpan('PaymentProcesss', true);

// const jaeger = require('./tracing/jaegerDomain')
// jaeger.createParentSpan('PaymentProcesss', true);

const other = require('./tracing/otherThing')

for (let i = 0; i < 10; i += 1) {
  if (i === 3) {
    other.otherFunction(jaeger)
  } else if (i === 5) {
    console.log('AAAAAAA',parentSpanCreated)
    jaeger.SendErrorSpan(`Error: Test for ${i}`, parentSpanCreated, `Error: Mensagem aquiiii ${i}`);
  } else {
    jaeger.SendSpan(`OK: Test for ${i}`, false, `Mensagem aquiiii ${i}`);
  }
}

jaeger.SendSpan('OK: Test for Finalizando', true, 'Finalizando a parada');

//Test
function testThowErrorAndAcert() {
  jaeger.SendSpan('LocaldoWorkInner', true);
  jaeger.SendErrorSpan('LocaldoWorkError', this.span, 'error');
}
