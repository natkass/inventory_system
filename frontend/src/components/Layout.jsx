import Sidebar from "./sidebar";
import Navbar from "./navbar";

const Layout = ({ children }) => {
    return (
        <div className="flex bg-neutral-100 h-screen">
            {/* Sidebar */}
            <Sidebar className="h-screen" />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Navbar */}
                <Navbar />
                
                {/* Page Content */}
                <div className="p-4 flex-1 overflow-auto">{children}</div>
            </div>
        </div>
    );
};

export default Layout;
