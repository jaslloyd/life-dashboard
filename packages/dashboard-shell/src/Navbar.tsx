import React from 'react'
import './navbar.css'

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="navbar-nav">
                <li className="nav-item">
                    <a href="#">
                        <i className="fas fa-home fa-2x" aria-hidden="true"></i>
                        <span className="link-text">Home</span>
                    </a>
                </li>
                <li className="nav-item">
                    <a href="#">
                        <i className="fas fa-plus fa-2x" aria-hidden="true"></i>
                        <span className="link-text">More</span>
                    </a>
                </li>
                <li className="nav-item">
                    <a href="#">
                        <i className="fas fa-cog fa-2x" aria-hidden="true"></i>
                        <span className="link-text">Settings</span>
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar
