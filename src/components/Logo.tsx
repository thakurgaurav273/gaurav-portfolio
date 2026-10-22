// GS monogram traced from public/logo_dark.png; inherits the text colour.
const LOGO_PATHS = [
  'M940 0 0 878l940 886V803H597v185h151v336L288 878l460-439v219h192z',
  'M1022 0l741 692h-260l-282-267v371h666l76 89-941 879v-646h199v206l357-336h-556z',
];

const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 1964 1764" fill="currentColor" aria-hidden className={className}>
    {LOGO_PATHS.map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);

export default Logo;
