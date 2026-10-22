import Navigation from '@/components/Navigation';

// Header for inner pages (project archive and case studies): the shared nav plus a back link.
const PageHeader = ({ back }: { back?: { to: string; label: string } }) => (
  <>
    <Navigation back={back ?? { to: '/', label: 'Home' }} />
    {/* The nav is fixed, so reserve its height. */}
    <div className="h-20 sm:h-24" aria-hidden />
  </>
);

export default PageHeader;
