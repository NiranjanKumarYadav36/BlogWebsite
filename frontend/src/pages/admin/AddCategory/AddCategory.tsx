import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import AdminSideBar from '../../../components/AdminComponents/AdminSideBar';
import { Menu, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../../components/ui/accordion';
import AxiosClient from '../../../components/ApiClient/AxiosClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
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
import BlogCharts from './BlogCharts';

interface Category {
    id: number,
    name: string
}

interface SubCategory extends Category {
    category_id: number
}

function AddCategory() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [newSubcategory, setNewSubcategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        fetchCategoriesAndSubcategories();
    }, []);

    const fetchCategoriesAndSubcategories = async () => {
        try {
            const [categoriesResponse, subcategoriesResponse] = await Promise.all([
                AxiosClient.get("/admin/manage_categories/categories"),
                AxiosClient.get("/admin/manage_categories/subcategories")
            ]);

            setCategories(categoriesResponse.data.data || []);
            setSubcategories(subcategoriesResponse.data.data || []);

        } catch (error) {
            toast.error("Failed to load categories and subcategories!");
            setCategories([]);
            setSubcategories([]);
        }
    };

    const handleAddCategory = async () => {
        if (newCategory.trim() === "") {
            toast.error("Category name cannot be empty!");
            return;
        }
        try {
            const response = await AxiosClient.post("/admin/manage_categories/add_categories", {
                name: newCategory
            });

            if (response.status === 201 && response.data.success) {
                toast.success("Category added successfully!");
                fetchCategoriesAndSubcategories();
                setNewCategory("");
            }
        } catch (error: any) {
            if (error.response) {
                const { status, data } = error.response;
                if (status === 400 || status === 409) {
                    toast.error(data.message);
                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } else {
                toast.error("Network error. Please try again.");
            }
        }
    };


    const handleAddSubcategory = async () => {
        if (newSubcategory.trim() === '' || !selectedCategory) {
            toast.error('Select a category and enter a subcategory name!');
            return;
        }

        try {
            const response = await AxiosClient.post("/admin/manage_categories/add_subcategories", {
                category_id: Number(selectedCategory),
                name: newSubcategory
            })
            if (response.status === 201 && response.data.success) {
                toast.success("Subcategory added successfully!");
                // setSubcategories([...subcategories, response.data.data]);
                fetchCategoriesAndSubcategories()
                setNewSubcategory("");
                setSelectedCategory(null)
            }
        } catch (error: any) {
            if (error.response) {
                const { status, data } = error.response;
                if (status === 400 || status === 409) {
                    toast.error(data.message);
                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } else {
                toast.error("Network error. Please try again.");
            }
        }
    };

    const handleRemoveCategory = async (categoryId: number) => {
        try {
            const response = await AxiosClient.delete(`/admin/manage_categories/delete_categories/${categoryId}`)
            if (response.status == 200 && response.data.success == true) {
                fetchCategoriesAndSubcategories()
                setCategories(categories.filter(cat => cat.id != categoryId));
                setSubcategories(subcategories.filter(sub => sub.category_id !== categoryId));
                toast.success('Category and its subcategories removed!');
            }
        } catch (error) {
            toast.error(`Failed to delete`)
        }
    };

    const handleRemoveSubcategory = async (subcategoryId: number) => {
        try {
            const response = await AxiosClient.delete(`/admin/manage_categories/delete_subcategories/${subcategoryId}`)
            if (response.status == 200 && response.data.success == true) {
                fetchCategoriesAndSubcategories()
                setSubcategories(subcategories.filter(sub => sub.id != subcategoryId));
                toast.success('Subcategory removed!');
            }
        } catch (error) {
            toast.error(`Failed to delete`)
        }
    };

    return (
        <div className='flex min-h-screen bg-gray-100'>
            <Toaster position='top-center' />
            <button
                className='absolute top-4 left-4 md:hidden bg-white p-2 rounded-full shadow-md'
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className='w-6 h-6' />
            </button>

            <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform md:translate-x-0 md:relative md:block z-50 block h-fit min-h-screen`}>
                <AdminSideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            </div>
            {isSidebarOpen && <div className='fixed inset-0 bg-black opacity-50 md:hidden' onClick={() => setIsSidebarOpen(false)} />}

            <div className='flex flex-1 gap-6 p-6'>
                <Card className='w-1/2'>
                    <CardHeader>
                        <CardTitle>
                            <p className='mb-2'>Total Categories : {categories.length}</p>
                            <p>Total SubCategories : {subcategories.length}</p>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type='single' collapsible>
                            {categories.map(category => (
                                <AccordionItem key={category.id} value={category.name}>
                                    <AccordionTrigger>{category.name}</AccordionTrigger>
                                    <AccordionContent>
                                        <ul className='space-y-2'>
                                            {subcategories.filter(sub => sub.category_id === category.id).map(sub => (
                                                <li key={sub.id} className='flex justify-between items-center bg-gray-100 p-2 rounded-md'>
                                                    <span>{sub.name}</span>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                            >
                                                                <Trash2 className='w-5 h-5' />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the SubCategory.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleRemoveSubcategory(sub.id)}>
                                                                    Yes, Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </li>
                                            ))}
                                        </ul>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className='mt-2'
                                                >
                                                    Remove Category
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the Category.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleRemoveCategory(category.id)}>
                                                        Yes, Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>

                <Card className='w-1/2'>
                    <CardHeader>
                        <CardTitle>Add Category & Subcategory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex gap-2 mb-4'>
                            <Input placeholder='Enter category name' value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                            <Button onClick={handleAddCategory}><PlusCircle className='w-5 h-5 mr-2' /> Add Category</Button>
                        </div>
                        <div className='flex gap-2'>
                            <Select onValueChange={(value) => setSelectedCategory(value)}>
                                <SelectTrigger className='flex-1'>
                                    <SelectValue placeholder="Select a Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input placeholder='Enter subcategory name' value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} />
                            <Button onClick={handleAddSubcategory}><PlusCircle className='w-5 h-5 mr-2' /> Add Subcategory</Button>
                        </div>

                        <div className='mt-8 ml-60'>
                            <h1 className='text-xl font-bold text-red-500'>Inisghts</h1>
                            <BlogCharts />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default AddCategory;