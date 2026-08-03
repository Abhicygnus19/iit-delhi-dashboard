import React from "react";

function Heading({ pageheading }) {
  return (
    <>
      <div className="bg-white py-1 px-2 mb-2 sticky z-10 top-[61px] sm:top-[72px] xl:top-[82px]">
        <h2 className="text-xl md:text-3xl font-bold text-blue-900 mx-auto max-w-[1500px]">
          {pageheading}
        </h2>
      </div>
    </>
  );
}

export default Heading;
