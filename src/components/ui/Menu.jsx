import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { fetchMenuData } from "../../lib/menus";
import "./Menu.css";
import { BsHouse } from "react-icons/bs";
import barImg from "../../assets/bar.png";

function Menu() {
  const [menuHtml, setMenuHtml] = useState(null);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    fetchMenuData()
      .then((html) => {
        if (isActive) {
          setMenuHtml(html);
        }
      })
      .catch((fetchError) => {
        if (isActive) {
          setError(fetchError);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (error) {
    return (
      <div className="menu-error" role="alert">
        Unable to load navigation: {error.message}
      </div>
    );
  }

  if (menuHtml === null) {
    return null;
  }

  return (
    <>
      <div className="secondary-menu">
        <div className="secondary-navigation">
          <button
            className="secondary-menu-toggle"
            type="button"
            aria-label={
              isSecondaryMenuOpen
                ? "Close secondary navigation"
                : "Open secondary navigation"
            }
            aria-expanded={isSecondaryMenuOpen}
            aria-controls="secondary-menu-panel"
            onClick={() => setIsSecondaryMenuOpen((isOpen) => !isOpen)}
          >
            {isSecondaryMenuOpen ? (
              <FiX aria-hidden="true" />
            ) : (
              <img src={barImg} alt="Secondary Menu" />
            )}
          </button>

          <div
            id="secondary-menu-panel"
            className={`secondary-menu-panel${isSecondaryMenuOpen ? " is-open" : ""}`}
          >
            <button
              className="secondary-menu-close"
              type="button"
              aria-label="Close secondary navigation"
              onClick={() => setIsSecondaryMenuOpen(false)}
            >
              <FiX aria-hidden="true" />
            </button>
            <div
              className="secondary-links"
              onClick={(event) => {
                if (event.target.closest("a")) {
                  setIsSecondaryMenuOpen(false);
                }
              }}
            >
              <a href="">IIT Delhi Home</a>
              <a href="">Open House</a>
            </div>
          </div>
        </div>
        {isSecondaryMenuOpen && (
          <button
            className="secondary-menu-backdrop"
            type="button"
            aria-label="Close secondary navigation"
            onClick={() => setIsSecondaryMenuOpen(false)}
          />
        )}
      </div>

      <div className="menu-outer">
        <nav className="menu-shell" aria-label="Main navigation">
          <a className="menu-brand" href="https://cygnusweb.in/iitd/">
            <img
              src="https://cygnusweb.in/iitd/uploads/home/1788344515_96653845294677176c46.png"
              alt="IIT Delhi Research and Development"
            />
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMenuOpen}
            aria-controls="primary-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <FiX aria-hidden="true" />
            ) : (
              <FiMenu aria-hidden="true" />
            )}
          </button>

          {isMenuOpen && (
            <button
              className="menu-backdrop"
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
          <div
            id="primary-menu"
            className={`menu-panel${isMenuOpen ? " is-open" : ""}`}
          >
            <button
              className="menu-close"
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsMenuOpen(false)}
            >
              <span />
              <span />
            </button>

            <a
              href="https://cygnusweb.in/iitd/"
              className="menu-home"
              aria-label="Home"
            >
              <BsHouse
                size={16}
                className="menu-home-icon"
                aria-hidden="true"
              />
            </a>

            <ul
              className="menu-list"
              dangerouslySetInnerHTML={{ __html: menuHtml }}
              onClick={(event) => {
                const link = event.target.closest("a");
                if (!link) {
                  return;
                }

                if (window.matchMedia("(max-width: 1400px)").matches) {
                  const submenu = Array.from(link.parentElement.children).find(
                    (child) => child.matches("ul.nav-dropdown"),
                  );

                  if (submenu) {
                    event.preventDefault();
                    const isExpanded =
                      link.parentElement.classList.toggle("is-expanded");
                    link.setAttribute("aria-expanded", String(isExpanded));
                    return;
                  }

                  setIsMenuOpen(false);
                }
              }}
            />
          </div>
        </nav>{" "}
      </div>
    </>
  );
}

export default Menu;
