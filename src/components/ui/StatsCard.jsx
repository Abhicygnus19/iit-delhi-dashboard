export default function StatsCard({ title, value }) {
  return (
    <div
      className={`p-4 rounded-md border border-gray-200 border-l-4 border-l-blue-500  bg-white shadow-md`}
    >
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h2 className="text-2xl font-bold mt-1 text-gray-800">{value}</h2>
    </div>
  );
}
