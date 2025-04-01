// components/Layout.jsx
import Sidebar from "./sidebar";
import Navbar from "./navbar";

const Layout = ({ children }) => {
    return (
        <div className="flex bg-neutral-100 h-screen">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <Navbar />
                
                {/* Page Content */}
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

export default Layout;
