import React, { useState, useEffect } from "react";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import AxiosClient from "../../components/ApiClient/AxiosClient";
interface Blog {
  id: number,
  title: string,
  description: string,
  created_at: string,
  updated_at: string
}


const HomePage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const response = await AxiosClient.get("/latest_blogs");
      if (response.status === 201) {
        setBlogs(response.data.response);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-gray-900">
      {/* Quote Section */}
      <section className="text-center py-12 bg-[#1E3A8A] text-white px-6">
        <h1 className="text-4xl font-extrabold mb-4">Welcome to <span className="text-[#FFD700]">MyBlog</span></h1>
        <p className="text-lg italic opacity-90">“Writing is the painting of the voice.” – Voltaire</p>
      </section>

      {/* Latest Blogs Section */}
      <section className="container mx-auto my-12 px-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#1E40AF]">Latest Blogs</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-xl transition-shadow duration-300 bg-white rounded-lg border border-gray-200">
              <CardContent className="p-6">
                <CardTitle className="text-xl font-semibold text-[#1E40AF]">{blog.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-2 line-clamp-3">{blog.description}</CardDescription>

              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Explore More Section */}
      <div className="text-center my-12">
        <Button className="bg-[#1E40AF] text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-[#FFD700] hover:text-black transition-all">
          <Link to="/login">Explore More</Link>
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;