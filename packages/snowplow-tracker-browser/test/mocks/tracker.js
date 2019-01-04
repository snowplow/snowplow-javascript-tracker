/* eslint-disable no-undef */
class MockTracker {

    constructor(functionName, namespace, version, mutSnowplowState, argmap) {
        this.configCollectorUrl = ''
        this.attribute = 10
        this.functionName = functionName
        this.namespace = namespace
        this.version = version
        this.mutSnowplowState = mutSnowplowState
        this.argmap = argmap
    }

    setCollectorUrl(rawUrl) {
        this.configCollectorUrl = 'http://' + rawUrl + '/i'
    }

    increaseAttribute(n) {
        this.attribute += n
    }

    setAttribute(p) {
        this.attribute = p
    }

    setOutputToAttribute() {
        testValue = this.attribute
    }
    
    addAttributeToOutput() {

        testValue += this.attribute
    }
}

export default MockTracker