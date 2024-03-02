import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import { Category } from "../types";

export default function useGetCategories() {
  const supabase = createClientComponentClient();
  const { data, refetch, isFetching, isFetched } = useQuery({
    queryKey: ["category"],
    queryFn: () =>
      supabase
        .from("category")
        .select()
        .then((e) => e.data) as Promise<Array<Category>>,
    initialData: [],
  });

  return {
    categories: data,
    refetch,
    isFetching,
    isFetched,
  };
}
