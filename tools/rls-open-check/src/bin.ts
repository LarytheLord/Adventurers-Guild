#!/usr/bin/env node
import { run } from "./cli.js";

run(process.argv.slice(2)).then(
  (r) => {
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
    process.exitCode = r.code;
  },
  (e) => {
    process.stderr.write(`Unexpected error: ${(e as Error).message}\n`);
    process.exitCode = 2;
  }
);
