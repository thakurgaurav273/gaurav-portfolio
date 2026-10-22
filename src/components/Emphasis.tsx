import { Fragment } from 'react';

// Renders *word* segments as <em>, so headline copy stored in the database can carry emphasis.
const Emphasis = ({ text }: { text: string }) => (
  <>
    {text.split(/(\*[^*]+\*)/g).map((part, i) =>
      part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
        <em key={i}>{part.slice(1, -1)}</em>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    )}
  </>
);

export default Emphasis;
