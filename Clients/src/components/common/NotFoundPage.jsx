import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/common/PageTransition";
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          The insurance portal you are looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Return Home
        </button>
      </div>
    </PageTransition>
  );
}
