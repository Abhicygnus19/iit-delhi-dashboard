import React, { useMemo, useState } from "react";
import { grpProjectData } from "./../lib/GrpProjectData";
import GrpFilters from "../dashboards/grpProject/GrpFilters";
import GrpBarchart from "./../dashboards/grpProject/GrpBarchart"; // Unified reusable chart
import GrpStatsCards from "../dashboards/grpProject/GrpStatsCards";

function GrpProjects() {
  const [selectedGrpTypes, setSelectedGrpTypes] = useState([]);
  const [selectedCollabs, setSelectedCollabs] = useState([]);

  // 1. Dynamic GRP type options (Handles any new type added to data)
  const grpTypeOptions = useMemo(() => {
    const types = [
      ...new Set(grpProjectData.map((d) => d.grpType).filter(Boolean)),
    ];
    return types.map((t) => ({
      label: t.charAt(0).toUpperCase() + t.slice(1),
      value: t.toLowerCase(),
    }));
  }, []);

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
  }, []);

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
  }, [selectedGrpTypes, selectedCollabs]);

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
      <div className="px-4 py-6 max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(groupedData).map(([type, data]) => (
          <GrpBarchart key={type} grpData={data} projectType={type} />
        ))}
      </div>
    </>
  );
}

export default GrpProjects;
