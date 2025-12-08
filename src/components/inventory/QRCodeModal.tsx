"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  QrCode, 
  Printer, 
  Save, 
  Calendar, 
  Camera, 
  FileText, 
  Car, 
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Settings,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: any;
}

interface QRFeature {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  config?: any;
}

export default function QRCodeModal({ isOpen, onClose, vehicle }: QRCodeModalProps) {
  const { toast } = useToast();
  
  // Debug logging
  console.log("🔍 [QR MODAL] Component rendered with props:", { isOpen, vehicle: vehicle?.id });
  
  // QR Configuration State
  const [qrConfig, setQRConfig] = useState({
    vehicleInfo: {
      showPrice: true,
      showMileage: true,
      showFeatures: true,
      showSpecs: true,
      customDescription: "",
      highlightedFeatures: [] as string[]
    },
    photos: {
      enabled: true,
      selectedPhotos: [] as string[],
      allowUploads: false,
      maxPhotos: 10
    },
    testDrive: {
      enabled: true,
      allowScheduling: true,
      availableTimes: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
      requiresApproval: true,
      customMessage: "Schedule your test drive today!"
    },
    contact: {
      enabled: true,
      salesPerson: {
        name: "John Doe",
        phone: "(555) 123-4567",
        email: "john.doe@burchmotors.com"
      },
      dealership: {
        name: "Burch Motors",
        address: "123 Main St, City, ST 12345",
        phone: "(555) 987-6543"
      }
    },
    financing: {
      enabled: true,
      showCalculator: true,
      showIncentives: true,
      customOffers: [] as string[]
    },
    reviews: {
      enabled: true,
      allowNewReviews: true,
      showRating: true
    }
  });

  const [availableFeatures, setAvailableFeatures] = useState<QRFeature[]>([
    {
      id: "vehicle_info",
      name: "Vehicle Information",
      description: "Display detailed vehicle specifications and features",
      icon: Car,
      enabled: true
    },
    {
      id: "photo_gallery",
      name: "Photo Gallery", 
      description: "Interactive photo gallery with high-resolution images",
      icon: Camera,
      enabled: true
    },
    {
      id: "test_drive",
      name: "Test Drive Booking",
      description: "Allow customers to schedule test drives directly",
      icon: Calendar,
      enabled: true
    },
    {
      id: "contact_dealer",
      name: "Contact Information",
      description: "Sales person and dealership contact details",
      icon: Phone,
      enabled: true
    },
    {
      id: "financing",
      name: "Financing Options",
      description: "Payment calculator and financing information",
      icon: DollarSign,
      enabled: true
    },
    {
      id: "reviews",
      name: "Customer Reviews",
      description: "Display and collect customer reviews",
      icon: Star,
      enabled: false
    },
    {
      id: "location",
      name: "Dealership Location", 
      description: "Interactive map and directions",
      icon: MapPin,
      enabled: true
    }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeUrl, setQRCodeUrl] = useState("");

  useEffect(() => {
    if (vehicle && isOpen) {
      generateQRCodeUrl();
    }
  }, [vehicle, isOpen]);

  const generateQRCodeUrl = () => {
    if (!vehicle) return;
    
    // Generate QR code URL based on vehicle ID and current config
    const baseUrl = window.location.origin;
    const qrUrl = `${baseUrl}/inventory/qr-vehicle-profile/${vehicle.id || vehicle.sku}`;
    setQRCodeUrl(qrUrl);
  };

  const handleSaveConfiguration = async () => {
    if (!vehicle) {
      toast({
        title: "Error",
        description: "No vehicle selected for configuration.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Save QR configuration to database
      const response = await fetch(`/api/inventory/qr-config/${vehicle.id || vehicle.sku}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: vehicle.id || vehicle.sku,
          config: qrConfig,
          features: availableFeatures
        }),
      });

      if (response.ok) {
        toast({
          title: "Configuration Saved",
          description: "QR code configuration has been updated successfully.",
        });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save QR code configuration.",
        variant: "destructive",
      });
    }
  };

  const handlePrintQRCode = () => {
    if (!vehicle) {
      toast({
        title: "Error",
        description: "No vehicle selected for QR code generation.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Generate QR code with current configuration and open print window
      const printUrl = `/inventory/qr-vehicle-profile/${vehicle.id || vehicle.sku}?print=true&config=${encodeURIComponent(JSON.stringify(qrConfig))}`;
      const printWindow = window.open(printUrl, '_blank', 'width=800,height=600');
      
      if (printWindow) {
        printWindow.focus();
        
        // Auto-print when page loads
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 1000);
        };
      }

      toast({
        title: "QR Code Generated",
        description: "QR code is being prepared for printing.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code for printing.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    setAvailableFeatures(prev => 
      prev.map(feature => 
        feature.id === featureId 
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
  };

  const updateQRConfig = (section: string, updates: any) => {
    setQRConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  console.log("🔍 [QR MODAL] Rendering with vehicle:", vehicle);
  console.log("🔍 [QR MODAL] isOpen:", isOpen);
  console.log("🔍 [QR MODAL] onClose function:", typeof onClose);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 9999 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Configuration - {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Available Features</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Select which features and information will be accessible through the QR code
                  </p>
                </div>
                
                <div className="grid gap-3">
                  {availableFeatures.map((feature) => {
                    const IconComponent = feature.icon;
                    return (
                      <Card key={feature.id} className={`cursor-pointer transition-colors ${feature.enabled ? 'ring-2 ring-orange-500' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-5 w-5 text-orange-500" />
                              <div>
                                <h4 className="font-medium">{feature.name}</h4>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                              </div>
                            </div>
                            <Checkbox
                              checked={feature.enabled}
                              onCheckedChange={() => toggleFeature(feature.id)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid gap-6">
                {/* Vehicle Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showPrice"
                          checked={qrConfig.vehicleInfo.showPrice}
                          onCheckedChange={(checked) => 
                            updateQRConfig('vehicleInfo', { showPrice: checked })
                          }
                        />
                        <Label htmlFor="showPrice">Show Price</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showMileage"
                          checked={qrConfig.vehicleInfo.showMileage}
                          onCheckedChange={(checked) => 
                            updateQRConfig('vehicleInfo', { showMileage: checked })
                          }
                        />
                        <Label htmlFor="showMileage">Show Mileage</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customDescription">Custom Description</Label>
                      <Textarea
                        id="customDescription"
                        placeholder="Add a custom description for this vehicle..."
                        value={qrConfig.vehicleInfo.customDescription}
                        onChange={(e) => 
                          updateQRConfig('vehicleInfo', { customDescription: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Test Drive Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Test Drive Scheduling
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowScheduling"
                        checked={qrConfig.testDrive.allowScheduling}
                        onCheckedChange={(checked) => 
                          updateQRConfig('testDrive', { allowScheduling: checked })
                        }
                      />
                      <Label htmlFor="allowScheduling">Allow Online Scheduling</Label>
                    </div>
                    <div>
                      <Label htmlFor="testDriveMessage">Custom Message</Label>
                      <Input
                        id="testDriveMessage"
                        value={qrConfig.testDrive.customMessage}
                        onChange={(e) => 
                          updateQRConfig('testDrive', { customMessage: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salesPersonName">Sales Person</Label>
                        <Input
                          id="salesPersonName"
                          value={qrConfig.contact.salesPerson.name}
                          onChange={(e) => 
                            updateQRConfig('contact', { 
                              salesPerson: { ...qrConfig.contact.salesPerson, name: e.target.value }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="salesPersonPhone">Phone</Label>
                        <Input
                          id="salesPersonPhone"
                          value={qrConfig.contact.salesPerson.phone}
                          onChange={(e) => 
                            updateQRConfig('contact', { 
                              salesPerson: { ...qrConfig.contact.salesPerson, phone: e.target.value }
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      QR Code Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>QR Code URL</Label>
                        <div className="flex gap-2">
                          <Input value={qrCodeUrl} readOnly className="font-mono text-sm" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(qrCodeUrl);
                              toast({ title: "URL Copied", description: "QR code URL copied to clipboard" });
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Vehicle ID</Label>
                        <Input value={vehicle?.id || vehicle?.sku || 'N/A'} readOnly />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Analytics & Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>QR Code Scans</span>
                        <Badge>0</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Test Drive Requests</span>
                        <Badge>0</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Contact Inquiries</span>
                        <Badge>0</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">QR Code Preview</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {vehicle?.year || 'N/A'} {vehicle?.make || ''} {vehicle?.model || ''}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Enabled Features:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {availableFeatures
                      .filter(feature => feature.enabled)
                      .map(feature => (
                        <Badge key={feature.id} variant="outline">
                          {feature.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSaveConfiguration} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Configuration
              </Button>
            </div>
            
            <Button 
              onClick={handlePrintQRCode}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  Print QR Code
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}