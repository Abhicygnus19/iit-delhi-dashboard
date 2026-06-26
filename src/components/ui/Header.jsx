import { Link } from "react-router-dom";

const navItems = [
  {
    label: "Sponsor Research Projects",
    link: "/sponsor-research-project",
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
    <div className="bg-blue-900 py-6 px-2">
      <div className="max-w-[1500px] mx-auto flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-white text-2xl font-bold">
            IIT Delhi R&D Unit Dashboard
          </h2>
          <p className="text-gray-300 text-sm">
            Interactive cross-filtering demo for IIT Delhi R&D Division
          </p>
        </div>
      </div>

      <div className="mt-4 max-w-[1500px] mx-auto flex flex-wrap gap-6">
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
