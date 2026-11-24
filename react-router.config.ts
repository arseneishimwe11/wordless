import type { Config } from '@react-router/dev/config';

export default {
  // The app lives in src/ (see README → Project structure).
  appDirectory: 'src',
  // Wordless runs entirely in the browser: no server, data stays on the device.
  ssr: false,
} satisfies Config;
