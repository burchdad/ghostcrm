interface AuthToggleProps {
  isLogin: boolean;
  onToggle: (isLogin: boolean) => void;
}

export default function AuthToggle({ isLogin, onToggle }: AuthToggleProps) {
  return (
    <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          isLogin 
            ? "bg-white text-blue-600 shadow-sm" 
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          !isLogin 
            ? "bg-white text-blue-600 shadow-sm" 
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}