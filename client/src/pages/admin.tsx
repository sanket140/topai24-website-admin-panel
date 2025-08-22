import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "@/components/admin/Dashboard";
import ProjectsManager from "@/components/admin/ProjectsManager";
import BlogsManager from "@/components/admin/BlogsManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [basicInfo, setBasicInfo] = useState({
    footerDescription: "",
    contactDetails: "",
    cityName: "",
    resendApiUrl: "",
  });

  useEffect(() => {
    const fetchBasicInfo = async () => {
      const { data, error } = await supabase
        .from("basic_info")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching basic info:", error);
      } else if (data) {
        setBasicInfo(data);
      }
    };

    fetchBasicInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const updateBasicInfo = async () => {
    const { data, error } = await supabase
      .from("basic_info")
      .upsert([basicInfo], { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Error updating basic info:", error);
    } else {
      alert("Basic info updated successfully!");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "projects":
        return <ProjectsManager />;
      case "blogs":
        return <BlogsManager />;
      case "settings":
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600 mt-2">
                Manage your admin panel settings and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Footer Description
                    </label>
                    <Input
                      type="text"
                      name="footerDescription"
                      value={basicInfo.footerDescription}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Details
                    </label>
                    <Input
                      type="text"
                      name="contactDetails"
                      value={basicInfo.contactDetails}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City Name
                    </label>
                    <Input
                      type="text"
                      name="cityName"
                      value={basicInfo.cityName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resend API URL
                    </label>
                    <Input
                      type="text"
                      name="resendApiUrl"
                      value={basicInfo.resendApiUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button onClick={updateBasicInfo}>Update Basic Info</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
}
