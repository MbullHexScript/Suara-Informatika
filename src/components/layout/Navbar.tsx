import { Link } from 'react-router-dom'
import { TubeLightNavbar, DesktopNav } from '@/components/serenity/tubelight-navbar'

export default function Navbar() {
  return <>
    <header className="site-header"><div className="nav-material"><Link to="/" className="brand"><img src="/icon-web.jpg" alt="" width={34} height={34}/><span>Suara Informatika</span></Link><DesktopNav /></div></header>
    <TubeLightNavbar />
  </>
}
