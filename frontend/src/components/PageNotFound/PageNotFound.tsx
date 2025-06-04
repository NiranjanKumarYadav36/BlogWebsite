import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

function PageNotFound() {
  return (
    <div className="flex flex-col bg-gray-300 justify-center items-center min-h-screen text-center px-6">
      <h1 className="text-7xl font-bold mb-2 animate-bounce">404</h1>
      <h3 className="mt-3 text-lg font-light font-mono ml-12">
        Looks like you've ventured into the unknown digital realm.
      </h3>
      <Button asChild className="mt-6" variant="link">
        <Link to="/blogs">Return to Website</Link>
      </Button>
    </div>
  );
}

export default PageNotFound;