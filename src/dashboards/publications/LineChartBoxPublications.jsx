import { useMemo, useState, useEffect } from "react"; // Added useEffect
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { RxCross1 } from "react-icons/rx";
import {
  fetchYearlyPublications,
  // yearlyPublicationsdata,
} from "../../lib/publicationData";

export default function LineChartBoxPublications({
  yearRange,
  selectedYear,
  onYearSelect,
  onReset,
  showReset,
}) {
  const [yearlyPublicationsdata, setYearlyPublicationsData] = useState([]);

  useEffect(() => {
    const getYearlyPublicationData = async () => {
      const apiDataYearlyPub = await fetchYearlyPublications();
      setYearlyPublicationsData(apiDataYearlyPub);
    };
    getYearlyPublicationData();
  }, []);

  // Filter using the state variable instead of the local hardcoded file
  const data = useMemo(() => {
    const [startYear, endYear] = yearRange ?? [];

    const filtered = yearlyPublicationsdata.filter((item) => {
      if (selectedYear != null) {
        return item.year === selectedYear;
      }

      if (startYear != null && endYear != null) {
        return item.year >= startYear && item.year <= endYear;
      }
      return true;
    });

    return filtered;
  }, [yearRange, selectedYear, yearlyPublicationsdata]);

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-semibold text-sm">No. of Publications Over Time</h3>

        {showReset && (
          <button
            onClick={onReset}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
          >
            <span className="whitespace-nowrap">Reset Chart</span>
            <RxCross1 />
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#cacaca"
            vertical={true}
            horizontal={true}
          />
          <XAxis
            dataKey="year"
            angle={-20}
            tick={{ fontSize: 11 }}
            textAnchor="end"
            tickLine={false}
          />
          <YAxis tickLine={false} />
          <Tooltip />
          <Legend verticalAlign="top" height={36} iconType="square" />{" "}
          <Line
            name="Total Publications"
            dataKey="total"
            stroke="#2563eb"
            strokeWidth={2}
            activeDot={{
              onClick: (event, payload) => {
                const year = payload?.payload?.year;
                if (year != null) {
                  onYearSelect?.(year);
                }
              },
              cursor: "pointer",
            }}
          />
          <Line
            name="Foreign Publications"
            dataKey="foreign"
            stroke="#ea580c"
            strokeWidth={2}
            activeDot={{
              onClick: (event, payload) => {
                const year = payload?.payload?.year;
                if (year != null) {
                  onYearSelect?.(year);
                }
              },
              cursor: "pointer",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// import { useMemo, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
//   Legend, // Added Legend to show what each line means
// } from "recharts";
// import { RxCross1 } from "react-icons/rx";
// import { yearlyPublications } from "../../lib/publicationData";
// import { fetchYearlyPublications } from "../../lib/publicationData";
// import { yearlyPublications } from "./../../lib/publicationData";

// export default function LineChartBoxPublications({
//   yearRange,
//   selectedYear,
//   onYearSelect,
//   onReset,
//   showReset,
// }) {
//   const [yearlyPublicationsdata, setYearlyPublicationsData] = useState();

//   const data = useMemo(() => {
//     const [startYear, endYear] = yearRange ?? [];

//     const filtered = yearlyPublications.filter((item) => {
//       if (selectedYear != null) {
//         return item.year === selectedYear;
//       }

//       if (startYear != null && endYear != null) {
//         return item.year >= startYear && item.year <= endYear;
//       }
//       return true;
//     });

//     return filtered;
//   }, [yearRange, selectedYear]);

//   return (
//     <div className="border-2 p-4 rounded-md shadow-sm text-xs">
//       <div className="flex items-center justify-between gap-2 mb-4">
//         <h3 className="font-semibold text-sm">No. of Publications Over Time</h3>

//         {showReset && (
//           <button
//             onClick={onReset}
//             className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
//           >
//             <span className="whitespace-nowrap">Reset Chart</span>
//             <RxCross1 />
//           </button>
//         )}
//       </div>
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={data}>
//           <CartesianGrid
//             strokeDasharray="3 3"
//             stroke="#cacaca"
//             vertical={true}
//             horizontal={true}
//           />
//           <XAxis
//             dataKey="year"
//             angle={-20}
//             tick={{ fontSize: 11 }}
//             textAnchor="end"
//             tickLine={false}
//           />
//           <YAxis tickLine={false} />
//           <Tooltip />
//           <Legend verticalAlign="top" height={36} iconType="square" />{" "}
//           {/* Line for Total Publications */}
//           <Line
//             name="Total Publications"
//             dataKey="total"
//             stroke="#2563eb" // Added a clear blue color
//             strokeWidth={2}
//             activeDot={{
//               onClick: (event, payload) => {
//                 const year = payload?.payload?.year;
//                 if (year != null) {
//                   onYearSelect?.(year);
//                 }
//               },
//               cursor: "pointer",
//             }}
//           />
//           <Line
//             name="Foreign Publications"
//             dataKey="foreign"
//             stroke="#ea580c" // Distinct orange/red color
//             strokeWidth={2}
//             activeDot={{
//               onClick: (event, payload) => {
//                 const year = payload?.payload?.year;
//                 if (year != null) {
//                   onYearSelect?.(year);
//                 }
//               },
//               cursor: "pointer",
//             }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
