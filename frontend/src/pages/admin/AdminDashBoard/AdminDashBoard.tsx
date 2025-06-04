import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AxiosClient from "../../../components/ApiClient/AxiosClient";
import { Card, CardContent } from "../../../components/ui/card";
import AdminSidebar from "../../../components/AdminComponents/AdminSideBar";
import { Menu } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

enum DateRange {
  SevenDays = "7d",
  OneMonth = "1m",
  OneYear = "1y"
}

function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [engagementData, setEngagementData] = useState([]);
  const [dateRange, setDateRange] = useState<DateRange>(DateRange.SevenDays); // Default: Last 7 days
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([])

  useEffect(() => {
    const totalStats = async () => {
      try {
        const response = await AxiosClient.get("/admin/dashboard")

        if (response.status == 201) {
          setData(response.data)
        }
      } catch (error) {
        setData([])
      }
    }

    totalStats()
  }, [])

  useEffect(() => {
    fetchEngagementData();
  }, [dateRange]);

  const fetchEngagementData = async () => {
    setLoading(true);
    try {
      const { start, end } = getStartDate(dateRange);
      const response = await AxiosClient.get("/admin/engagement", {
        params: { startDate: start, endDate: end },
      });
      setEngagementData(response.data?.engagementData || []);
    } catch (error) {
      console.error("Error fetching engagement data:", error);
    } finally {
      setLoading(false);
    }
  };

  

  const getStartDate = (range: DateRange) => {  // Use the enum type
    const endDate = new Date();
    const startDate = new Date();

    if (range === DateRange.SevenDays) startDate.setDate(startDate.getDate() - 7);
    if (range === DateRange.OneMonth) startDate.setMonth(startDate.getMonth() - 1);
    if (range === DateRange.OneYear) startDate.setFullYear(startDate.getFullYear() - 1);

    return {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-y-auto">

      {/* Mobile Sidebar Toggle Button */}
      <button
        className="fixed top-4 left-4 md:hidden bg-white p-2 rounded-lg shadow-sm z-40 hover:bg-gray-100 transition-colors"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:translate-x-0 md:relative z-30`}>
        <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm md:hidden z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-auto p-4 md:p-6 ml-0 md:ml-[18rem] transition-all duration-300">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(data).map(([key, value]) => (
            <Card
              key={key}
              className="p-5 text-center border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300 bg-white"
            >
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {key.replace(/_/g, " ")}
              </h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {value}
              </p>
            </Card>
          ))}
        </div>

        {/* Engagement Chart */}
        <Card className="w-full border border-gray-200 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Blog Engagement Overview</h2>

              <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                <SelectTrigger className="w-[180px] border-gray-300">
                  <SelectValue placeholder="Select Date Range" />
                </SelectTrigger>
                <SelectContent className="border-gray-200">
                  <SelectItem value={DateRange.SevenDays} className="hover:bg-gray-50">
                    Last 7 days
                  </SelectItem>
                  <SelectItem value={DateRange.OneMonth} className="hover:bg-gray-50">
                    Last 1 month
                  </SelectItem>
                  <SelectItem value={DateRange.OneYear} className="hover:bg-gray-50">
                    Last 1 year
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="h-[400px] overflow-x-auto">
                <div className="min-w-[600px] md:min-w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={engagementData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                    >
                      <defs>
                        <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorReactions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7280' }}
                        tickMargin={10}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: '20px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="comments"
                        stroke="#60a5fa"
                        fillOpacity={1}
                        fill="url(#colorComments)"
                        name="Comments"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="reactions"
                        stroke="#2563eb"
                        fillOpacity={1}
                        fill="url(#colorReactions)"
                        name="Reactions"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#dc2626"
                        fillOpacity={1}
                        fill="url(#colorViews)"
                        name="Views"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;