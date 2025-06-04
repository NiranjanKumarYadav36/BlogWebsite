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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../../components/ui/dialog";
import { Input } from '../../../components/ui/input';
import { CalendarDays, ArrowRight, Loader2, FileSearch } from 'lucide-react';
import slugify from 'slugify';

function PublicHomePage() {
  interface Blog {
    id: number,
    title: string,
    description: string,
    updated_at: string,
    cover_image: string,
  }

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Changed to true initially

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await AxiosClient.get(`/user/blogs?page=${page}&limit=6${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSubscribeDialog(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleSearch = () => {
    setPage(1);
  }

  const handleSubscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await AxiosClient.post('/newsletter/subscribe', { email });
      if (response.status == 201) {
        setSubscriptionSuccess(true);
      }
    } catch (error: any) {
      if (error.response && error.response.status == 400) {
        setError(error.response.data.message || 'You are already subscribed!')
      } else {
        setError("Subscription failed. Please try again later.")
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-gray-300'>
      <Header />
      <div className='container mx-auto px-4 py-6 pt-24'>
        <div className='flex justify-end mb-6'>
          <div className="relative w-[250px]">
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin h-12 w-12 text-blue-500 mb-4" />
              <p className="text-gray-600">Loading blogs...</p>
            </div>
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {blogs.map((blog) => (
                <Card key={blog.id} className="hover:shadow-xl transition-all duration-300 bg-white rounded-xl border overflow-hidden flex flex-col h-full p-0 hover:-translate-y-1">
                  <div className="relative w-full aspect-[16/9]">
                    <img
                      src={blog.cover_image || "/default-cover.jpg"}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                  <CardContent className={`flex flex-col flex-grow p-5 space-y-3`}>
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
                          to={`/public_blogs/${slugify(blog.title, { strict: true, lower: true })}`}
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
                        className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FileSearch className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No blogs found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery ? "Try a different search term" : "Check back later for new posts"}
            </p>
          </div>
        )}
      </div>
      <Footer />

      {/* Newsletter Subscription Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to our Newsletter</DialogTitle>
            <DialogDescription>
              {subscriptionSuccess
                ? "Thank you for subscribing! You'll receive our latest updates soon."
                : "Stay updated with our latest blog posts and news. Enter your email below."}
            </DialogDescription>
          </DialogHeader>

          {!subscriptionSuccess ? (
            <>
              {error && (
                <div className="text-red-600 bg-red-100 border border-red-400 p-2 rounded-md text-center">
                  {error}
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PublicHomePage;