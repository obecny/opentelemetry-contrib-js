'use strict';

const { MetricsCollector } = require('@lightstep/opentelemetry-metrics-collector');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const exporter = new PrometheusExporter(
  {
    startServer: true,
  },
  () => {
    console.log('prometheus scrape endpoint: http://localhost:9464/metrics');
  },
);

new MetricsCollector({
  exporter,
  intervalCollect: 1000,
  intervalExport: 5000,
});

// only console exporter
// const { ConsoleMetricExporter } = require('@opentelemetry/metrics');
// const exporterConsole = new ConsoleMetricExporter();
// new MetricsCollector({
//   exporter: exporterConsole,
//   intervalCollect: 1000,
//   intervalExport: 5000,
// });