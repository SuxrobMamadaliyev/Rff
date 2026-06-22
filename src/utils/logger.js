// -----------------------------------------------------------------------------
// Minimal, dependency-free leveled logger with timestamps.
// -----------------------------------------------------------------------------
import config from '../config/index.js';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = LEVELS[config.logLevel] ?? LEVELS.info;

/**
 * @param {keyof typeof LEVELS} level
 * @param {unknown[]} args
 */
const log = (level, args) => {
  if (LEVELS[level] > currentLevel) return;
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  // eslint-disable-next-line no-console
  const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  sink(prefix, ...args);
};

const logger = {
  error: (...args) => log('error', args),
  warn: (...args) => log('warn', args),
  info: (...args) => log('info', args),
  debug: (...args) => log('debug', args),
};

export default logger;
