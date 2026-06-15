import { Link, useLocation } from 'react-router-dom';
import { bottombarLinks } from '@/constants';

const Bottombar = () => {
  const { pathname } = useLocation();

  return (
    <section className="z-50 flex flex-row justify-between w-full sticky bottom-0 bg-dark-2 px-5 py-4 md:hidden">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;

        return (
          <Link
            to={link.route}
            key={link.label}
            className={`group flex flex-col items-center justify-center p-2 rounded-[10px] transition-all duration-200 
            ${isActive ? "bg-primary-500" : "hover:bg-primary-500/20"}`}
          >
            <img
              src={link.imgURL}
              alt={link.label}
              width={24}
              height={24}
              className={`${isActive || "group-hover:invert-0"} invert-white`}
            />
            <p className="tiny-medium text-light-2 mt-1">
              {link.label}
            </p>
          </Link>
        );
      })}
    </section>
  );
};

export default Bottombar;