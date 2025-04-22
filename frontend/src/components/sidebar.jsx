import { useState } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Chip,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PresentationChartBarIcon,
  ShoppingBagIcon,
  InboxIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  PowerIcon,
} from "@heroicons/react/24/outline";
import { FaChevronDown } from "react-icons/fa";

const Sidebar = () => {
  const [open, setOpen] = useState(null);

  const handleOpen = (value) => {
    setOpen(open === value ? null : value);
  };

  return (
    <Card className="bg-[#3A3A3A] h-full w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
      <div className="mb-2 p-4 bg-grat-800">
        <Typography variant=" h5" className="text-white" >
          Sidebar
        </Typography>
      </div>
      <List className="space-y-1">
        {/* Dashboard Section */}
        ;

<ListItem className="p-0">
  <Link
    to="/dashboard"
    className="text-white  border-b-0 p-3 flex items-center gap-x-2 w-full"
  >
    <ListItemPrefix>
      <PresentationChartBarIcon className=" h-5 w-5" />
    </ListItemPrefix>

    <Typography color="white" className="mr-auto font-bold text-lg">
      Dashboard
    </Typography>

  </Link>
</ListItem>



        {/* E-Commerce Section */}
        <Accordion open={open === 2}>
          <ListItem className="p-0" selected={open === 2}>
            <AccordionHeader onClick={() => handleOpen(2)} className="text-white  border-b-0 p-3 flex items-center gap-x-2">
              <ListItemPrefix>
                <ShoppingBagIcon className="h-5 w-5" />
              </ListItemPrefix>
              <Typography color="blue-gray" className="mr-auto font-normal">
                E-Commerce
              </Typography>
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`h-4 w-4 transition-transform ${open === 2 ? "rotate-180" : ""}`}
              />
            </AccordionHeader>
          </ListItem>
          <AccordionBody className={`py-1 ${open === 2 ? "" : "hidden"}`}>
            <List className="text-white  p-0 space-y-1">
              {[
                { name: "Orders", path: "/orders" },
                { name: "Products", path: "/products" },
                { name: "Category", path: "/category" },
                { name: "Customer", path: "/customer" },
              ].map((item, index) => (
                <Link to={item.path} key={index} className="block">
                  <ListItem className="flex items-center gap-x-2 cursor-pointer">
                    <ListItemPrefix>
                      <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                    </ListItemPrefix>
                    {item.name}
                  </ListItem>
                </Link>
              ))}
            </List>
          </AccordionBody>
        </Accordion>

        <hr className=" text-white  my-2 border-blue-gray-50" />

        {/* Additional Links */}
        {[
          { icon: <InboxIcon className="text-white  h-5 w-5" />, label: "Inbox", suffix: <Chip value="14" size="sm" variant="ghost" className="text-white  rounded-full" /> },
          { icon: <UserCircleIcon className="h-5 w-5" />, label: "Profile" },
          { icon: <Cog6ToothIcon className="h-5 w-5" />, label: "Settings" },
          { icon: <PowerIcon className="h-5 w-5" />, label: "Log Out" },
        ].map((item, index) => (
          <ListItem key={index} className="text-white  flex items-center gap-x-2">
            <ListItemPrefix>{item.icon}</ListItemPrefix>
            {item.label}
            {item.suffix && <ListItemSuffix>{item.suffix}</ListItemSuffix>}
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default Sidebar;
