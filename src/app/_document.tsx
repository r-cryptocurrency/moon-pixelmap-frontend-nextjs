import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Allow WalletConnect iframe integration */}
          <meta 
            httpEquiv="Content-Security-Policy" 
            content="frame-ancestors 'self' https://*.walletconnect.com https://*.reown.com;"
          />
          <meta name="referrer" content="no-referrer-when-downgrade" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
