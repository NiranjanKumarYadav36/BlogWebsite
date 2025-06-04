import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import AxiosClient from '../../../components/ApiClient/AxiosClient';
import {
  CardContent,
  CardDescription,
  Card,
  CardTitle
} from "../../../components/ui/card";
import { Button } from '../../../components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "../../../components/ui/pagination";
import Sidebar from '../../../components/UserComponents/userSideBar';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs'; // ShadCN Tabs
import { ArrowRight, CalendarDays, FileSearch, LayoutGrid, List, Loader2 } from "lucide-react"; // Icons from Lucide React
import slugify from "slugify";
import { Input } from '../../../components/ui/input';

function UserHomePage() {
  interface Blog {
    id: number,
    title: string,
    description: string,
    updated_at: string,
    cover_image: string
  }

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);



  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await AxiosClient.get(
          `/user/blogs?page=${page}&limit=6${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`
        );
        if (response.status === 200) {
          setBlogs(response.data.blogs);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, [page, searchQuery]);

  const handleSearch = () => {
    setPage(1);
  }

  return (
    <div className='bg-gray-300 min-h-screen flex flex-col'>
      <Header />
      <div className='flex flex-1 relative'>
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed left-4 top-20 z-40 bg-gray-800 text-white p-2 rounded-md"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>

        {/* Sidebar */}
        <div className={` ${sidebarOpen ? 'fixed inset-0 z-30' : 'hidden'} md:block md:relative md:w-64 flex-shrink-0`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className='flex-1 container mx-auto px-4 py-6 pt-24'>
          {/* Tabs for View Mode Selection */}
          <div className="flex gap-4 justify-end mb-4">
            <Tabs defaultValue="grid" onValueChange={(val) => setViewMode(val as 'grid' | 'list')}>
              <TabsList className="bg-gray-400 rounded-sm p-1 flex">
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {/* Search Input with Icon */}
            <div className="relative w-[180px]">
              <Input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-10"
              />
              {isLoading ? (
                <Loader2
                  className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-gray-600"
                  size={18}
                />
              ) : (
                <FileSearch
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
                  size={18}
                  onClick={handleSearch}
                />
              )}
            </div>
          </div>




          {/* Blogs Rendering */}
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
            : 'flex flex-col lg:grid gap-8'}>
            {blogs.map((blog) => (
              <Card
                key={blog.id}
                className={`hover:shadow-xl transition-all duration-300 bg-white rounded-xl border overflow-hidden flex h-full p-0 hover:-translate-y-1 ${viewMode !== 'grid' ? 'lg:flex-row flex-col' : 'flex-col'
                  }`}
              >


                <div
                  className={`relative w-full ${viewMode === 'grid'
                    ? 'aspect-[13/3]'
                    : 'lg:w-1/2 lg:h-full aspect-[2/1] '
                    }`}
                >
                  <img
                    src={blog.cover_image ? blog.cover_image : "/default-cover.jpg"}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>


                <CardContent
                  className={`flex flex-col flex-grow p-5 space-y-3 ${viewMode !== 'grid' ? 'lg:w-1/2' : ''
                    }`}
                >


                  {/* Rest of your card content remains the same */}
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {new Date(blog.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>

                  <CardTitle className="text-xl font-bold text-gray-800 line-clamp-2">
                    {blog.title}
                  </CardTitle>

                  <CardDescription className="text-gray-600 line-clamp-3">
                    {blog.description}
                  </CardDescription>

                  <div className="mt-auto pt-4">
                    <Button
                      asChild
                      className="w-full bg-[#1E40AF] text-white hover:bg-[#1a3a9c] transition-colors"
                    >
                      <Link
                        to={`/blogs/${slugify(blog.title, { lower: true, strict: true })}`}
                        state={{ blogId: blog.id }}
                        className="flex items-center justify-center gap-2"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => setPage(index + 1)}
                        isActive={page === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default UserHomePage;