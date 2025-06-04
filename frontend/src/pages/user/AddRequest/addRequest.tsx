import { useState, useEffect } from 'react'
import Header from '../../../components/Header/Header'
import Footer from '../../../components/Footer/Footer'
import AxiosClient from '../../../components/ApiClient/AxiosClient'
import { Button } from '../../../components/ui/button'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../../../components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Toaster, toast } from 'react-hot-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";

interface Request {
    id: number,
    user_id: number,
    category_id: number,
    subcategory_id: number,
    status: string,
    blog_id?: number,
    request_at: string
}

function AddRequest() {
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
    const [subcategories, setSubCategories] = useState<{ id: number, name: string, cateogry_id: number }[]>([])
    const [categoryId, setCategoryId] = useState<number | null>(null)
    const [subcategoryId, setSubcategoryId] = useState<number | null>(null)
    const selectedCategory = categories.find(c => c.id === categoryId)
    const selectedSubcategory = subcategories.find(sc => sc.id === subcategoryId)

    const [allSubcategories, setAllSubCategories] = useState<{ id: number, name: string, cateogry_id: number }[]>([])
    const [selectedTabs, setSelectedTabs] = useState("pending");
    const [acceptedRequest, setAcceptedRequest] = useState<Request[]>([])
    const [pendingRequest, setPendingRequest] = useState<Request[]>([])
    const [rejectedRequest, setRejectedRequest] = useState<Request[]>([])

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
                console.error("Error fetching categories:", error)
            }
        }
        fetchAllSubCategories();
        fetchCategories();
        fetchRequestDetails();
    }, [])

    const fetchRequestDetails = async () => {
        try {
            const response = await AxiosClient.get("/user/fetchrequest")

            if (response.status == 201) {
                setAcceptedRequest(response.data.accpetedRequest)
                setPendingRequest(response.data.pendingRequest)
                setRejectedRequest(response.data.rejectedRequest)
            } else {
                setAcceptedRequest([])
                setPendingRequest([])
                setRejectedRequest([])
            }
        } catch (error: any) {
            if (error.response) {
                if (error.response.status == 400) {
                    toast.error(error.response.data.message || "")
                } else if (error.response.status == 500) {
                    toast.error(error.response.data.message || "")
                }
            } else {
                toast.error("Something went wrong")
            };
        }
    };

    useEffect(() => {
        if (categoryId) {
            const fetchSubcategories = async () => {
                try {
                    const response = await AxiosClient.get(`/admin/add_blog/subcategories?category_id=${categoryId}`)
                    setSubCategories(response.data.subcategories || [])
                } catch (error) {
                    console.error("Error fetching subcategories:", error)
                }
            }
            fetchSubcategories()
        } else {
            setSubCategories([])
        }
    }, [categoryId])

    const handleRequest = async () => {
        try {
            if (!categoryId || !subcategoryId) {
                toast.error("Please select both category and subcategory!")
                return;
            }

            const response = await AxiosClient.post("/user/requestblog", {
                category_id: categoryId,
                subcategory_id: subcategoryId
            });

            if (response.status == 201) {
                toast.success(response.data.message || "Request made successfully!")
                 
                await fetchRequestDetails();
            };
        } catch (error: any) {
            if (error.response) {
                if (error.response.status == 400) {
                    toast.error(error.response.data.message || "Please select both category and subcategory!")
                } else if (error.response.status == 500) {
                    toast.error(error.response.data.message || "Something went wrong!")
                }
            } else {
                toast.error("Internal server error")
            };
        };
    };

    const renderTable = (request: Request[] | undefined) => {
        if (!request || request.length === 0) {
            return <p>No request</p>;
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Subcategory</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {request.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">
                                {getCategoryName(req.category_id)}
                            </TableCell>
                            <TableCell>{getSubcategoryName(req.subcategory_id)}</TableCell>
                            <TableCell>{req.status}</TableCell>
                            <TableCell>{new Date(req.request_at).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <div className="bg-gray-300 flex flex-col min-h-screen">
            <Toaster position='top-center' />
            <Header />
            <main className="flex-grow justify-center items-center flex p-4">
                <Card className="w-[1400px] shadow-lg">
                    <CardHeader>
                        <CardTitle className='text-center text-2xl'>Your Blog Request History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex gap-4 mb-4 items-center justify-center'>
                            {/* Category Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        {selectedCategory ? selectedCategory.name : 'Select Category'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Categories</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {categories.map(category => (
                                        <DropdownMenuItem
                                            key={category.id}
                                            onSelect={() => setCategoryId(category.id)}
                                        >
                                            {category.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* SubCategory Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" disabled={!categoryId}>
                                        {selectedSubcategory ? selectedSubcategory.name : 'Select SubCategory'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>SubCategories</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {subcategories.map(sub => (
                                        <DropdownMenuItem
                                            key={sub.id}
                                            onSelect={() => setSubcategoryId(sub.id)}
                                        >
                                            {sub.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button onClick={handleRequest}>
                                Make Request
                            </Button>
                        </div>

                        <Tabs value={selectedTabs} onValueChange={setSelectedTabs}>
                            <TabsList>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                            </TabsList>

                            <TabsContent value="pending">
                                {renderTable(pendingRequest)}
                            </TabsContent>
                            <TabsContent value="accepted">
                                {renderTable(acceptedRequest)}
                            </TabsContent>
                            <TabsContent value="rejected">
                                {renderTable(rejectedRequest)}
                            </TabsContent>
                        </Tabs>



                        {/* You can add table/list of requests here in the future */}
                    </CardContent>
                    <CardFooter>
                        {/* Pagination or action buttons go here */}
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default AddRequest;