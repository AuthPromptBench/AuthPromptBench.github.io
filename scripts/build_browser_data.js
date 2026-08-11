#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const dataDir = path.join(repoRoot, 'static', 'data', 'release', 'v1');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonl(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function countBy(records, key) {
  return records.reduce((acc, record) => {
    const rawValue = record[key];
    const value = String(rawValue ?? '').trim() || '<missing>';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function countDistinctNonEmpty(records, key) {
  return new Set(
    records
      .map(record => String(record[key] ?? '').trim())
      .filter(Boolean)
  ).size;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function main() {
  const benchmarkPath = path.join(dataDir, 'benchmark.jsonl');
  const benchmarkPreviewPath = path.join(dataDir, 'benchmark_with_thumbnail.jsonl');
  const fullPath = path.join(dataDir, 'full.jsonl');
  const infoPath = path.join(dataDir, 'dataset_info.json');
  const browserDataPath = path.join(dataDir, 'browser_data.js');

  const benchmark = readJsonl(benchmarkPath);
  const benchmarkPreview = fs.existsSync(benchmarkPreviewPath)
    ? readJsonl(benchmarkPreviewPath)
    : benchmark;
  const benchmarkBySampleId = new Map(
    benchmark.map(record => [record.sample_id, record])
  );
  const mergedBenchmarkPreview = benchmarkPreview.map(record => ({
    ...benchmarkBySampleId.get(record.sample_id),
    ...record
  }));
  const full = readJsonl(fullPath);
  const info = readJson(infoPath);

  info.full.num_rows = full.length;
  info.full.num_labels = countDistinctNonEmpty(full, 'label');
  info.full.rows_by_source = countBy(full, 'source');

  info.benchmark.num_rows = benchmark.length;
  info.benchmark.num_labels = countDistinctNonEmpty(benchmark, 'label');
  info.benchmark.rows_by_source = countBy(benchmark, 'source');
  info.benchmark.rows_by_challenge = countBy(benchmark, 'challenge');

  writeJson(infoPath, info);

  const browserPayload = { info, full, benchmark: mergedBenchmarkPreview };
  fs.writeFileSync(
    browserDataPath,
    `window.APBenchBrowserData = ${JSON.stringify(browserPayload)};\n`
  );

  console.log('Updated dataset artifacts:');
  console.log(`- ${path.relative(repoRoot, infoPath)}`);
  console.log(`- ${path.relative(repoRoot, browserDataPath)}`);
  if (fs.existsSync(benchmarkPreviewPath)) {
    console.log(`- using benchmark preview source: ${path.relative(repoRoot, benchmarkPreviewPath)}`);
  }
  console.log('Benchmark rows_by_source:', info.benchmark.rows_by_source);
  console.log('Full rows_by_source:', info.full.rows_by_source);
}

main();
