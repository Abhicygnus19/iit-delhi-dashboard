import { Link } from "react-router-dom";

const navItems = [
  {
    label: "Sponsor Research Projects",
    link: "/sponsored-research-project",
  },
  {
    label: "Consultancy Projects",
    link: "/consultancy-project",
  },
  { label: "Publication", link: "/publication" },

  {
    label: "Patents IIT Delhi",
    link: "/patent-iit-delhi",
  },
  { label: "COE Projects", link: "/coe-projects" },
  { label: "GRP Projects", link: "/grp-projects" },
  { label: "MOU-MOA", link: "/mou-moa" },
  {
    label: "Students Scheme",
    link: "/students-scheme",
  },
];

function Header() {
  return (
    <div className="bg-blue-900 py-6 px-2 sticky top-0 z-50  h-[82px]">
      <div className="mt-2 max-w-[1500px] mx-auto flex  overflow-auto gap-6">
        {navItems.map((item) => (
          <Link
            key={item.link}
            to={item.link}
            className="text-white hover:text-blue-200 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Header;
