const QueueAdmin = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Diesel Premium Queue</h1>
        <div className="flex gap-3">
          <button className="bg-white border px-4 py-2 rounded-lg text-sm font-bold">Pause Queue</button>
          <button className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold">+ Manual Entry</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="p-5">Position</th>
              <th className="p-5">PIN Code</th>
              <th className="p-5">Wait Time</th>
              <th className="p-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* List items mapping to match image d98978 */}
            <tr className="hover:bg-slate-50">
              <td className="p-5 font-bold">1</td>
              <td className="p-5 font-mono">FF-9284</td>
              <td className="p-5">24 mins</td>
              <td className="p-5">
                <button className="bg-teal-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold">SERVE NOW</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default QueueAdmin;