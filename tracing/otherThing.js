module.exports = {
    
    otherFunction(jaeger) {
        jaeger.SendSpan('OK: Buscando em outro arquivo', false, 'Entrei em outra função');
    }
}