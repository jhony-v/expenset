import dynamicIconImports from "lucide-react/dynamicIconImports";

export const CategoryOptions: Record<string, keyof typeof dynamicIconImports> =
  {
    love: "heart",
    me: "user",
    study: "school",
    entertainment: "gamepad-2",
    home: "house",
    trip: "plane",
    job: "briefcase",
    other: "layers-2",
    mom: "users",
  };
