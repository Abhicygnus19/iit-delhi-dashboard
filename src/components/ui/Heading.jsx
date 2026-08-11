import React from "react";

function Heading({ pageheading }) {
  return (
    <>
      <div className="bg-white py-3 lg:py-5 px-2 mb-2 sticky z-10 top-[61px] sm:top-[72px] xl:top-[82px]">
        <h2 className="text-center text-xl md:text-4xl font-bold text-blue-900 mx-auto max-w-[1500px]">
          {pageheading}
        </h2>
      </div>
    </>
  );
}

export default Heading;
