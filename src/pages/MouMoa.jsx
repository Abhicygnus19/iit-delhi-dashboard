import React, { useEffect, useMemo, useState } from "react";
import MouMoaFilter from "../dashboards/mou_moa/MouMoaFilter";
import MouTableData from "../dashboards/mou_moa/MouTableData";
import MoaTableData from "../dashboards/mou_moa/MoaTableData";

// import { moaData, mouData } from "./../lib/mouMoaData";
import { fetchMouData, fetchMoaData } from "./../lib/mouMoaData";
import { LuLoaderCircle } from "react-icons/lu";

function MouMoa() {
  const [mouData, setMouData] = useState([]);
  const [moaData, setMoaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMOUCategories, setSelectedMOUCategories] = useState([]);
  const [selectedMOACountry, setSelectedMOACountry] = useState([]);

  useEffect(() => {
    const getMOUMOAData = async () => {
      setLoading(true);

      const apiMouData = await fetchMouData();
      const apiMoaData = await fetchMoaData();
      setMouData(apiMouData || []);
      setMoaData(apiMoaData || []);

      setLoading(false);
    };
    getMOUMOAData();
  }, []);

  // 2. Dynamically extract unique categories for the filter dropdown options
  const filterMouOptions = useMemo(() => {
    const uniqueCategories = [...new Set(mouData.map((item) => item.category))];
    return uniqueCategories.map((cat) => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1), // Capitalize label text cleanly
      value: cat,
    }));
  }, [mouData]);

  const filterMoaOptions = useMemo(() => {
    const uniqueCountries = [...new Set(moaData.map((item) => item.country))];
    return uniqueCountries.map((country) => ({
      label: country.charAt(0).toUpperCase() + country.slice(1), // Capitalize label text cleanly
      value: country,
    }));
  }, [moaData]);

  //   Filter the data based on selection. If nothing is selected, show all data.
  const filteredMouData = useMemo(() => {
    if (selectedMOUCategories.length === 0) return mouData;
    return mouData.filter((item) =>
      selectedMOUCategories.includes(item.category),
    );
  }, [selectedMOUCategories, mouData]);

  const filteredMoaData = useMemo(() => {
    if (selectedMOACountry.length === 0) return moaData;
    return moaData.filter((item) => selectedMOACountry.includes(item.country));
  }, [selectedMOACountry, moaData]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <LuLoaderCircle className="animate-spin text-blue-900" size={60} />
        <span className="text-slate-700 font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {/* Pass filter controls and available options down */}
      <div className="px-2 py-4 mb-4 text-sm border-t border-b bg-gray-50">
        <div className="max-w-[1500px] mx-auto">
          <MouMoaFilter
            options={filterMouOptions}
            selected={selectedMOUCategories}
            onChange={setSelectedMOUCategories}
            optionValue={"Select Category of MOU"}
          />{" "}
        </div>
      </div>

      <div className="px-2 max-w-[1500px] mx-auto flex flex-col gap-8 pb-12">
        {/* Pass the dynamic filtered array instead of reading hardcoded data inside */}
        <MouTableData Moudata={filteredMouData} />

        <div className="border-2 p-4 rounded-md shadow-sm ">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h3 className="text-base font-semibold">MOA</h3>

            <MouMoaFilter
              options={filterMoaOptions}
              selected={selectedMOACountry}
              onChange={setSelectedMOACountry}
              optionValue={"Select Country"}
            />
          </div>
          <MoaTableData MoaData={filteredMoaData} />
        </div>
      </div>
    </>
  );
}

export default MouMoa;
