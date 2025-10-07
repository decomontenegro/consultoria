export default function LightbulbIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="animate-pulse-slow">
        <path
          d="M9 21H15M12 3C8.68629 3 6 5.68629 6 9C6 10.8954 6.87877 12.5831 8.24003 13.6338C8.69689 14.0089 9 14.5743 9 15.1856V16C9 16.5523 9.44772 17 10 17H14C14.5523 17 15 16.5523 15 16V15.1856C15 14.5743 15.3031 14.0089 15.76 13.6338C17.1212 12.5831 18 10.8954 18 9C18 5.68629 15.3137 3 12 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neon-green"
        />
      </g>
      <path
        d="M10 17V18C10 19.1046 10.8954 20 12 20C13.1046 20 14 19.1046 14 18V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-neon-green"
      />
    </svg>
  );
}
