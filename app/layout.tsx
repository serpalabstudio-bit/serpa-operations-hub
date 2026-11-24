import './style.css';
import type { Metadata, Viewport } from 'next';
import Pwa from '../components/pwa';
export const metadata: Metadata = {
 title:'SERPA Operations Hub', description:'Centro de operaciones de SERPA Lab Studio',
 manifest:'/manifest.webmanifest', appleWebApp:{capable:true,title:'SERPA HUB',statusBarStyle:'default'},
 icons:{apple:'/pwa/apple-touch-icon.png'}
};
export const viewport: Viewport = {themeColor:'#172820',viewportFit:'cover'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="es"><body>{children}<Pwa/></body></html>}
