"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const services = [
  {
    name: "Transfers",
    isAvailable: true,
    providers: ["Paystack", "Flutterwave", "Monnify"],
    currentProvider: "Paystack"
  },
  {
    name: "Airtime Purchase",
    isAvailable: true,
    providers: ["VTPass", "Payscribe", "Reloadly"],
    currentProvider: "VTPass"
  },
  {
    name: "Data",
    isAvailable: true,
    providers: ["VTPass", "Payscribe", "Reloadly"],
    currentProvider: "Payscribe"
  },
  {
    name: "Airtime to Cash",
    isAvailable: false,
    providers: ["Internal", "ThirdParty"],
    currentProvider: "Internal"
  },
  {
    name: "USD Virtual Card",
    isAvailable: true,
    providers: ["Flutterwave", "Union", "Kadick"],
    currentProvider: "Flutterwave"
  },
  {
    name: "NGN Virtual Card",
    isAvailable: true,
    providers: ["Flutterwave", "Union", "Kadick"],
    currentProvider: "Flutterwave"
  },
  {
    name: "NGN Physical Card",
    isAvailable: true,
    providers: ["Union", "Kadick"],
    currentProvider: "Union"
  },
  {
    name: "Joint Account",
    isAvailable: true,
    providers: ["Internal", "ThirdParty"],
    currentProvider: "Internal"
  },
  {
    name: "Referral",
    isAvailable: true,
    providers: ["Internal", "ThirdParty"],
    currentProvider: "Internal"
  }
];

export default function ServiceManagement() {
  const [serviceStates, setServiceStates] = useState(services);

  const handleAvailabilityChange = (index: number, checked: boolean) => {
    setServiceStates(prev => 
      prev.map((service, i) => 
        i === index ? { ...service, isAvailable: checked } : service
      )
    );
  };

  const handleProviderChange = (index: number, value: string) => {
    setServiceStates(prev => 
      prev.map((service, i) => 
        i === index ? { ...service, currentProvider: value } : service
      )
    );
  };

  const handleSaveChanges = () => {
    // Here you would typically save the changes to your backend
    console.log("Saving changes:", serviceStates);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Service Management</h2>
        </div>
        
        <Tabs defaultValue="availability" className="space-y-6">
          <TabsList>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="provider">Provider</TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="space-y-6">
            {serviceStates.map((service, index) => (
              <div key={service.name} className="flex items-center justify-between">
                <Label htmlFor={`${service.name}-switch`}>{service.name}</Label>
                <Switch
                  id={`${service.name}-switch`}
                  checked={service.isAvailable}
                  onCheckedChange={(checked) => handleAvailabilityChange(index, checked)}
                />
              </div>
            ))}
            <Button onClick={handleSaveChanges} className="w-full mt-6">
              Save Changes
            </Button>
          </TabsContent>

          <TabsContent value="provider" className="space-y-6">
            {serviceStates.map((service, index) => (
              <div key={service.name} className="grid gap-2">
                <Label htmlFor={`${service.name}-provider`}>{service.name}</Label>
                <Select
                  value={service.currentProvider}
                  onValueChange={(value) => handleProviderChange(index, value)}
                >
                  <SelectTrigger id={`${service.name}-provider`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {service.providers.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button onClick={handleSaveChanges} className="w-full mt-6">
              Save Changes
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}