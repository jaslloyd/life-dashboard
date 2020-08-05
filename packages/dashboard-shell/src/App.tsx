import React from 'react'
import Navbar from './Navbar'
import './index.css'

const DashboardShell: React.FC = ({ children }) => (
    <>
        <aside>
            <Navbar />
        </aside>
        <main>{children ? children : <h1>Hello from Dashboard shell</h1>}</main>
    </>
)

export default DashboardShell
