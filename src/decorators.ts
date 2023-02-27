function BindThis (_: any, _2: string, descriptor: PropertyDescriptor) {
    return {
        configurable: true,
        enumerable: false,
        get() {
            return descriptor.value.bind(this);
        }
    }
}

export default BindThis;