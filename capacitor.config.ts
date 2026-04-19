import type { CapacitorConfig } from '@capacitor/cli';

// For local dev: server.url points to Next.js dev server
// For production: remove server block and run `next build && npx cap sync`
const isDev = process.env.NODE_ENV !== 'production';

const config: CapacitorConfig = {
  appId: 'com.uninexus.app',
  appName: 'Uni',
  webDir: 'out',
  server: isDev ? {
    url: 'http://localhost:3001',
    cleartext: true,
  } : undefined,
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#030712',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
