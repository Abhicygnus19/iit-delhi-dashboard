import React, { useEffect, useMemo, useState } from "react";
import GrpFilters from "../dashboards/grpProject/GrpFilters";
import GrpBarchart from "./../dashboards/grpProject/GrpBarchart";
import GrpStatsCards from "../dashboards/grpProject/GrpStatsCards";
import { fetchGrpProjectData } from "./../lib/GrpProjectData";
import { LuLoaderCircle } from "react-icons/lu";

function GrpProjects() {
  const [grpProjectData, setGrpProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrpTypes, setSelectedGrpTypes] = useState([]);
  const [selectedCollabs, setSelectedCollabs] = useState([]);

  // fetching grp project
  useEffect(() => {
    const getGrpProjectData = async () => {
      setLoading(true);
      const apiGrpProjectData = await fetchGrpProjectData();
      setGrpProjectData(apiGrpProjectData || []);
      setLoading(false);
    };
    getGrpProjectData();
  }, []);

  // 1. Dynamic GRP type options (Handles any new type added to data)
  const grpTypeOptions = useMemo(() => {
    const types = [
      ...new Set(grpProjectData.map((d) => d.grpType).filter(Boolean)),
    ];
    return types.map((t) => ({
      label: t.charAt(0).toUpperCase() + t.slice(1),
      value: t.toLowerCase(),
    }));
  }, [grpProjectData]);

  // 2. Dynamic Collaboration options
  const collabOptions = useMemo(() => {
    const collabs = [
      ...new Set(
        grpProjectData.map((d) => d.collaborationType).filter(Boolean),
      ),
    ];
    return collabs.map((c) => ({
      label: c.charAt(0).toUpperCase() + c.slice(1),
      value: c.toLowerCase(),
    }));
  }, [grpProjectData]);

  // 3. Filtered Data
  const filteredData = useMemo(() => {
    return grpProjectData.filter((item) => {
      const matchGrpType =
        selectedGrpTypes.length === 0 ||
        selectedGrpTypes.includes(item.grpType?.toLowerCase());

      const matchCollab =
        selectedCollabs.length === 0 ||
        (item.collaborationType &&
          selectedCollabs.includes(item.collaborationType?.toLowerCase()));

      return matchGrpType && matchCollab;
    });
  }, [selectedGrpTypes, selectedCollabs, grpProjectData]);

  // 4. DYNAMIC GROUPING: Group data by grpType dynamically
  const groupedData = useMemo(() => {
    return filteredData.reduce((groups, item) => {
      // Fallback to "Unknown" if grpType is missing in a record
      const type = item.grpType ? item.grpType.toLowerCase() : "unknown";
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
      return groups;
    }, {});
  }, [filteredData]);

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
      <GrpFilters
        grpTypeOptions={grpTypeOptions}
        selectedGrpTypes={selectedGrpTypes}
        onGrpTypeChange={setSelectedGrpTypes}
        collabOptions={collabOptions}
        selectedCollabs={selectedCollabs}
        onCollabChange={setSelectedCollabs}
      />
      <GrpStatsCards grpStatsData={filteredData} />

      {/* Grid adjusting layout dynamically based on how many charts are showing */}
      <div className="px-2 pb-12 mt-6 max-w-[1500px] mx-auto grid grid-cols-1 gap-8">
        {Object.entries(groupedData).map(([type, data]) => (
          <GrpBarchart key={type} grpData={data} projectType={type} />
        ))}
      </div>
    </>
  );
}

export default GrpProjects;
