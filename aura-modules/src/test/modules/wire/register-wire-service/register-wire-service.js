import { registerWireService } from 'wire-service';

export default function RegisterWireServiceTest(serviceApi, engine) {
    registerWireService(engine.register);

    return {
        name: 'RegisterWireServiceTest'
    };
}