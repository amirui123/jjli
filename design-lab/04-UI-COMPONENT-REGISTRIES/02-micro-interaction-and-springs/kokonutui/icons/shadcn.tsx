const ShadcnIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 256 256"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Shadcn UI</title>
    <path d="M0 0h256v256H0z" fill="none" />
    <path
      d="M208 128l-80 80M192 40L40 192"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={25}
    />
  </svg>
);
export default ShadcnIcon;
