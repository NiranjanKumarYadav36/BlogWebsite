import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { FaPenFancy, FaBookOpen, FaLightbulb } from 'react-icons/fa';

function AboutPage() {
  return (
    <div className='bg-gray-50 min-h-screen flex flex-col'>
      <Header />
      
      <main className='flex-grow container mx-auto px-4 py-12 mt-9'>
        {/* Hero Section */}
        <section className='text-center mb-16'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-800 mb-4'>Our Story</h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Sharing knowledge, inspiring creativity, and building a community of passionate learners.
          </p>
        </section>

        {/* Mission Section */}
        <section className='max-w-6xl mx-auto mb-20'>
          <div className='bg-white p-8 md:p-12 rounded-xl shadow-lg'>
            <h2 className='text-3xl font-bold text-gray-800 mb-6'>Why We Started</h2>
            <div className='prose-lg text-gray-700 space-y-4'>
              <p>
                Founded in 2025, our blog began as a personal passion project and has grown into a thriving community.
              </p>
              <p>
                Our mission is to cut through the noise and deliver authentic, well-researched content that actually helps 
                people in their daily lives and professional journeys.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className='max-w-6xl mx-auto mb-20'>
          <h2 className='text-3xl font-bold text-center text-gray-800 mb-12'>Our Core Values</h2>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Value 1 */}
            <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300'>
              <div className='bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4'>
                <FaPenFancy className='text-blue-600 text-2xl' />
              </div>
              <h3 className='text-xl font-semibold mb-3 text-gray-800'>Quality Content</h3>
              <p className='text-gray-600'>
                Every article undergoes rigorous research and editing to ensure we deliver only the best to our readers.
              </p>
            </div>

            {/* Value 2 */}
            <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300'>
              <div className='bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4'>
                <FaBookOpen className='text-green-600 text-2xl' />
              </div>
              <h3 className='text-xl font-semibold mb-3 text-gray-800'>Continuous Learning</h3>
              <p className='text-gray-600'>
                We're committed to growing alongside our audience, constantly exploring new topics and perspectives.
              </p>
            </div>

            {/* Value 3 */}
            <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300'>
              <div className='bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-4'>
                <FaLightbulb className='text-purple-600 text-2xl' />
              </div>
              <h3 className='text-xl font-semibold mb-3 text-gray-800'>Authenticity</h3>
              <p className='text-gray-600'>
                We keep it real - no fluff, no filler, just honest insights you can actually use.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className='max-w-6xl mx-auto'>
          <h2 className='text-3xl font-bold text-center text-gray-800 mb-12'>Meet the Creator</h2>
          
          <div className='bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto'>
            <div className='md:flex'>
              <div className='md:w-1/3'>
                <div className='h-full bg-gray-200 flex items-center justify-center p-6'>
                  <span className='text-gray-500 text-lg'>Creator Photo</span>
                </div>
              </div>
              <div className='md:w-2/3 p-8'>
                <h3 className='text-2xl font-bold text-gray-800 mb-2'>Alex Johnson</h3>
                <p className='text-blue-600 font-medium mb-4'>Founder & Lead Writer</p>
                <p className='text-gray-700 mb-4'>
                  With over 8 years of experience in content creation and digital marketing, Alex started this blog 
                  to share practical knowledge in an accessible way.
                </p>
                <p className='text-gray-700'>
                  When not writing, you'll find them hiking mountains or experimenting in the kitchen.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export default AboutPage;