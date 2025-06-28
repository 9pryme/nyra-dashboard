import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AuthProvider } from "@/lib/context/AuthContext";
import { LoadingProvider } from "@/lib/context/LoadingContext";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";

const clashDisplay = localFont({
  src: [
    {
      path: '../public/fonts/ClashDisplay-Extralight.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/ClashDisplay-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/ClashDisplay-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/ClashDisplay-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/ClashDisplay-Semibold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/ClashDisplay-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-clash-display',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Nyra Wallet Dashboard',
  description: 'Admin dashboard for Nyra Wallet financial application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Disable right-click context menu
              document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
              });

              // Disable key combinations for developer tools
              document.addEventListener('keydown', function(e) {
                // F12
                if (e.keyCode === 123) {
                  e.preventDefault();
                  return false;
                }
                // Ctrl+Shift+I
                if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                  e.preventDefault();
                  return false;
                }
                // Ctrl+U (View Source)
                if (e.ctrlKey && e.keyCode === 85) {
                  e.preventDefault();
                  return false;
                }
                // Ctrl+Shift+J
                if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                  e.preventDefault();
                  return false;
                }
                // Ctrl+S (Save page)
                if (e.ctrlKey && e.keyCode === 83) {
                  e.preventDefault();
                  return false;
                }
              });

              // Detect DevTools
              let devtools = {
                open: false,
                orientation: null
              };
              
              setInterval(function() {
                if (window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160) {
                  if (!devtools.open) {
                    devtools.open = true;
                    console.clear();
                    alert('Developer tools detected. Access denied for security reasons.');
                    window.location.href = 'about:blank';
                  }
                }
              }, 500);

              // Clear console periodically
              setInterval(function() {
                console.clear();
              }, 1000);

              // Disable text selection on sensitive areas
              document.addEventListener('selectstart', function(e) {
                try {
                  if (e && e.target && typeof e.target.closest === 'function' && e.target.closest('.no-select')) {
                    e.preventDefault();
                    return false;
                  }
                } catch (err) {
                  // Silently handle any errors
                }
              });

              // Disable drag
              document.addEventListener('dragstart', function(e) {
                try {
                  e.preventDefault();
                  return false;
                } catch (err) {
                  // Silently handle any errors
                }
              });
            `,
          }}
        />
      </head>
      <body className={`${clashDisplay.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}