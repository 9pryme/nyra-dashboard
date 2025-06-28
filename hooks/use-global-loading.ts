import { useLoading } from "@/lib/context/LoadingContext";

export function useGlobalLoading() {
  const { isLoading, setLoading } = useLoading();

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);
  
  const withLoading = async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    showLoading();
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setTimeout(hideLoading, 300); // Small delay for smooth UX
    }
  };

  return {
    isLoading,
    showLoading,
    hideLoading,
    withLoading,
  };
} 