import "@/styles/globals.css";
import "@/styles/markdown.css";
import "@/styles/tagInputs.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
}
