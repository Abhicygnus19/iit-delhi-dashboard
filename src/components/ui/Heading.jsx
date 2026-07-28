import React from "react";

function Heading({ pageheading }) {
  return (
    <>
      <div className="sticky top-[157px] z-10 bg-white">
        <h2 className="text-center text-2xl mb-4 font-bold text-blue-900 ">
          {pageheading}
        </h2>
      </div>
    </>
  );
}

export default Heading;
