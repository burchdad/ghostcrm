import { Car, Users, TrendingUp, Zap } from "lucide-react";

export default function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white p-8 md:p-12 flex-col justify-between">
      <div className="pt-16">
        <div className="flex items-center mb-12">
          <Car className="w-10 h-10 mr-3" />
          <h1 className="text-3xl font-bold">Ghost Auto CRM</h1>
        </div>
        
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Transform Your Automotive Sales with
            <span className="block text-blue-200 mt-2">Intelligent CRM</span>
          </h2>
          
          <p className="text-xl text-blue-100">
            Streamline your dealership operations, boost sales, and deliver exceptional customer experiences with our comprehensive automotive CRM platform.
          </p>

          <div className="grid grid-cols-1 gap-6 mt-12">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 rounded-lg p-2">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Lead Management</h3>
                <p className="text-blue-200">Capture, qualify, and convert leads with intelligent automation</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500 rounded-lg p-2">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Sales Analytics</h3>
                <p className="text-blue-200">Real-time insights and performance tracking</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-500 rounded-lg p-2">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Workflow Automation</h3>
                <p className="text-blue-200">Automate follow-ups, tasks, and customer communications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-blue-200">
        <p>&copy; 2025 Ghost Auto CRM. Empowering automotive excellence.</p>
      </div>
    </div>
  );
}