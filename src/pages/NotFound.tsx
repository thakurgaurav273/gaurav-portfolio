import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="container-custom flex min-h-screen flex-col items-start justify-center">
    <p className="eyebrow mb-4">404</p>
    <h1 className="display text-6xl">This page doesn't <em>exist</em>.</h1>
    <Link to="/" className="mt-6 text-sm font-medium link-underline">
      Back to the homepage
    </Link>
  </main>
);

export default NotFound;
