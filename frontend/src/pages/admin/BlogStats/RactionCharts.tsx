import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import AxiosClient from "../../../components/ApiClient/AxiosClient";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";


interface TabluarReactions {
    reaction_type: string,
    username: string,
    created_at: string
}


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ReactionsChart = ({ data }: { data: { label: string; value: number }[] }) => {
    const { state } = useLocation();
    const id = state?.id
    const [activeTab, setActiveTab] = useState("pie");
    const [tabluarReactions, setTabularReactions] = useState<TabluarReactions[]>([])

    useEffect(() => {
        if (id) {
            fetchReactionsForTable(id);            
        }
    }, [id]);

    const fetchReactionsForTable = async (blogId: string) => {
        if (!blogId) return;

        try {
            const response = await AxiosClient.get(`/admin/manage_blogs/table_reactions/${blogId}`);

            // Check if response data exists and has the expected structure
            if (response.data?.response?.length > 0) {
                setTabularReactions(response.data.response);
            } else {
                setTabularReactions([]);
                toast.error("No reactions available for this blog");
            }
        } catch (error) {
            console.error("Error fetching reactions:", error);
            toast.error("Error fetching reactions");
            setTabularReactions([]);
        }
    };



    return (
        <Card className="p-4 w-[580px] overflow-y-auto h-[700px]">
            <CardHeader>
                <CardTitle>Reactions Distribution</CardTitle>
            </CardHeader>

            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex justify-center">
                        <TabsTrigger value="pie">Pie Chart</TabsTrigger>
                        <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pie">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ label }) => `${label}`}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(label) => [`${label}`]} /> // ✅ Fix Hover Label
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-500">No reactions available</p>
                        )}
                    </TabsContent>

                    <TabsContent value="bar">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={data} margin={{ top: 20 }} >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />  {/* ✅ Ensures name appears on X-axis */}
                                    <YAxis />
                                    <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />  {/* ✅ Fix Hover Label */}
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8" barSize={30} radius={[5, 5, 4, 4]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-500">No reactions available</p>
                        )}
                    </TabsContent>
                </Tabs>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Reaction Type</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Reaction Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tabluarReactions.length > 0 ? (
                            tabluarReactions.map((reaction, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{reaction.reaction_type}</TableCell>
                                    <TableCell>{reaction.username}</TableCell>
                                    <TableCell>{new Date(reaction.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    No reactions found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>


            </CardContent>
        </Card>
    );
};

export default ReactionsChart;