import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function MetricComparisonPublications({
  entities = [], // Clean array configuration
  yearRange,
}) {
  const chartData = entities
    .map((dept) => {
      const [startYear, endYear] = yearRange ?? [];

      const publications =
        dept.publications?.reduce((sum, pub) => {
          if (startYear != null && endYear != null) {
            return pub.year >= startYear && pub.year <= endYear
              ? sum + Number(pub.value || 0)
              : sum;
          }
          return sum + Number(pub.value || 0);
        }, 0) || 0;

      // Handle lifetime reference metric calculation safely
      const referenceTotal = dept.total > 0 ? dept.total : publications || 1;

      return {
        name: dept.name,
        publications,
        highImpact: dept.citations
          ? Math.round(Number(dept.citations) / Number(referenceTotal))
          : 0,
      };
    })
    .sort((a, b) => b.publications - a.publications)
    .slice(0, 8);

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs">
      <h3 className="mb-4 font-semibold text-sm">
        Metric Comparison (Top Departments)
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            angle={-20}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 11 }}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.slice(0, 20)}...` : value
            }
            tickLine={false}
          />
          <YAxis tickLine={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="publications" name="Publications" fill="#1e4a8d" />
          {/* <Bar dataKey="highImpact" name="High Impact" fill="#f97316" /> */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MetricComparisonPublications;

// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
// } from "recharts";

// import { publicationData } from "../../lib/publicationData";

// function MetricComparisonPublications({
//   entities = publicationData.departments,
//   yearRange,
// }) {
//   const chartData = entities
//     .map((dept) => {
//       const [startYear, endYear] = yearRange ?? [];

//       // 1. Calculate publications filtered by active year range for the bar height
//       const publications = dept.publications?.reduce((sum, pub) => {
//         if (startYear != null && endYear != null) {
//           return pub.year >= startYear && pub.year <= endYear
//             ? sum + Number(pub.value || 0)
//             : sum;
//         }
//         return sum + Number(pub.value || 0);
//       }, 0);

//       return {
//         name: dept.name,
//         publications, // Controlled by the year filter

//         // FIX: Divide by absolute total publications to maintain correct lifetime average
//         highImpact:
//           dept.total > 0
//             ? Math.round(Number(dept.citations || 0) / Number(dept.total))
//             : 0,
//       };
//     })
//     .sort((a, b) => b.publications - a.publications)
//     .slice(0, 8);

//   return (
//     <div className="border-2 p-4 rounded-md shadow-sm text-xs">
//       <h3 className="mb-4 font-semibold text-sm">
//         Metric Comparison (Top Departments)
//       </h3>

//       <ResponsiveContainer width="100%" height={320}>
//         <BarChart data={chartData}>
//           <XAxis
//             dataKey="name"
//             angle={-20}
//             textAnchor="end"
//             height={80}
//             interval={0}
//             tick={{ fontSize: 11 }}
//             tickFormatter={(value) =>
//               value.length > 20 ? `${value.slice(0, 20)}...` : value
//             }
//             tickLine={false}
//           />

//           <YAxis tickLine={false} />

//           <Tooltip />

//           <Legend />

//           <Bar dataKey="publications" name="Publications" fill="#1e4a8d" />

//           <Bar dataKey="highImpact" name="High Impact" fill="#f97316" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// export default MetricComparisonPublications;
