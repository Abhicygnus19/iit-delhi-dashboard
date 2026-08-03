import React, { useMemo, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { BiCategory } from "react-icons/bi";

export const CustomSelect = ({
  label,
  options = [],
  selected = [],
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef(null);

  const isMobile = () => window.innerWidth < 1024;

  const displayLabel = useMemo(() => {
    if (selected.length === 0) return label;

    if (selected.length === 1) {
      return options.find((opt) => opt.value === selected[0])?.label || label;
    }

    return `${selected.length} Selected`;
  }, [selected, options, label]);

  const handleSelect = (value) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];

    onChange(next);

    if (isMobile()) {
      setIsOpen(false);
    }
  };

  const handleMouseEnter = () => {
    if (isMobile()) return;

    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile()) return;

    closeTimer.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClick = () => {
    if (!isMobile()) return;

    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className="relative w-[266px] "
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Select */}
      <div
        onClick={handleClick}
        className="flex items-center justify-between rounded-md border bg-white p-2 h-11 cursor-pointer select-none hover:border-gray-400"
      >
        {/* <div className="w-10 h-10 flex justify-center items-center bg-blue-50 rounded-full ">
          <BiCategory className="text-sm" />
        </div> */}
        <span className="truncate font-medium text-gray-700">
          {displayLabel}
        </span>

        <GoChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isChecked = selected.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex w-full cursor-pointer select-none items-center gap-3 px-3 py-2 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleSelect(option.value)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="truncate text-sm text-gray-700">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// import React, { useMemo, useState } from "react";
// import { GoChevronDown } from "react-icons/go";
// import { Range } from "react-range";

// export const CustomSelect = ({
//   label,
//   options = [],
//   selected = [],
//   onChange,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const displayLabel = useMemo(() => {
//     if (selected.length === 0) return label;
//     if (selected.length === 1) {
//       return options.find((opt) => opt.value === selected[0])?.label || label;
//     }
//     return `${selected.length} Selected`;
//   }, [selected, options, label]);

//   const handleSelect = (value) => {
//     const next = selected.includes(value)
//       ? selected.filter((item) => item !== value)
//       : [...selected, value];
//     onChange(next);
//   };

//   return (
//     <div className="relative w-64">
//       <div
//         className="flex items-center justify-between border p-2 rounded-md bg-white cursor-pointer hover:border-gray-400 select-none"
//         onClick={() => setIsOpen((prev) => !prev)}
//       >
//         <span className="truncate text-gray-700 font-medium">
//           {displayLabel}
//         </span>
//         <GoChevronDown
//           size={16}
//           className={`transition-transform duration-200 text-gray-500 ${isOpen ? "rotate-180" : ""}`}
//         />
//       </div>

//       {isOpen && (
//         <div className="absolute left-0 right-0 z-50">
//           <div
//             className="fixed inset-0 z-30"
//             onClick={() => setIsOpen(false)}
//           />

//           <div className="relative z-40 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
//             {options.map((option) => {
//               const isChecked = selected.includes(option.value);
//               return (
//                 <label
//                   key={option.value}
//                   className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer select-none transition-colors w-full"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={isChecked}
//                     onChange={() => handleSelect(option.value)}
//                     className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                   <span className="text-sm text-gray-700 block truncate">
//                     {option.label}
//                   </span>
//                 </label>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
