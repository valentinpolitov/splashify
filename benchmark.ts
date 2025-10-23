#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";

import { runPipeline } from "@/core/run";
import { presetIOS } from "@/devices/preset-ios";
import { canvasRenderer } from "@/renderers/canvas-renderer";
import { sharpRenderer } from "@/renderers/sharp-renderer";
import { logger } from "@/util/logger";

const ITERATIONS = 100;

// Test configuration
const TEST_CONFIG = {
  inputPath: "benchmark-icon.svg",
  cwd: process.cwd(),
  outdir: ".benchmark-sharp",
  defOutdir: ".benchmark-sharp",
  public: false,
  scale: 0.75,
  background: "#ffffff",
  hashLength: 8,
  prefix: "benchmark",
  includeOrientation: true,
  portraitOnly: false,
  landscapeOnly: false,
  write: {
    def: false,
    defFile: "resources",
  },
  devices: presetIOS.slice(0, 3), // Test with first 3 devices for faster benchmark
  concurrency: 4,
  inputPathOrUrl: "benchmark-icon.svg",
};

// Create a test SVG icon
function createTestSVG(): void {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="200" fill="url(#grad1)" />
  <circle cx="256" cy="256" r="150" fill="#ffffff" opacity="0.9" />
  <circle cx="256" cy="256" r="100" fill="url(#grad1)" />
  <text x="256" y="270" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">S</text>
</svg>`;

  writeFileSync(TEST_CONFIG.inputPath, svgContent);
  logger.success("✅ Created test SVG icon");
}

// Clean directory
function cleanDir(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Benchmark Sharp (current implementation)
async function benchmarkSharp(iterations: number = 3): Promise<{
  avgTime: number;
  minTime: number;
  maxTime: number;
  results: number[];
}> {
  logger.success(
    `\n🔄 Benchmarking Sharp Renderer (${iterations} iterations)...`,
  );

  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    cleanDir(resolve(TEST_CONFIG.cwd, TEST_CONFIG.outdir));

    const start = performance.now();

    try {
      await runPipeline(TEST_CONFIG, sharpRenderer);
      const end = performance.now();
      const duration = end - start;
      results.push(duration);
      logger.success(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
    } catch (error) {
      logger.error(`  ❌ Iteration ${i + 1} failed:`, error);
      results.push(Infinity);
    }
  }

  const validResults = results.filter((r) => r !== Infinity);
  const avgTime = validResults.reduce((a, b) => a + b, 0) / validResults.length;
  const minTime = Math.min(...validResults);
  const maxTime = Math.max(...validResults);

  return { avgTime, minTime, maxTime, results: validResults };
}

// Benchmark Canvas (published v0.3.2)
async function benchmarkCanvas(iterations: number = 3): Promise<{
  avgTime: number;
  minTime: number;
  maxTime: number;
  results: number[];
}> {
  logger.success(
    `\n🔄 Benchmarking Canvas Renderer (v0.3.2) (${iterations} iterations)...`,
  );

  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    cleanDir(resolve(TEST_CONFIG.cwd, ".splashify"));

    const start = performance.now();

    try {
      // Use the published version
      //   execSync(
      //     `splashify gen ${devices} --input ${TEST_CONFIG.inputPath} --outdir .splashify/images --no-def --scale ${TEST_CONFIG.scale} --background "${TEST_CONFIG.background}"`,
      //     {
      //       stdio: "pipe",
      //       cwd: TEST_CONFIG.cwd,
      //     },
      //   );

      await runPipeline(
        { ...TEST_CONFIG, outdir: ".splashify/images" },
        canvasRenderer,
      );
      const end = performance.now();
      const duration = end - start;
      results.push(duration);
      logger.success(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
    } catch (error) {
      logger.error(`  ❌ Iteration ${i + 1} failed:`, error);
      results.push(Infinity);
    }
  }

  const validResults = results.filter((r) => r !== Infinity);
  const avgTime = validResults.reduce((a, b) => a + b, 0) / validResults.length;
  const minTime = Math.min(...validResults);
  const maxTime = Math.max(...validResults);

  return { avgTime, minTime, maxTime, results: validResults };
}

// Get file sizes
function getOutputSize(dir: string): number {
  if (!existsSync(dir)) return 0;

  let totalSize = 0;
  const files = execSync(`find "${dir}" -name "*.png" -type f`, {
    encoding: "utf8",
  })
    .trim()
    .split("\n");

  for (const file of files) {
    if (file) {
      try {
        const stats = execSync(`stat -f%z "${file}"`, { encoding: "utf8" });
        totalSize += parseInt(stats.trim());
      } catch {
        // Ignore errors
      }
    }
  }

  return totalSize;
}

// Main benchmark function
async function runBenchmark(): Promise<void> {
  logger.success("🚀 Starting Sharp vs Canvas Benchmark");
  logger.success(
    "📊 Comparing current Sharp implementation vs published v0.3.2 (Canvas)",
  );
  logger.success("=".repeat(60));

  // Create test SVG
  createTestSVG();

  // Benchmark Sharp
  const sharpResults = await benchmarkSharp(ITERATIONS);
  const sharpOutputSize = getOutputSize(
    resolve(TEST_CONFIG.cwd, TEST_CONFIG.outdir),
  );

  // Benchmark Canvas
  const canvasResults = await benchmarkCanvas(ITERATIONS);
  const canvasOutputSize = getOutputSize(
    resolve(TEST_CONFIG.cwd, ".splashify/images"),
  );

  // Results
  logger.success("\n" + "=".repeat(60));
  logger.success("📈 BENCHMARK RESULTS");
  logger.success("=".repeat(60));

  logger.success(`\n⚡ Sharp Renderer (Current):`);
  logger.success(`  Average: ${sharpResults.avgTime.toFixed(2)}ms`);
  logger.success(`  Min: ${sharpResults.minTime.toFixed(2)}ms`);
  logger.success(`  Max: ${sharpResults.maxTime.toFixed(2)}ms`);
  logger.success(`  Output Size: ${(sharpOutputSize / 1024).toFixed(2)}KB`);
  logger.success(
    `  Files Generated: ${sharpResults.results.length > 0 ? TEST_CONFIG.devices.length * 2 : 0} (portrait + landscape)`,
  );

  logger.success(`\n🎨 Canvas Renderer (v0.3.2):`);
  logger.success(`  Average: ${canvasResults.avgTime.toFixed(2)}ms`);
  logger.success(`  Min: ${canvasResults.minTime.toFixed(2)}ms`);
  logger.success(`  Max: ${canvasResults.maxTime.toFixed(2)}ms`);
  logger.success(`  Output Size: ${(canvasOutputSize / 1024).toFixed(2)}KB`);
  logger.success(
    `  Files Generated: ${canvasResults.results.length > 0 ? TEST_CONFIG.devices.length * 2 : 0} (portrait + landscape)`,
  );

  // Performance comparison
  const speedRatio = canvasResults.avgTime / sharpResults.avgTime;
  const sizeRatio = canvasOutputSize / Math.max(sharpOutputSize, 1);

  logger.success(`\n🏆 COMPARISON:`);
  logger.success(
    `  Speed: Sharp is ${speedRatio.toFixed(2)}x ${speedRatio > 1 ? "faster" : "slower"} than Canvas`,
  );
  logger.success(
    `  File Size: Canvas produces ${sizeRatio.toFixed(2)}x ${sizeRatio > 1 ? "larger" : "smaller"} files than Sharp`,
  );

  // Performance per device
  const devicesCount = TEST_CONFIG.devices.length;
  const sharpPerDevice = sharpResults.avgTime / devicesCount;
  const canvasPerDevice = canvasResults.avgTime / devicesCount;

  logger.success(`\n📊 PERFORMANCE PER DEVICE:`);
  logger.success(`  Sharp: ${sharpPerDevice.toFixed(2)}ms per device`);
  logger.success(`  Canvas: ${canvasPerDevice.toFixed(2)}ms per device`);
  logger.success(
    `  Improvement: Sharp is ${(canvasPerDevice > sharpPerDevice
      ? canvasPerDevice / sharpPerDevice
      : sharpPerDevice / canvasPerDevice
    ).toFixed(2)}x ${canvasPerDevice > sharpPerDevice ? "faster" : "slower"}`,
  );

  // Winner
  const sharpScore =
    (1 / sharpResults.avgTime) * (1 / Math.max(sharpOutputSize, 1));
  const canvasScore =
    (1 / canvasResults.avgTime) * (1 / Math.max(canvasOutputSize, 1));

  logger.success(
    `\n🥇 OVERALL WINNER: ${sharpScore > canvasScore ? "Sharp" : "Canvas"}`,
  );
  logger.success(`  Sharp Score: ${sharpScore.toFixed(8)}`);
  logger.success(`  Canvas Score: ${canvasScore.toFixed(8)}`);

  // Additional insights
  logger.success(`\n💡 INSIGHTS:`);
  if (speedRatio > 1) {
    logger.success(
      `  ✅ Sharp is ${speedRatio.toFixed(1)}x faster - significant performance improvement`,
    );
  } else {
    logger.success(
      `  ⚠️  Canvas is ${(1 / speedRatio).toFixed(1)}x faster - performance regression`,
    );
  }

  if (sizeRatio > 1.05) {
    // Canvas files are larger than Sharp → report how many times smaller Sharp is
    logger.success(
      `  ✅ Sharp produces ${Math.round(sizeRatio)}x smaller files - better compression`,
    );
  } else if (sizeRatio < 0.95) {
    // Canvas files are smaller than Sharp → report how many times larger Sharp is
    logger.success(
      `  ⚠️  Sharp produces ${Math.round(1 / sizeRatio)}x larger files - larger output`,
    );
  } else {
    logger.success(`  ✅ File sizes are comparable`);
  }

  // Cleanup
  cleanDir(TEST_CONFIG.inputPath);
  cleanDir(resolve(TEST_CONFIG.cwd, TEST_CONFIG.outdir));
  cleanDir(resolve(TEST_CONFIG.cwd, ".splashify"));

  logger.success("\n✅ Benchmark completed and cleaned up!");
}

// Run the benchmark
if (process.argv[1]?.endsWith("benchmark.ts")) {
  runBenchmark().catch(logger.error);
}

export { runBenchmark };
