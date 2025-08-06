import config from './config/index';

let apmInstance;
if (config.APM_ACTIVE && config.APM_SERVER_URL) {
  try {
    ({ default: apmInstance } = await import('elastic-apm-node')); // eslint-disable-line import/no-unresolved
    apmInstance.start({
      serviceName: config.APM_SERVICE_NAME,
      serverUrl: config.APM_SERVER_URL,
    });
  } catch (err) {
    apmInstance = undefined;
  }
}

const apm = apmInstance;
export default apm;
