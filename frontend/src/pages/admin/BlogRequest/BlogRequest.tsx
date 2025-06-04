import { useState, useEffect } from 'react'
import AxiosClient from '../../../components/ApiClient/AxiosClient'
import { Button } from '../../../components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../../components/ui/card'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../../components/ui/tabs";
import { Toaster, toast } from 'react-hot-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import AdminSidebar from '../../../components/AdminComponents/AdminSideBar'
import { Menu } from 'lucide-react'

interface Request {
    id: number,
    user_id: number,
    category_id: number,
    subcategory_id: number,
    status: string,
    blog_id?: number,
    request_at: string | null,
    user_name: string
}

function BlogRequest() {
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
    const [allSubcategories, setAllSubCategories] = useState<{ id: number, name: string, cateogry_id: number }[]>([])
    const [selectedTabs, setSelectedTabs] = useState("pending");
    const [acceptedRequest, setAcceptedRequest] = useState<Request[]>([])
    const [pendingRequest, setPendingRequest] = useState<Request[]>([])
    const [rejectedRequest, setRejectedRequest] = useState<Request[]>([])
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const getCategoryName = (id: number): string => {
        const category = categories.find(c => c.id === id);
        return category ? category.name : "Unknown Category";
    };

    const getSubcategoryName = (id: number): string => {
        const subcategory = allSubcategories.find(sc => sc.id === id);
        return subcategory ? subcategory.name : "Unknown Subcategory";
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await AxiosClient.get("/admin/manage_categories/categories")
                setCategories(response.data.data || [])
            } catch (error) {
                console.error("Error fetching categories:", error)
            }
        }

        const fetchAllSubCategories = async () => {
            try {
                const response = await AxiosClient.get("/admin/manage_categories/subcategories")
                setAllSubCategories(response.data.data || [])
            } catch (error) {
                console.error("Error fetching subcategories:", error)
            }
        }

        fetchAllSubCategories();
        fetchCategories();
        fetchRequestDetails();
    }, []);

    const fetchRequestDetails = async () => {
        try {
            const response = await AxiosClient.get("/admin/user_requests")

            if (response.status === 200 || response.status === 201) {
                setAcceptedRequest(response.data.acceptedRequest || [])
                setPendingRequest(response.data.pendingRequest || [])
                setRejectedRequest(response.data.rejectedRequest || [])
            } else {
                setAcceptedRequest([])
                setPendingRequest([])
                setRejectedRequest([])
            }
        } catch (error: any) {
            console.error("Fetch error:", error)
            if (error.response) {
                toast.error(error.response.data.message || "Something went wrong")
            } else {
                toast.error("Something went wrong")
            };
        }
    };

    const renderTable = (requests: Request[], showActions: boolean = false) => {
        return (
            <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-medium text-gray-700">User Name</TableHead>
                            <TableHead className="font-medium text-gray-700">Category</TableHead>
                            <TableHead className="font-medium text-gray-700">Subcategory</TableHead>
                            <TableHead className="font-medium text-gray-700">Request Date</TableHead>
                            {showActions && <TableHead className="font-medium text-gray-700">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-gray-50">
                                <TableCell className="py-3">{request.user_name}</TableCell>
                                <TableCell className="py-3">{getCategoryName(request.category_id)}</TableCell>
                                <TableCell className="py-3">{getSubcategoryName(request.subcategory_id)}</TableCell>
                                <TableCell className="py-3">
                                    {request.request_at
                                        ? new Date(request.request_at).toLocaleString()
                                        : "—"}
                                </TableCell>
                                {showActions && (
                                    <TableCell className="py-3 flex gap-2">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="h-8 px-3"
                                            onClick={async () => {
                                                try {
                                                    const response = await AxiosClient.put(`/admin/user_requests/${request.id}`, {
                                                        status: "accepted"
                                                    });
                                                    if (response.status === 201) {
                                                        toast.success("Request accepted successfully");
                                                        fetchRequestDetails();
                                                    }
                                                } catch (error: any) {
                                                    if (error.response) {
                                                        if (error.response.status == 400) {
                                                            toast.error(error.response.data.message || "Please select an action")
                                                        } else if (error.response.status == 500) {
                                                            toast.error(error.response.data.message || "Failed to reject request")
                                                        }
                                                    } else {
                                                        toast.error("Failed to accept request");
                                                    }
                                                }
                                            }}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="h-8 px-3"
                                            onClick={async () => {
                                                try {
                                                    const response = await AxiosClient.put(`/admin/user_requests/${request.id}`, {
                                                        status: "rejected"
                                                    });
                                                    if (response.status === 201) {
                                                        toast.success("Request rejected successfully");
                                                        fetchRequestDetails();
                                                    }
                                                } catch (error: any) {
                                                    if (error.response) {
                                                        if (error.response.status == 400) {
                                                            toast.error(error.response.data.message || "Please select an action")
                                                        } else if (error.response.status == 500) {
                                                            toast.error(error.response.data.message || "Failed to reject request")
                                                        }
                                                    } else {
                                                        toast.error("Failed to reject request");
                                                    }
                                                }
                                            }}
                                        >
                                            Reject
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Toaster position="top-center" />

            {/* Mobile Sidebar Toggle */}
            <button
                className="fixed top-4 left-4 md:hidden bg-white p-2 rounded-lg shadow-sm z-50 hover:bg-gray-100 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
            >
                <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex flex-col md:flex-row">
                {/* Sidebar - Reduced width to w-60 (15rem) */}
                <div
                    className={`fixed inset-y-0 left-0 w-60 bg-white shadow-lg transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 z-40`}
                >
                    <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                </div>

                {/* Main Content - Adjusted margin to match sidebar width */}
                <main className="flex-1 p-4 md:p-6 md:ml-[2rem] transition-all mt-16 md:mt-0">
                    <Card className="w-full shadow-sm border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-xl font-semibold text-gray-800">Blog Request History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <Tabs value={selectedTabs} onValueChange={setSelectedTabs}>
                                <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
                                    <TabsTrigger value="pending">Pending</TabsTrigger>
                                    <TabsTrigger value="accepted">Accepted</TabsTrigger>
                                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                                </TabsList>

                                <TabsContent value="pending" className="mt-4">
                                    {pendingRequest.length > 0
                                        ? renderTable(pendingRequest, true)
                                        : <div className="text-center py-8 text-gray-500">No pending requests found</div>
                                    }
                                </TabsContent>

                                <TabsContent value="accepted" className="mt-4">
                                    {acceptedRequest.length > 0
                                        ? renderTable(acceptedRequest)
                                        : <div className="text-center py-8 text-gray-500">No accepted requests found</div>
                                    }
                                </TabsContent>

                                <TabsContent value="rejected" className="mt-4">
                                    {rejectedRequest.length > 0
                                        ? renderTable(rejectedRequest)
                                        : <div className="text-center py-8 text-gray-500">No rejected requests found</div>
                                    }
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}

export default BlogRequest;