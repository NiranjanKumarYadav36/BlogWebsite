import { useEffect, useState } from 'react';
import AdminSideBar from '../../../components/AdminComponents/AdminSideBar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import AxiosClient from '../../../components/ApiClient/AxiosClient';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import { Menu } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "../../../components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

interface User {
    id: number;
    username: string;
    email: string;
    joined_at: string;
}

interface DeletedUser {
    user_id: number,
    username: string;
    email: string;
    deleted_at: string;
    id: number
}

const UsersList = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeUsers, setActiveUsers] = useState<User[]>([]);
    const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("active");

    useEffect(() => {
        fetchUsers();
        fetchDeletedUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await AxiosClient.get('/admin/users_list');
            if (response.status === 200 && Array.isArray(response.data.response)) {
                setActiveUsers(response.data.response);
            } else {
                setActiveUsers([]);
            }
        } catch (error) {
            toast.error("Failed to fetch active users.");
            setActiveUsers([]);
        }
    };

    const fetchDeletedUsers = async () => {
        try {
            const response = await AxiosClient.get('/admin/deleted_users_list');
            if (response.status === 200 && Array.isArray(response.data.response)) {
                setDeletedUsers(response.data.response);
            } else {
                setDeletedUsers([]);
            }
        } catch (error) {
            toast.error("Failed to fetch deleted users.");
            setDeletedUsers([]);
        }
    };

    const handleDelete = async () => {
        if (!selectedUserId) return;

        try {
            await AxiosClient.delete(`/admin/users_list/${selectedUserId}`);
            setActiveUsers(activeUsers.filter(user => user.id !== selectedUserId));
            fetchDeletedUsers(); // Refresh deleted users
            toast.success("User deleted successfully");
        } catch (error) {
            toast.error("Failed to delete user");
        }

        setSelectedUserId(null);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Toaster position="top-center" />

            {/* Mobile Sidebar Toggle */}
            <button
                className="fixed top-4 left-4 md:hidden bg-white p-2 rounded-lg shadow-sm z-50 hover:bg-gray-100 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
            >
                <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Sidebar - Fixed width */}
            <div
                className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } transition-transform duration-300 ease-in-out md:translate-x-0 md:relative z-40`}
            >
                <AdminSideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm md:hidden z-30"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content - Adjusted spacing */}
            <div className="flex-1 p-4 md:p-6 md:ml-8 overflow-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full max-w-xs grid-cols-2 mb-6">
                            <TabsTrigger value="active">Active Users</TabsTrigger>
                            <TabsTrigger value="deleted">Deleted Users</TabsTrigger>
                        </TabsList>

                        {/* Active Users Tab */}
                        <TabsContent value="active">
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="w-[80px]">ID</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right w-[120px]">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{user.id}</TableCell>
                                                <TableCell>{user.username}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {new Date(user.joined_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={() => setSelectedUserId(user.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the user account and all associated data.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                    onClick={handleDelete}
                                                                >
                                                                    Confirm Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {activeUsers.length === 0 && (
                                    <div className="py-6 text-center text-gray-500">
                                        No active users found
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Deleted Users Tab */}
                        <TabsContent value="deleted">
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="w-[80px]">User ID</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Deleted At</TableHead>
                                            <TableHead className="w-[80px]">ID</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deletedUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-gray-50">
                                                <TableCell>{user.user_id}</TableCell>
                                                <TableCell>{user.username}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {new Date(user.deleted_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-medium">{user.id}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {deletedUsers.length === 0 && (
                                    <div className="py-6 text-center text-gray-500">
                                        No deleted users found
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default UsersList;