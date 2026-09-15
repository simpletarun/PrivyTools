import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  Terminal, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Info,
  X,
  Copy,
  Layers,
  FileArchive
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import JSZip from 'jszip';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'instant' | 'builder' | 'capacitor'>('instant');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadAndroidBundle = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // Capacitor Config
      const capConfig = {
        appId: 'com.privytools.app',
        appName: 'PrivyTools',
        webDir: 'dist',
        bundledWebRuntime: false,
        server: {
          androidScheme: 'https'
        }
      };
      zip.file('capacitor.config.json', JSON.stringify(capConfig, null, 2));

      // Android Manifest template
      const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.privytools.app">
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="PrivyTools"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="PrivyTools"
            android:theme="@style/AppTheme.NoActionBar"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
      zip.file('android/AndroidManifest.xml', manifestXml);

      // Quick start guide for APK
      const readme = `# PrivyTools — Android APK Build Guide

This project can be converted into a standalone .apk in 2 ways:

## Method 1: Instant APK via PWABuilder (Recommended - No Android Studio required)
1. Deploy or share your PrivyTools URL.
2. Go to https://www.pwabuilder.com
3. Paste the URL and click "Start".
4. Select "Android" -> Click "Build My APK".
5. Download your signed, ready-to-install .apk directly to your Android device!

## Method 2: Capacitor (Local APK compilation via Android Studio)
1. In your project directory:
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init PrivyTools com.privytools.app --web-dir=dist
   npm run build
   npx cap add android
   npx cap open android
2. In Android Studio, select:
   Build -> Build Bundle(s) / APK(s) -> Build APK(s)
3. Your .apk file will be generated in:
   android/app/build/outputs/apk/debug/app-debug.apk
`;
      zip.file('README_BUILD_APK.md', readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'privytools-android-apk-bundle.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate bundle:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Android App & APK Options
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">
                  Smooth on all Android versions
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% offline & client-side • Zero telemetry • Native Android performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('instant')}
            className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'instant'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Instant Android Install (WebAPK)
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'builder'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            1-Click .APK Generator
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'capacitor'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Android Studio / Capacitor
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'instant' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Direct WebAPK on Android (Fastest, zero setup)
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300/80 leading-relaxed">
                  Android natively packages Progressive Web Apps into an official OS-level <strong>WebAPK</strong>. When installed, it generates a real app drawer icon, launches in dedicated full-screen without browser URL bars, stores data locally in encrypted sandbox storage, and works 100% offline.
                </p>
              </div>

              {isInstalled ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-semibold">PrivyTools is already installed!</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Running in standalone app mode with full local storage access.
                    </div>
                  </div>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={install}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01]"
                >
                  <Smartphone className="w-5 h-5" />
                  Tap to Install PrivyTools on Android Now
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    How to install on Android Chrome / Firefox / Edge:
                  </div>
                  <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-1">
                    <li>Open this app in your Android browser (Google Chrome, Samsung Internet, or Firefox).</li>
                    <li>Tap the <strong>three dots menu (⋮)</strong> in the top right corner.</li>
                    <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    <li>Android will compile and install the PrivyTools WebAPK directly to your app launcher.</li>
                  </ol>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Android Compatibility</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Runs smoothly on Android 5.0 (Lollipop) through Android 15+.</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Privacy Guarantee</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">No server processing; your PDFs and photos never leave device memory.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-blue-900 dark:text-blue-200">
                <h3 className="font-semibold flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4 text-blue-500" />
                  Generate Standalone .APK via PWABuilder in 60 seconds
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-300/90 leading-relaxed">
                  PWABuilder (maintained by Microsoft) takes any PWA manifest and packages it into an official, signed <strong>.apk</strong> or <strong>.aab</strong> ready for side-loading or Google Play Store publishing.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Get your Live App URL:</span> Use the current shared link or deployed preview URL of this app.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Visit PWABuilder:</span> Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-500 underline font-medium inline-flex items-center gap-1">pwabuilder.com <ExternalLink className="w-3 h-3" /></a> and paste your URL.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Package APK:</span> Click <strong>"Package for Stores"</strong> &rarr; Select <strong>"Android"</strong> &rarr; Click <strong>"Generate"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Download .apk:</span> Transfer the generated <code>privytools.apk</code> file to your Android phone and install!
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDownloadAndroidBundle}
                  disabled={isExporting}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium flex items-center justify-center gap-2 transition"
                >
                  <FileArchive className="w-4 h-4 text-emerald-500" />
                  {isExporting ? 'Generating Bundle...' : 'Download Android Config Bundle (.zip)'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'capacitor' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  Local Android Studio Build (Capacitor)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  If you want to compile an unsigned debug or release <code>.apk</code> on your computer using the Android SDK and Gradle:
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Terminal Commands:</div>
                <div className="relative group bg-slate-950 text-slate-200 rounded-xl p-3 font-mono text-xs overflow-x-auto">
                  <pre className="space-y-1">
{`# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize project
npx cap init PrivyTools com.privytools.app --web-dir=dist

# 3. Build web assets & add Android platform
npm run build
npx cap add android

# 4. Open in Android Studio to build APK
npx cap open android`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(
                      `npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init PrivyTools com.privytools.app --web-dir=dist\nnpm run build\nnpx cap add android\nnpx cap open android`,
                      'cap-all'
                    )}
                    className="absolute top-3 right-3 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Copy commands"
                  >
                    {copiedCmd === 'cap-all' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  In Android Studio: Click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> to emit <code>app-debug.apk</code>.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDownloadAndroidBundle}
                  disabled={isExporting}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Generating Bundle...' : 'Download Android Template Bundle (.zip)'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Zero telemetry • Local client-side processing
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
