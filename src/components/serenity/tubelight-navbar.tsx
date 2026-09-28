import { motion, useReducedMotion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Home, SquarePen, Search, Shield } from 'lucide-react'

const tabs = [{name:'Beranda',url:'/',Icon:Home},{name:'Kirim',url:'/laporan',Icon:SquarePen},{name:'Lacak',url:'/lacak',Icon:Search},{name:'Admin',url:'/admin/login',Icon:Shield}]
function NavLinks({mobile=false}:{mobile?:boolean}) {
  const {pathname}=useLocation()
  const reduce=useReducedMotion()
  return <>{tabs.map(({name,url,Icon})=>{
    const active=url==='/'?pathname==='/':pathname.startsWith(url)
    return <Link key={url} to={url} aria-current={active?'page':undefined} className={'nav-item '+(active?'active':'')}>
      {active && <motion.span layoutId={mobile?'nav-mobile':'nav-desktop'} className="nav-selection" transition={reduce?{duration:0}:{type:'spring',bounce:0,duration:.3}}/>}
      <span className="nav-label">{mobile&&<Icon size={20} strokeWidth={1.8}/>}<span>{name}</span></span>
    </Link>
  })}</>
}
export function TubeLightNavbar(){return <nav className="mobile-dock" aria-label="Navigasi utama mobile"><NavLinks mobile/></nav>}
export function DesktopNav(){return <nav className="desktop-nav" aria-label="Navigasi utama"><NavLinks/></nav>}
