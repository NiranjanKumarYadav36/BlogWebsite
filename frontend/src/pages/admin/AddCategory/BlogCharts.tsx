import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AxiosClient from "../../../components/ApiClient/AxiosClient";


const BlogCharts: React.FC = () => {
    const [activeTab, setActiveTab] = useState("categories");
    // const [categoryData, setCategoryData] = useState<{ name: string; subcategory_count: number }[]>([]);
    // const [setSubcategoryData] = useState<{ name: string; blog_count: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryData, setCategoryData] = useState<{ name: string; subcategory_count: number }[]>([]);




    // Fetch data from API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await AxiosClient.get("/admin/manage_categories/category_stats");

                if (response.data.success) {
                    setCategoryData(response.data.categoryData);
                } else {
                    throw new Error("Failed to fetch data");
                }
            } catch (err) {
                setError("Error fetching data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="w-full flex justify-center">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full m-3">
                <TabsList className="flex space-x-4 mb-4 -ml-60">
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>

                {loading && <p className="text-center">Loading...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && (
                    <>
                        <TabsContent value="categories" className="flex justify-center mt-3">
                            <div className="flex justify-center -ml-56">
                                <ResponsiveContainer width={430} height={350}>
                                    <BarChart data={categoryData} margin={{ bottom: 50 }}>
                                        <CartesianGrid strokeDasharray="1 2" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 13 }}
                                            angle={-40}
                                            textAnchor="end"
                                        />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="subcategory_count" fill="#3b82f6" radius={[5, 5, 3, 3]} barSize={26} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
};

export default BlogCharts;