import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/supabase";
import { 
  FolderOpen, 
  FileText, 
  Eye, 
  Star,
  TrendingUp,
  Calendar
} from "lucide-react";

interface DashboardStats {
  totalProjects: number;
  publishedBlogs: number;
  featuredContent: number;
}

const statsConfig = [
  {
    title: "Total Projects",
    key: "totalProjects" as keyof DashboardStats,
    icon: FolderOpen,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Published Blogs", 
    key: "publishedBlogs" as keyof DashboardStats,
    icon: FileText,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Featured Content",
    key: "featuredContent" as keyof DashboardStats,
    icon: Star,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Total Views",
    key: "totalViews" as keyof DashboardStats,
    icon: Eye,
    color: "bg-orange-100 text-orange-600",
    value: "12,487", // Static value as not in database
  },
];

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Error Loading Dashboard</h3>
          <p className="text-sm">Failed to load dashboard statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your content.</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          let value: string | number;
          
          if (stat.value) {
            value = stat.value;
          } else if (isLoading) {
            value = "Loading...";
          } else if (stats) {
            value = stats[stat.key] || 0;
          } else {
            value = 0;
          }
          
          return (
            <Card key={stat.title} className="border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900" data-testid={`stat-${stat.key}`}>
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Dashboard accessed</p>
                  <p className="text-sm text-gray-500">Just now</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">System ready</p>
                  <p className="text-sm text-gray-500">Admin panel loaded successfully</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Use the navigation menu to:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <FolderOpen className="h-4 w-4 mr-2 text-blue-600" />
                  Manage your project portfolio
                </li>
                <li className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-green-600" />
                  Create and edit blog posts
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-purple-600" />
                  Feature important content
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
